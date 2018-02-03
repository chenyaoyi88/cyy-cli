const Promise = require('bluebird');
const fsp = Promise.promisifyAll(require('fs-extra'));
const gitClone = require('git-clone');
const rimraf = require('rimraf');
const path = require('path');
const utils = require('./utils');
const config_cyycli = 'config.cyycli.json';

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
                console.log('删除模版失败');
                reject(err);
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
    return new Promise((resolve, reject) => {
        gitClone(repo, file, function (err) {
            if (err) {
                console.log('git clone失败');
                reject(err);
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
    return fsp.copy(sorceDir, copyDirTo);
}

/**
 * 设置 config.cyycli.json 项目信息文件
 * 
 * @param {any} targetDir 目标文件
 * @param {any} writeInInfo 写入信息
 * @param {any} configFile config.cyycli.json 文件名
 */
function setConfigFile(targetDir, writeInInfo) {
    fsp.readdir(targetDir, function (err, files) {
        if (err) {
            console.log('获取文件列表失败');
            return;
        }
        files.forEach(file => {
            if (file.includes(config_cyycli)) {
                // 有 config.json 修改
                return configFileModify(targetDir, writeInInfo, config_cyycli);
            } else {
                // 没有 config.json 写入一个
                return configFileWrite(targetDir, writeInInfo, config_cyycli);
            }
        });
    });
}

/**
 * 写入 config.json
 *
 * @param {any} dir 目标文件夹
 * @param {any} json 写入信息
 * @param {any} fileName 写入的文件名
 */
function configFileWrite(dir, json, fileName) {
    return new Promise((resolve, reject) => {
        const configFile = path.join(dir, fileName);
        const oDate = new Date();
        fsp.writeFile(
            configFile,
            `
    {
      "appName": "${json.appName}",
      "author": "${json.author}",
      "createTime": {
          "year": "${oDate.getFullYear()}",
          "month": "${oDate.getMonth() + 1}",
          "date": "${oDate.getDate()}"
      }
    }
    `,
            function (err) {
                if (err) {
                    console.log('写入文件失败');
                    reject(err);
                    return;
                }
                resolve();
            });
    });
}

/**
 * 修改 config.json
 *
 * @param {any} dir 目标文件夹
 * @param {any} json 写入信息
 * @param {any} fileName 写入的文件名
 */
function configFileModify(dir, json, fileName) {
    return new Promise((resolve, reject) => {
        const configFile = path.join(dir, fileName);
        const str = fsp.readFileSync(configFile, 'utf-8');
        const strNew = utils.replaceHtml(configFileModifyInfo(json), str);
        fsp.writeFile(configFile, strNew, 'utf-8', function (err) {
            if (err) {
                console.log('重写文件失败');
                reject(err);
                return;
            }
            resolve();
        });
    });
}

/**
 * 匹配修改配置
 *
 * @param {any} json 对象
 * @returns {string} 返回新的匹配修改后的字符串
 */
function configFileModifyInfo(json) {
    const oDate = new Date();
    return [{
            reg: /"(\s)?appName(\s)?"(\s)?:(\s)?".*"/,
            text: `"appName": "${json.appName}"`
        },
        {
            reg: /"(\s)?author(\s)?"(\s)?:(\s)?".*"/,
            text: `"author": "${json.author}"`
        },
        {
            reg: /"(\s)?year(\s)?"(\s)?:(\s)?".*"/,
            text: `"year": "${oDate.getFullYear()}"`
        },
        {
            reg: /"(\s)?month(\s)?"(\s)?:(\s)?".*"/,
            text: `"month": "${utils.addZero(oDate.getMonth() + 1)}"`
        },
        {
            reg: /"(\s)?date(\s)?"(\s)?:(\s)?".*"/,
            text: `"date": "${utils.addZero(oDate.getDate())}"`
        }
    ];
}

/**
 * 整理配置文件数据格式，为下一步数据转换添加一些额外属性
 * 
 * @param {Array} arr 配置文件原始格式数据
 * @returns {Object} userData：整理后的数据；maxLevel：数据的最大层级
 */
function resetUserData(arr) {
    let maxLevel = 0;
    const setRepo = function (arr, opt) {
        let options = opt || {};
        for (let i = 0; i < arr.length; i++) {
            arr[i].parentCode = options.parentCode || null;
            arr[i].level = options.level || 0;
            if (!options.level) {
                arr[i].code = arr[i].name;
            } else {
                arr[i].code = options.parentCode + '>' + arr[i].name;
            }
            if (arr[i].child && arr[i].child.length) {
                arr[i].type = 'list';
                if (maxLevel < arr[i].level) {
                    maxLevel = arr[i].level;
                }
                arr[i].message = options.message ? options.message : '请选择' + arr[i].text + '类型';
                setRepo(arr[i].child, {
                    code: arr[i].code,
                    parentCode: arr[i].name,
                    level: Number(arr[i].level) + 1
                });
            }
        }
    }
    setRepo(arr);
    return {
        userData: arr,
        maxLevel: maxLevel
    };
}

/**
 * 将配置文件的数据转化为 inquirer 适合用的格式
 * 
 * @param {any} fn 调用 resetUserData 之后返回的配置文件数据
 * @returns 得到 inquirer 适合用的数据
 */
function userDataToinquirerData(fn) {
    const obj = fn;
    const maxLevel = obj.maxLevel;
    const userData = obj.userData;
    let aResetUserData = [];
    let aInquirer = [];

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
                        return arr[i].message;
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
 * 将数据返回出去使用
 * 
 * @param {any} arr 配置文件原始格式数据
 * @returns 最终整理好的 inquirer 所用的数据（就是问题步骤配置）
 */
function getInquirerData(arr) {
    return userDataToinquirerData(resetUserData(arr));
}

/**
 * 查找配置文件里面对应的 url 地址（仓库地址）
 * 
 * @param {any} arr 配置文件原始格式数据
 * @param {any} result 最后 inquirer.prompt 得到的选择项对象
 * @returns 
 */
function findRepoUrl(arr, result) {
    let url = '';

    const findInList = function (list, result) {
        const aChildList = list;
        for (let i = 0; i < aChildList.length; i++) {
            for (let name in result) {
                if (result[name] === aChildList[i].text) {
                    if (aChildList[i].url) {
                        url = aChildList[i].url;
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

    return url;
}

exports.deleteFile = deleteFile;
exports.cloneFileFromGit = cloneFileFromGit;
exports.copyFile = copyFile;
exports.setConfigFile = setConfigFile;
exports.getInquirerData = getInquirerData;
exports.findRepoUrl = findRepoUrl;