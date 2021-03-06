#!/usr/bin/env node

const path = require('path');
const exec = require('child_process').exec;
// 交互式命令的（https://www.npmjs.com/package/inquirer）
const inquirer = require('inquirer');
// 命令操作工具（https://www.npmjs.com/package/commander）
const program = require('commander');
// 命令行文字颜色工具（https://www.npmjs.com/package/chalk）
const chalk = require('chalk');
// 电子签名工具（https://www.npmjs.com/package/figlet）
const figlet = require('figlet');
// cli 处理标志符号（https://www.npmjs.com/package/ora）
const ora = require('ora');
// 文件处理流程
const flow = require('./index.flow');
// 仓库配置文件
const repoConfig = require('./../repo/use/repo.config.json');
// 整理仓库配置文件数据
const resetUserData = flow.resetUserData(repoConfig);
// 将 repo.config.json 的数据转化成 inquirer 所需的格式
const installData = flow.userDataToinquirerData(resetUserData.data);
// 根目录
const rootPath = path.resolve(__dirname, '../');
// 模板目录
const templateDir = path.join(rootPath, 'template', 'use');
// 模板目录
const templateDirBackup = path.join(rootPath, 'template', 'backup');
// 当前Node.js进程执行时的工作目录
const currentDir = process.cwd();
const utils = require('./utils');
const packageConfig = require('./../package.json');
// 项目信息文件名
const configInfo_json = 'config.info.json';

if (process.argv.length <= 2) {
  // 只输入 cyy-cli 没有其他参数
  flow.checkVersion()
    .then((res) => {
      // 显示 cli 签名
      console.log(chalk.green(figlet.textSync('CYY CLI')));
      // 开始执行 cli
      cliStart(res);
    })
    .catch((err) => {
      console.log(chalk.red('获取最新版本请求失败，使用当前已安装版本'), '\n');
      inquirer.prompt(installData.question).then(function (res) {
        createTemplate(res, true);
      });
    });
} else {
  // 输入 cyy-cli 有其他参数，获取并处理

  // 默认的配置文件
  const repoConfigSource = path.join(rootPath, 'repo', 'backup', 'repo.config.json');
  // 读取的配置文件
  const repoConfigLoad = path.join(rootPath, 'repo', 'use', 'repo.config.json');

  program.version(packageConfig.version)
  program
    .command('upload <repo.config.json>')
    .description('上传你的仓库模版 *.json 文件')
    .action(function (file) {
      if (utils.getFileType(file) !== 'json') {
        console.log('上传的文件名必须是 json 格式');
        process.exit(1);
      }
      // 上传的配置文件位置
      const uploadRepoFile = path.join(currentDir, file);
      // 替换原本的配置文件
      flow.copyConfigFile(uploadRepoFile, repoConfigLoad, '上传配置模版文件', function () {
        console.log(' ');
        inquirer.prompt([{
          type: 'confirm',
          name: 'backup',
          message: chalk.yellow('您刚上传了新的模板配置文件，是需要备份一份在本地？'),
        }]).then(function (res) {
          if (!res.backup) {
            process.exit(0);
          }
          console.log(' ');
          // 如果需要，备份一份
          flow.cloneAllRepoTemplate(templateDirBackup, resetUserData.aRepoUrls);
        });
      });

    });

  program
    .command('download <downloadType>')
    .description('repo/temp：下载默认仓库模版文件/所有模板到临时文件夹')
    .action(function (downloadType) {
      switch (downloadType) {
        case 'repo':
          // 仓库配置文件
          const repoConfigCopyTo = path.join(currentDir, 'repo.config.json');
          // 下载配置文件模版到当前Node.js进程执行时的工作目录
          flow.copyConfigFile(repoConfigSource, repoConfigCopyTo, '下载配置模版文件');
          break;
        case 'temp':
          flow.cloneAllRepoTemplate(templateDirBackup, resetUserData.aRepoUrls);
          break;
      }
    });

  program
    .command('reset <resetType>')
    .description('重置仓库模版 repo.config.json 文件')
    .action(function (resetType) {
      switch (resetType) {
        case 'repo':
          // 将当前读取的配置文件重置到初始模版状态
          flow.copyConfigFile(repoConfigSource, repoConfigLoad, '重置配置模版文件');
          break;
      }
    });

  program.parse(process.argv);
}

