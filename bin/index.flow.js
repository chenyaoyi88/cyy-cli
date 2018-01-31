const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const fsp = require('fs-promise');
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
exports.deleteFile = function (file) {
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
exports.cloneFileFromGit = function (repo, file) {
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
exports.copyFile = function (sorceDir, copyDirTo) {
    return fsp.copy(sorceDir, copyDirTo);
}

/**
 * 设置 config.cyycli.json 项目信息文件
 * 
 * @param {any} targetDir 目标文件
 * @param {any} writeInInfo 写入信息
 * @param {any} configFile config.cyycli.json 文件名
 */
exports.setConfigFile = function (targetDir, writeInInfo) {
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