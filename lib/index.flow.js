'use strict';

var fsp = require('fs-extra');
var gitClone = require('git-clone');
var rimraf = require('rimraf');
var path = require('path');
var ora = require('ora');
var chalk = require('chalk');
var request = require('request');
var utils = require('./utils');
var configInfo_json = 'config.info.json';
var packageConfig = require('./../package.json');

/**
 * 检查本地 cli 版本
 * 
 * @returns {Promise} 返回 Promise 继续回调
 */
function checkVersion() {
    // 命令行中显示 loading 等待中...
    var spinner = ora(chalk.gray('正在检查版本...')).start();

    return new Promise(function (resolve, reject) {
        // 请求查看 npmjs 获取包的信息
        request({
            url: 'https://registry.npmjs.org/cyy-cli',
            timeout: 2000
        }, function (err, res, body) {
            // 停止loading
            spinner.stop();

            // 请求 失败 或 超时
            if (err) {
                if (err.code === 'ETIMEDOUT') {
                    resolve('timeout');
                } else {
                    reject(err);
                }
                return;
            }

            // 请求最新版本成功
            if (res.statusCode == 200) {
                // 最新版本号和以前的版本号之间的对比，然后给出相应的提示信息
                var latestVersion = JSON.parse(body)['dist-tags'].latest;
                var localVersion = packageConfig.version;
                if (latestVersion !== localVersion) {
                    console.log(chalk.gray('cyy-cli 新版本可用'), '\n');
                    console.log(chalk.gray('最新版本: ' + latestVersion));
                    console.log(chalk.gray('本地版本: ' + localVersion), '\n');
                    resolve('update');
                    return;
                }
                resolve('success');
            } else {
                resolve('updateError');
            }
        });
    });
};

/**
 * 删除文件
 * 
 * @param {any} file 要删除的文件位置
 * @returns {Promise} 返回 Promise 继续回调
 */
function deleteFile(file) {
    return new Promise(function (resolve, reject) {
        rimraf(file, function (err) {
            if (err) {
                reject({
                    error: err,
                    text: '删除模版失败'
                });
                return;
            }
            resolve();
        });
    });
}

/**
 * 克隆项目
 * 
 * @param {any} repo 仓库地址
 * @param {any} file 克隆出来的文件名
 * @returns 
 */
function cloneFileFromGit(repo, file) {
    return new Promise(function (resolve, reject) {
        gitClone(repo, file, function (err) {
            if (err) {
                reject({
                    error: err,
                    text: 'git clone失败'
                });
                return;
            }
            resolve();
        });
    });
}

/**
 * 复制文件（夹）
 * 
 * @param {any} sorceDir 源文件夹位置
 * @param {any} copyDirTo 复制到的位置
 * @returns 
 */
function copyFile(sorceDir, copyDirTo) {
    rimraf.sync(path.join(sorceDir, '.git'));
    return new Promise(function (resolve, reject) {
        fsp.copy(sorceDir, copyDirTo, function (err) {
            if (err) {
                reject({
                    error: err,
                    text: '复制模板文件失败：模板文件夹下没有找到模版'
                });
                return;
            }
            resolve();
        });
    });
}

/**
 * 设置 config.cyycli.json 项目信息文件
 * 
 * @param {any} targetDir 目标文件
 * @param {any} writeInInfo 写入信息
 * @param {any} configFile config.cyycli.json 文件名
 */
function setConfigFile(targetDir, writeInInfo) {
    return configFileWrite(targetDir, writeInInfo, configInfo_json);
}

/**
 * 写入 config.json
 *
 * @param {any} dir 目标文件夹
 * @param {any} writeInInfo 写入信息
 * @param {any} fileName 写入的文件名
 */
function configFileWrite(dir, writeInInfo, fileName) {
    return new Promise(function (resolve, reject) {
        var configFile = path.join(dir, fileName);
        var oDate = new Date();
        var oCreateDateInfo = {
            createYear: String(oDate.getFullYear()),
            createMonth: String(utils.addZero(oDate.getMonth() + 1)),
            createDate: String(utils.addZero(oDate.getDate()))
        };
        var oComposeInfo = Object.assign(writeInInfo, oCreateDateInfo);
        fsp.writeFile(configFile, JSON.stringify(oComposeInfo, null, 4), function (err) {
            if (err) {
                console.log('写入文件失败');
                reject({
                    error: err,
                    text: '写入项目信息文件失败'
                });
                return;
            }
            resolve();
        });
    });
}

/**
 * 整理配置文件数据格式，为下一步数据转换添加一些额外属性
 * 
 * @param {Array} arr 配置文件原始格式数据
 * @returns {Object} userData：整理后的数据；maxLevel：数据的最大层级
 */