/**
 * 各种信息已输入，准备创建模版
 *
 * @param {any} info 用户输入完的模版信息
 */
function createTemplate(info, isOffline) {
  // 模板信息
  const templateInfo = flow.findResult(resetUserData.data, info);
  // 模板位置
  const sorceDir = path.join(templateDir, templateInfo.rank);
  // 模板位置
  const sorceDirBackup = path.join(templateDirBackup, templateInfo.rank);
  // 目标位置
  const copyDirTo = path.join(currentDir, info.appName);
  // 选中的仓库地址
  const repoDir = templateInfo.url;
  // 输入项
  const inputInfo = flow.findInput(installData.question, info);

  let spinner = null;

  // 离线状态处理逻辑
  const offLineHandle = async function () {
    try {
      await flow.copyFile(sorceDirBackup, copyDirTo, true);
      spinner = ora('复制备份模版到您当前目录下... ').start();
      spinner.succeed(chalk.green('复制新模板成功'));
      await flow.setConfigFile(copyDirTo, inputInfo, configInfo_json);
      spinner.succeed(chalk.green('项目信息写入成功'));
      process.exit(0);
      console.log(' ');
    } catch (err) {
      spinner.fail(`${err.msg}\n\n${err.error}`);
      process.exit(1);
    }
  };

  console.log(' ');

  if (!isOffline) {
    // 创建模版（正常网络状态下）
    (async function () {
      try {
        spinner = ora('正在生成项目模板... ').start();
        await flow.deleteFile(sorceDir);
        spinner.succeed(chalk.green('删除旧模板成功'));
        spinner = ora('使用 git clone 获取最新项目模板... ').start();
        await flow.cloneFileFromGit(repoDir, sorceDir, sorceDirBackup);
        spinner.succeed(chalk.green('获取新模板成功'));
        spinner = ora('复制模版到您当前目录下... ').start();
        await flow.copyFile(sorceDir, copyDirTo);
        spinner.succeed(chalk.green('复制新模板成功'));
        await flow.setConfigFile(copyDirTo, inputInfo, configInfo_json);
        spinner.succeed(chalk.green('项目信息写入成功'));
        process.exit(0);
        console.log(' ');
      } catch (err) {
        // 克隆失败可从备份文件中获取旧的模版
        if (err.code === 'cloneFileFromGit') {
          offLineHandle();
        } else {
          spinner.fail(`${err.msg}\n\n${err.error}`);
          process.exit(1);
        }
      }
    })();
  } else {
    // 创建模版（无网络状态下）
    offLineHandle();
  }

}

/**
 * 开始执行 cli
 * 
 * @param {any} res 
 * @returns 
 */
function cliStart(res) {
  let checkVersionMsg = '';
  switch (res) {
    case 'timeout':
      // 检测版本超时
      checkVersionMsg = '获取最新版本请求超时，使用当前已安装版本';
      break;
    case 'updateError':
      // 检测最新版本失败
      checkVersionMsg = '获取最新版本请求失败，使用当前已安装版本';
      break;
    case 'update':
      // 检测版本需要更新->是否升级 ? 使用当前版本 : 升级
      cliUpdate();
      return;
      break;
  }
  console.log(chalk.yellow(checkVersionMsg), '\n');
  inquirer.prompt(installData.question).then(function (res) {
    createTemplate(res);
  });
}

/**
 * 更新 cyy-cli
 * 
 */
function cliUpdate() {
  inquirer.prompt([{
    type: 'confirm',
    name: 'update',
    message: chalk.yellow('您当前使用的是旧版本，是否需要更新？'),
  }]).then(function (res) {
    console.log(' ');
    if (res.update) {
      let spinner = ora('正在更新，请勿中断... ').start();;
      exec('npm install cyy-cli -g', (error, stdout, stderr) => {
        if (error) {
          spinner.fail(chalk.red(`更新失败\n\n${error}`));
          process.exit(1);
          return;
        }
        if (stdout) {
          spinner.succeed(chalk.green(`更新成功\n\n${chalk.green(`${stdout}`)}`));
          process.exit(0);
        } else {
          spinner.succeed(chalk.yellow(`更新失败\n\n${chalk.yellow(`${stdout}`)}`));
          process.exit(1);
        }
      });
    } else {
      console.log(' ');
      inquirer.prompt(installData.question).then(function (res) {
        createTemplate(res);
      });
    }
  });
}