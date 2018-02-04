#!/usr/bin/env node

const inquirer = require('inquirer');
const program = require('commander');
const chalk = require('chalk');
// 电子签名
const figlet = require('figlet');
// cli 处理标志符号
const ora = require('ora');
const path = require('path');
const checkVersion = require('./../lib/check-version');
// 文件处理流程
const flow = require('./index.flow');
// 仓库配置文件
const repoConfig = require('./../repo/repo.config.json');
// 仓库配置模版文件
const repoConfigTemplate = require('./repo.config.json');
// 整理仓库配置文件数据
const resetUserData = flow.resetUserData(repoConfig);
// inquirer 所需数据
const installData = flow.userDataToinquirerData(resetUserData);
// 根目录
const rootPath = __dirname.replace(/(bin)|(lib)/, '');
// 模板目录
const templatePath = path.join(rootPath, 'template');
// 当前Node.js进程执行时的工作目录
const currentDir = process.cwd();
// repo目录
const repoDir = path.join(rootPath, 'repo');

const fsp = require('fs-extra');
const utils = require('./utils');
const packageConfig = require('./../package.json');

program.version(packageConfig.version)
program
  .command('upload <repo.config.json>')
  .description('上传你的 repo.config.json 文件')
  .action(function (file) {

    cmdValue = file;

    if (utils.getFileType(file) !== 'json') {
      console.log('上传的文件名必须是 json 格式');
      process.exit(1);
    }

    const uploadRepoFile = path.join(currentDir, file);
    fsp.stat(uploadRepoFile, function (err, stats) {
      if (!stats.isFile()) {
        console.log('上传的文件名必须是 json 格式');
        process.exit(1);
      }
    });

    // 仓库配置文件
    const repoConfigUpload = path.join(rootPath, 'repo', 'repo.config.json');

    let spinner = ora('配置模版文件中... ').start();
    fsp.copy(uploadRepoFile, repoConfigUpload)
      .then(() => {
        spinner.succeed(chalk.green('配置模版成功'));
        process.exit(0);
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });

  });

program
  .command('download')
  .description('下载 repo.config.json 模板文件')
  .action(function () {
    // 原仓库配置文件
    const repoConfigSource = path.join(rootPath, 'bin', 'repo.config.json');
    // 仓库配置文件
    const repoConfigCopyTo = path.join(currentDir, 'repo.config.json');
    let spinner = ora('下载配置模版文件中... ').start();
    fsp.copy(repoConfigSource, repoConfigCopyTo)
      .then(() => {
        spinner.succeed(chalk.green('下载配置模版文件成功'));
        process.exit(0);
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  });

program
  .command('reset')
  .description('重置 repo.config.json 模板文件')
  .action(function () {
    // 原仓库配置文件
    const repoConfigSource = path.join(rootPath, 'bin', 'repo.config.json');
    // 仓库配置文件
    const repoConfigCopyTo = path.join(rootPath, 'repo', 'repo.config.json');
    let spinner = ora('重置配置模版文件中... ').start();
    fsp.copy(repoConfigSource, repoConfigCopyTo)
      .then(() => {
        spinner.succeed(chalk.green('重置配置模版文件成功'));
        process.exit(0);
      })
      .catch(err => {
        console.error(err);
        process.exit(1);
      });
  });

program.parse(process.argv);

if (typeof cmdValue === 'undefined') {
  checkVersion(function () {
    // 显示 cli 签名
    console.log(chalk.green(figlet.textSync('CYY CLI')));

    inquirer.prompt(installData.question).then(function (res) {
      readyToCreateTemplate(res);
    });
  });
}

/**
 * 准备好各种路径创建模版
 *
 * @param {any} type 模版类型appType m/pc
 * @param {any} typePath  具体类型 act/spa/express 
 */
function readyToCreateTemplate(info) {

  const templateOtherInfo = flow.findResult(resetUserData, info);
  // 模板目录
  const sorceDir = path.join(templatePath, templateOtherInfo.rank);
  // 目标地址
  const copyDirTo = path.join(currentDir, info.appName);
  // 仓库地址
  const repoDir = templateOtherInfo.url;

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