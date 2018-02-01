#!/usr/bin/env node

const inquirer = require('inquirer');
const program = require('commander');
const Promise = require('bluebird');
const chalk = require('chalk');
const figlet = require('figlet');
const ora = require('ora');
const exec = require('promise-exec');
const shell = require('shelljs');
const path = require('path');
const installConfig = require('./../lib/installConfig');
const checkVersion = require('./../lib/check-version');
const templateRepoUrl = require('./repo.json');
const flow = require('./index.flow');

const rootPath = __dirname.replace(/(bin)|(lib)/, '');
const templatePath = path.join(rootPath, 'template');
// 当前Node.js进程执行时的工作目录
const currentDir = process.cwd();
// 定义一个对象，用于合并数据
let configTemp = {};

function printHelp() {
  console.log('帮助信息');
}

program.version(process.version).usage('[options]');

program.on('--help', printHelp);

program.parse(process.argv);

checkVersion(function () {
  // 显示 cli 签名
  console.log(chalk.green(figlet.textSync('CYY CLI')));

  // 第一步：类型 m/pc 端
  appInit(installConfig.appType)
    // 第二步：选择 PC/移动端 的具体类型模版
    .then(() => {
      return appInit(installConfig[configTemp.appType]);
    })
    // 第三步：输入项目名称
    .then(() => {
      return appInit(installConfig.nameInit);
    })
    // 第四步：输入开发人员名称
    .then(() => {
      return appInit(installConfig.authorInit, true);
    })
    .catch((err) => {
      console.log(chalk.red('执行错误', err));
    });
});

/**
 * 选择相应的类型
 *
 * @param {any} type 选择类型 json
 * @param {any} isDone 是否完成全部选择
 * @returns {Promise} 返回 Promise 继续回调
 */
function appInit(type, isDone) {
  return inquirer.prompt(type).then(function (args) {
    assignConfig(args, isDone);
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
  flag && readyToCreateTemplate(configTemp.appType, configTemp[configTemp.appType])
}

/**
 * 准备创建模版
 *
 * @param {any} type 模版类型appType m/pc
 * @param {any} typePath  具体类型 act/spa/express 
 */
function readyToCreateTemplate(type, typePath) {
  // 当前目录
  const sorceDir = path.join(templatePath, type, typePath);
  /**
   * 要复制到的目录
   * @param {string} currentDir 当前Node.js进程执行时的工作目录
   * @param {string} configTemp.appName 输入的项目名
   * 输入出来的路径大概是：你命令行的当前位置\输入的项目名
   */
  const copyDirTo = path.join(currentDir, configTemp.appName);
  // 仓库地址
  const repoDir = templateRepoUrl[type][typePath];

  // console.log(' ');
  // console.log('选择类型的模板位置', sorceDir);
  // console.log('要复制到的目录', copyDirTo);
  // console.log(' ');

  console.log(' ');
  createTemplate({
    copyDirTo: copyDirTo,
    sorceDir: sorceDir,
    repoDir: repoDir,
    configTemp: configTemp
  });
}

/**
 * 创建模版
 * 
 * @param {any} opt 
 */
async function createTemplate(opt) {
  const options = opt || {};
  const copyDirTo = options.copyDirTo;
  const sorceDir = options.sorceDir;
  const repoDir = options.repoDir;
  const configTemp = options.configTemp;
  let spinner = null;
  try {
    spinner = ora('正在生成项目模板... ').start();
    await flow.deleteFile(sorceDir);
    spinner.succeed(chalk.green('删除旧模板成功'));
    spinner = ora('使用 git clone 获取最新项目模板... ').start();
    await flow.cloneFileFromGit(repoDir, sorceDir);
    spinner.succeed(chalk.green('获取新模板成功'));
    spinner = ora('复制模版到您当前目录下... ').start();
    await flow.copyFile(sorceDir, copyDirTo);
    spinner.succeed(chalk.green('复制新模板成功'));
    await flow.setConfigFile(copyDirTo, configTemp);
    spinner.succeed(chalk.green('项目信息写入成功'));
  } catch (err) {
    spinner.fail('操作失败');
    console.log(err);
  }
}