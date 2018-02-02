#!/usr/bin/env node

const inquirer = require('inquirer');
const program = require('commander');
const Promise = require('bluebird');
const chalk = require('chalk');
const figlet = require('figlet');
const ora = require('ora');
const path = require('path');
const installConfig = require('./../lib/installConfig');
const checkVersion = require('./../lib/check-version');
const templateRepoUrl = require('./repo.json');
const flow = require('./index.flow');

const utils = require('./utils');
const repo = require('./repo.1.json');
const installData = utils.getInquirerData(repo);

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
  // 显示 cli 签名
  console.log(chalk.green(figlet.textSync('CYY CLI')));

  // inquirer.prompt(installConfig.createInit).then
  inquirer.prompt(installData).then(function (res) {
    console.log(res);
    return;
    readyToCreateTemplate(res);
  });
});


/**
 * 准备好各种路径创建模版
 *
 * @param {any} type 模版类型appType m/pc
 * @param {any} typePath  具体类型 act/spa/express 
 */
function readyToCreateTemplate(info) {

  const type = info.plaform;
  const typePath = info[info.plaform];

  // 当前目录
  const sorceDir = path.join(templatePath, type, typePath);
  /**
   * 要复制到的目录
   * @param {string} currentDir 当前Node.js进程执行时的工作目录
   * @param {string} info.appName 输入的项目名
   * 输入出来的路径大概是：你命令行的当前位置\输入的项目名
   */
  const copyDirTo = path.join(currentDir, info.appName);
  // 仓库地址
  const repoDir = templateRepoUrl[type][typePath];

  // console.log(' ');
  // console.log('选择类型的模板位置', sorceDir);
  // console.log('要复制到的目录', copyDirTo);
  // console.log(' ');

  console.log(' ');
  // 创建模版
  createTemplate({
    copyDirTo: copyDirTo,
    sorceDir: sorceDir,
    repoDir: repoDir,
    info: info
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
  const info = options.info;
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
    await flow.setConfigFile(copyDirTo, info);
    spinner.succeed(chalk.green('项目信息写入成功'));
  } catch (err) {
    spinner.fail('操作失败');
    console.log(err);
  }
}