function resetUserData(arr) {
    var maxLevel = 0;
    var setRepo = function setRepo(arr, opt) {
        var options = opt || {};
        for (var i = 0; i < arr.length; i++) {
            arr[i].parentCode = options.parentCode || null;
            arr[i].level = options.level || 0;
            if (!options.level) {
                arr[i].rank = arr[i].name;
            } else {
                arr[i].rank = options.rank + '_' + arr[i].name;
            }
            if (arr[i].child && arr[i].child.length) {
                arr[i].type = 'list';
                if (maxLevel < arr[i].level) {
                    maxLevel = arr[i].level;
                }
                arr[i].message = options.message ? options.message : '请选择' + arr[i].text + '类型';
                setRepo(arr[i].child, {
                    rank: arr[i].rank,
                    parentCode: arr[i].name,
                    level: Number(arr[i].level) + 1
                });
            }
        }
    };
    setRepo(arr);
    return arr;
}

/**
 * 将配置文件的数据转化为 inquirer 适合用的格式
 * 
 * @param {any} data 调用 resetUserData 之后返回的配置文件数据
 * @returns 得到 inquirer 适合用的数据
 */
function userDataToinquirerData(data) {
    var userData = data;
    var aResetUserData = [];

    function userDataLoop(arr) {
        var _loop = function _loop(i) {
            if (arr[i].type === 'list') {
                if (arr[i].child && arr[i].child.length) {
                    if (arr[i].parentCode) {
                        arr[i].when = function (res) {
                            return res[arr[i].parentCode] === arr[i].text;
                        };
                    }
                    aResetUserData.push(arr[i]);
                    userDataLoop(arr[i].child);
                }
            } else if (arr[i].type === 'input') {
                arr[i]['validate'] = function (value) {
                    if (value.length) {
                        return true;
                    } else {
                        return chalk.red(arr[i].message);
                    }
                };
                aResetUserData.push(arr[i]);
            }
        };

        for (var i = 0; i < arr.length; i++) {
            _loop(i);
        }
    };
    userDataLoop(userData);

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = aResetUserData[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _userData = _step.value;

            if (_userData.child) {
                var aChild = _userData.child;
                var choices = [];
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    for (var _iterator2 = aChild[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        var choice = _step2.value;

                        choices.push(choice.text);
                    }
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                _userData.choices = choices;
            }
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
    }

    return {
        question: aResetUserData
    };
}

/**
 * 查找配置文件里面对应的 url 地址（仓库地址）
 * 
 * @param {any} arr 配置文件原始格式数据
 * @param {any} result 最后 inquirer.prompt 得到的选择项对象
 * @returns 
 */
function findResult(arr, result) {
    var data = null;

    var findInList = function findInList(list, result) {
        var aChildList = list;
        for (var i = 0; i < aChildList.length; i++) {
            for (var name in result) {
                if (result[name] === aChildList[i].text) {
                    if (aChildList[i].url) {
                        data = aChildList[i];
                    }
                    if (aChildList[i].child && aChildList[i].child.length) {
                        findInList(aChildList[i].child, result);
                    }
                }
            }
        }
    };

    var _iteratorNormalCompletion3 = true;
    var _didIteratorError3 = false;
    var _iteratorError3 = undefined;

    try {
        for (var _iterator3 = arr[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var item = _step3.value;

            if (item.child || item.type === 'list') {
                findInList(item.child, result);
            }
        }
    } catch (err) {
        _didIteratorError3 = true;
        _iteratorError3 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
            }
        } finally {
            if (_didIteratorError3) {
                throw _iteratorError3;
            }
        }
    }

    return data;
}

/**
 * 找出 input 输入项的键值对
 * 
 * @param {any} list 所有的输入项
 * @param {any} json 用户已输入项
 * @returns 只有 input 的 json
 */
function findInput(list, json) {
    var newJson = {};
    var _iteratorNormalCompletion4 = true;
    var _didIteratorError4 = false;
    var _iteratorError4 = undefined;

    try {
        for (var _iterator4 = list[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var item = _step4.value;

            if (item.type === 'input') {
                for (var name in json) {
                    if (item.name === name) {
                        newJson[name] = json[name];
                    }
                }
            }
        }
    } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
            }
        } finally {
            if (_didIteratorError4) {
                throw _iteratorError4;
            }
        }
    }

    return newJson;
}

/**
 * 复制配置文件
 * 
 * @param {any} repoConfigSource 原配置文件位置
 * @param {any} repoConfigCopyTo 输入位置
 * @param {any} msg 提示信息
 */
function copyConfigFile(repoConfigSource, repoConfigCopyTo, msg) {
    var spinner = ora(msg + '中... ').start();
    fsp.copy(repoConfigSource, repoConfigCopyTo).then(function () {
        spinner.succeed(chalk.green(msg + '成功'));
        process.exit(0);
    }).catch(function (err) {
        console.error(err);
        process.exit(1);
    });
}

exports.checkVersion = checkVersion;
exports.deleteFile = deleteFile;
exports.cloneFileFromGit = cloneFileFromGit;
exports.copyFile = copyFile;
exports.setConfigFile = setConfigFile;
exports.resetUserData = resetUserData;
exports.userDataToinquirerData = userDataToinquirerData;
exports.findResult = findResult;
exports.findInput = findInput;
exports.copyConfigFile = copyConfigFile;