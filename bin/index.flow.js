const fsp = require('fs-extra');
const gitClone = require('git-clone');
const rimraf = require('rimraf');
const path = require('path');
const ora = require('ora');
const chalk = require('chalk');
const request = require('request');
const utils = require('./utils');
const configInfo_json = 'config.info.json';
const packageConfig = require('./../package.json');

/**
 * 检查本地 cli 版本
 * 
 * @returns {Promise} 返回 Promise 继续回调
 */
function checkVersion() {
    // 命令行中显示 loading 等待中...
    const spinner = ora(chalk.gray('正在检查版本...')).start();

    return new Promise((resolve, reject) => {
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
                const latestVersion = JSON.parse(body)['dist-tags'].latest;
                const localVersion = packageConfig.version;
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
    return new Promise((resolve, reject) => {
        rimraf(file, function (err) {
            if (err) {
                reject({
                    error: err,
                    msg: '删除模版失败',
                    code: 'deleteFile'
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
 * @param {any} filebackup 克隆出来的文件名备份
 * @returns 
 */
function cloneFileFromGit(repo, file, filebackup) {
    return new Promise((resolve, reject) => {
        gitClone(repo, file, function (err) {
            if (err) {
                reject({
                    error: err,
                    msg: 'git clone失败',
                    code: 'cloneFileFromGit'
                });
                return;
            }
            resolve();
            // 每次克隆成功备份多一份最新的
            fsp.copy(file, filebackup);
        });
    });
}

function cloneAllRepoTemplate(templateDir, aRepoUrls) {
    const len = aRepoUrls.length;
    let count = 0;
    const clone = function (count) {
        rimraf.sync(path.join(templateDir, aRepoUrls[count].rank));
        const spinner = ora(chalk.gray(`正在下载 ${aRepoUrls[count].text} 模版...`)).start();
        gitClone(aRepoUrls[count].url, path.join(templateDir, aRepoUrls[count].rank), function (err) {
            if (err) {
                console.log(err);
                return;
            }
            spinner.succeed(aRepoUrls[count].text + chalk.green(` 模板克隆备份成功`));
            count++;
            if (count === len) {
                spinner.succeed(chalk.green(`全部模板备份完成`));
                return;
            }
            clone(count);
        });
    }
    clone(count);
}

/**
 * 复制文件（夹）
 * 
 * @param {any} sorceDir 源文件夹位置
 * @param {any} copyDirTo 复制到的位置
 * @returns 
 */
function copyFile(sorceDir, copyDirTo, isBackupFile) {
    rimraf.sync(path.join(sorceDir, '.git'));
    return new Promise((resolve, reject) => {
        fsp.copy(sorceDir, copyDirTo, (err) => {
            if (err) {
                reject({
                    error: err,
                    msg: '复制模板文件失败：模板文件夹下没有找到模版',
                    code: 'copyFile'
                });
                return;
            }
            resolve();
        });
        if (isBackupFile) {
            const stats = fsp.statSync(sorceDir);
            console.log(chalk.yellow('该模版最近一次备份时间：') + `${utils.formatDate(new Date(stats.birthtime).getTime())}`, '\n');
        }
    });
}

/**
 * 设置 config.info.json 项目信息文件
 * 
 * @param {string} targetDir 目标文件
 * @param {Object} writeInInfo 写入信息
 * @param {string} configInfo_json config.info.json 文件名
 */
function setConfigFile(targetDir, writeInInfo, configInfo_json) {
    return new Promise((resolve, reject) => {
        const configFile = path.join(targetDir, configInfo_json);
        const oDate = new Date();
        const oCreateDateInfo = {
            createYear: String(oDate.getFullYear()),
            createMonth: String(utils.addZero(oDate.getMonth() + 1)),
            createDate: String(utils.addZero(oDate.getDate()))
        };
        const oComposeInfo = Object.assign(writeInInfo, oCreateDateInfo);
        fsp.writeFile(configFile, JSON.stringify(oComposeInfo, null, 4),
            function (err) {
                if (err) {
                    console.log('写入文件失败');
                    reject({
                        error: err,
                        msg: '写入项目信息文件失败',
                        code: 'setConfigFile'
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
    let maxLevel = 0;
    let aRepoUrls = [];
    const setRepo = function (arr, opt) {
        let options = opt || {};
        for (let i = 0; i < arr.length; i++) {
            arr[i].parentCode = options.parentCode || null;
            arr[i].level = options.level || 0;
            if (!options.level) {
                arr[i].rank = arr[i].name;
            } else {
                arr[i].rank = options.rank + '_' + arr[i].name;
                if (arr[i].url) {
                    aRepoUrls.push(arr[i]);
                }
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
    }
    setRepo(arr);
    return {
        data: arr,
        aRepoUrls: aRepoUrls
    };
}

/**
 * 将配置文件的数据转化为 inquirer 适合用的格式
 * 
 * @param {any} data 调用 resetUserData 之后返回的配置文件数据
 * @returns 得到 inquirer 适合用的数据
 */
function userDataToinquirerData(data) {
    const userData = data;
    let aResetUserData = [];

    function userDataLoop(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].type === 'list') {
                if (arr[i].child && arr[i].child.length) {
                    if (arr[i].parentCode) {
                        arr[i].when = function (res) {
                            return res[arr[i].parentCode] === arr[i].text;
                        }
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
                }
                aResetUserData.push(arr[i]);
            }
        }
    };
    userDataLoop(userData);

    for (let userData of aResetUserData) {
        if (userData.child) {
            const aChild = userData.child;
            const choices = [];
            for (let choice of aChild) {
                choices.push(choice.text);
            }
            userData.choices = choices;
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
    let data = null;

    const findInList = function (list, result) {
        const aChildList = list;
        for (let i = 0; i < aChildList.length; i++) {
            for (let name in result) {
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
    }

    for (let item of arr) {
        if (item.child || item.type === 'list') {
            findInList(item.child, result);
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
    let newJson = {};
    for (let item of list) {
        if (item.type === 'input') {
            for (let name in json) {
                if (item.name === name) {
                    newJson[name] = json[name];
                }
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
    let spinner = ora(msg + '中... ').start();
    fsp.copy(repoConfigSource, repoConfigCopyTo)
        .then(() => {
            spinner.succeed(chalk.green(msg + '成功'));
            process.exit(0);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

exports.checkVersion = checkVersion;
exports.deleteFile = deleteFile;
exports.cloneFileFromGit = cloneFileFromGit;
exports.cloneAllRepoTemplate = cloneAllRepoTemplate;
exports.copyFile = copyFile;
exports.setConfigFile = setConfigFile;
exports.resetUserData = resetUserData;
exports.userDataToinquirerData = userDataToinquirerData;
exports.findResult = findResult;
exports.findInput = findInput;
exports.copyConfigFile = copyConfigFile;