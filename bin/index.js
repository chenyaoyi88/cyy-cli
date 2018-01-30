#!/usr/bin/env node

const inquirer = require('inquirer');
const program = require('commander');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs-extra'));
const chalk = require('chalk');
const figlet = require('figlet');
const ora = require('ora');
const exec = require('promise-exec');
const clone = require('git-clone');
const shell = require('shelljs');
const fsp = require('fs-promise');
const path = require('path');

// 定义一个对象，用于合并数据
let configTemp = {};
const installConfig = require('./../lib/installConfig');
const checkVersion = require('./../lib/check-version');
const utils = require('./../lib/utils');

const rootPath = __dirname.replace(/(bin)|(lib)/, '');
const templatePath = path.join(rootPath, 'template');
// 当前Node.js进程执行时的工作目录
const currentDir = process.cwd();

function printHelp() {
  console.log('帮助信息');
}

program.version(process.version).usage('[options]');

program.on('--help', printHelp);

program.parse(process.argv);

checkVersion(function () {
  console.log(chalk.green(figlet.textSync('CYY CLI')));

  // 选择项目的类型，是'web'还是'app'
  inquirer.prompt(installConfig.appType).then(function (args) {
    // 选中的项：{ appType: 'web' }
    assignConfig(args);
    switch (configTemp.appType) {
      case '移动端':
        mTypeInit();
        break;
      case 'PC端':
        pcTypeInit();
        break;
      default:
        mTypeInit();
    }
  });
});

/**
 * 选择相应的 移动端 类型
 */
function mTypeInit() {
  inquirer.prompt(installConfig.mType).then(function (args) {
    assignConfig(args);
    nameInit();
  });
}

/**
 * 选择相应的 pc端 类型
 */
function pcTypeInit() {
  inquirer.prompt(installConfig.pcType).then(function (args) {
    assignConfig(args);
    nameInit();
  });
}

/**
 * 专题名称
 */
function nameInit() {
  // 选择相应的专题名称
  inquirer.prompt(installConfig.nameInit).then(function (args) {
    assignConfig(args);
    authorInit();
  });
}

/**
 * 作者名
 */
function authorInit() {
  inquirer.prompt(installConfig.authorInit).then(function (args) {
    assignConfig(args, true);
  });
}

/**
 * 合并数据，创建项目模版
 *
 * @param {any} args 传过来要合并的创建所需参数
 * @param {any} flag 如果flag为true，则进行文件的创建
 */
function assignConfig(args, flag) {
  configTemp = Object.assign(configTemp, args);
  if (flag) {
    createFn();
  }
}

/**
 * 创建初始化文件
 */
function createFn() {
  // console.log(' ');
  // console.log('configTemp', configTemp);
  // console.log(' ');

  switch (configTemp.appType) {
    case '移动端':
      // 选择类型为 m端 时  
      switch (configTemp.mType) {
        case '专题':
          createTemplate('act', 'm');
          break;
        case '前端SPA':
          createTemplate('spa', 'm');
          break;
      }
      break;
    case 'PC端':
      // 选择类型为 PC端 时
      switch (configTemp.pcType) {
        case '专题':
          createTemplate('act', 'pc');
          break;
        case '前端SPA':
          createTemplate('spa', 'pc');
          break;
        case '服务端express':
          createTemplate('express', 'pc');
          break;
      }
      break;
  }
}

/**
 * 创建模版
 *
 * @param {any} type 模版类型appType m/pc
 * @param {any} typePath  具体类型 act/spa/express
 */
function createTemplate(type, typePath) {
  // 当前目录
  const sorceDir = path.join(templatePath, typePath, type);
  /**
   * 要复制到的目录
   * @param {string} currentDir 当前Node.js进程执行时的工作目录
   * @param {string} configTemp.appName 输入的项目名
   * 输入出来的路径大概是：你命令行的当前位置\输入的项目名
   */
  const copyDirTo = path.join(currentDir, configTemp.appName);

  console.log(' ');
  console.log('选择类型的模板位置', sorceDir);
  console.log('要复制到的目录', copyDirTo);
  console.log(' ');

  const spinner = ora('正在生产... ').start();

  console.log(' ');
  // 复制模板目录
  fsp
    .copy(sorceDir, copyDirTo)
    .then(function () {
      // console.log(chalk.green('模板文件复制成功'));
    })
    .then(function () {
      return fsp.readdir(copyDirTo, function (err, files) {
        if (err) return console.log('读取文件夹失败', err);
        files.forEach((file) => {
          if (file.includes('config.json')) {
            // 有 config.json 修改
            configFileModify(copyDirTo, configTemp, 'config.json')
          } else {
            // 没有 config.json 写入一个
            configFileWrite(copyDirTo, configTemp, 'config.json');
          }
        });
      });
    })
    .then(function () {
      spinner.stop();
      console.log('');
      ora(chalk.green('项目模板生成成功')).succeed();
    });
  // });
}

/**
 * 写入 config.json
 * 
 * @param {any} dir 目标文件夹
 * @param {any} json 写入信息
 * @param {any} fileName 写入的文件名
 */
function configFileWrite(dir, json, fileName) {
  const configFile = path.join(dir, fileName);
  const oDate = new Date();
  fsp.writeFileSync(configFile, `
  {
    "appName": "${json.appName}",
    "author": "${json.author}",
    "createTime": {
        "year": "${oDate.getFullYear()}",
        "month": "${oDate.getMonth()+1}",
        "date": "${oDate.getDate()}"
    }
  }
  `);
}

/**
 * 修改 config.json
 * 
 * @param {any} dir 目标文件夹
 * @param {any} json 写入信息
 * @param {any} fileName 写入的文件名
 */
function configFileModify(dir, json, fileName) {
  const configFile = path.join(dir, fileName);
  const str = fsp.readFileSync(configFile, 'utf-8');
  const strNew = utils.replaceHtml(configFileModifyInfo(json), str);
  fsp.writeFileSync(configFile, strNew, 'utf-8');
}

/**
 * 匹配修改配置
 * 
 * @param {any} json 对象
 * @returns {string} 返回新的匹配修改后的字符串
 */
function configFileModifyInfo(json) {
  const oDate = new Date();
  const aRegInfo = [{
    reg: /"(\s)?appName(\s)?"(\s)?:(\s)?".*"/,
    text: `"appName": "${json.appName}"`
  }, {
    reg: /"(\s)?author(\s)?"(\s)?:(\s)?".*"/,
    text: `"author": "${json.author}"`
  }, {
    reg: /"(\s)?year(\s)?"(\s)?:(\s)?".*"/,
    text: `"year": "${oDate.getFullYear()}"`
  }, {
    reg: /"(\s)?month(\s)?"(\s)?:(\s)?".*"/,
    text: `"month": "${oDate.getMonth()+1}"`
  }, {
    reg: /"(\s)?date(\s)?"(\s)?:(\s)?".*"/,
    text: `"date": "${oDate.getDate()}"`
  }];
  return aRegInfo;
}