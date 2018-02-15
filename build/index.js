#!/usr/bin/env node
'use strict';

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var path = require('path');
var exec = require('child_process').exec;
// 交互式命令的（https://www.npmjs.com/package/inquirer）
var inquirer = require('inquirer');
// 命令操作工具（https://www.npmjs.com/package/commander）
var program = require('commander');
// 命令行文字颜色工具（https://www.npmjs.com/package/chalk）
var chalk = require('chalk');
// 电子签名工具（https://www.npmjs.com/package/figlet）
var figlet = require('figlet');
// cli 处理标志符号（https://www.npmjs.com/package/ora）
var ora = require('ora');
// 文件处理流程
var flow = require('./index.flow');
// 仓库配置文件
var repoConfig = require('./../repo/repo.config.json');
// 整理仓库配置文件数据
var resetUserData = flow.resetUserData(repoConfig);
// 将 repo.config.json 的数据转化成 inquirer 所需的格式
var installData = flow.userDataToinquirerData(resetUserData);
// 根目录
var rootPath = __dirname.replace(/(bin)|(lib)/, '');
// 模板目录
var templateDir = path.join(rootPath, 'template');
// 当前Node.js进程执行时的工作目录
var currentDir = process.cwd();
var utils = require('./utils');
var packageConfig = require('./../package.json');

if (process.argv.length <= 2) {
  // 只输入 cyy-cli 没有其他参数
  flow.checkVersion().then(function (res) {
    // 显示 cli 签名
    console.log(chalk.green(figlet.textSync('CYY CLI')));
    // 开始执行 cli
    cliStart(res);
  }).catch(function (err) {
    console.log(chalk.red('获取最新版本请求失败，使用当前已安装版本'), '\n');
    inquirer.prompt(installData.question).then(function (res) {
      createTemplate(res, true);
    });
  });
} else {
  // 输入 cyy-cli 有其他参数，获取并处理

  // 默认的配置文件
  var repoConfigSource = path.join(rootPath, 'bin', 'repo.config.json');
  // 读取的配置文件
  var repoConfigLoad = path.join(rootPath, 'repo', 'repo.config.json');

  program.version(packageConfig.version);
  program.command('upload <repo.config.json>').description('上传你的仓库模版 *.json 文件').action(function (file) {
    if (utils.getFileType(file) !== 'json') {
      console.log('上传的文件名必须是 json 格式');
      process.exit(1);
    }

    // 上传的配置文件位置
    var uploadRepoFile = path.join(currentDir, file);
    // 替换原本的配置文件
    flow.copyConfigFile(uploadRepoFile, repoConfigLoad, '上传配置模版文件');
  });

  program.command('download').description('下载默认仓库模版 repo.config.json 文件').action(function () {
    // 仓库配置文件
    var repoConfigCopyTo = path.join(currentDir, 'repo.config.json');
    // 下载配置文件模版到当前Node.js进程执行时的工作目录
    flow.copyConfigFile(repoConfigSource, repoConfigCopyTo, '下载配置模版文件');
  });

  program.command('reset').description('重置仓库模版 repo.config.json 文件').action(function () {
    // 将当前读取的配置文件重置到初始模版状态
    flow.copyConfigFile(repoConfigSource, repoConfigLoad, '重置配置模版文件');
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
  var templateInfo = flow.findResult(resetUserData, info);
  // 模板位置
  var sorceDir = path.join(templateDir, templateInfo.rank);
  // 目标位置
  var copyDirTo = path.join(currentDir, info.appName);
  // 选中的仓库地址
  var repoDir = templateInfo.url;
  // 输入项
  var inputInfo = flow.findInput(installData.question, info);

  console.log(' ');

  if (!isOffline) {
    // 创建模版
    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
      var spinner;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              spinner = null;
              _context.prev = 1;

              spinner = ora('正在生成项目模板... ').start();
              _context.next = 5;
              return flow.deleteFile(sorceDir);

            case 5:
              spinner.succeed(chalk.green('删除旧模板成功'));
              spinner = ora('使用 git clone 获取最新项目模板... ').start();
              _context.next = 9;
              return flow.cloneFileFromGit(repoDir, sorceDir);

            case 9:
              spinner.succeed(chalk.green('获取新模板成功'));
              spinner = ora('复制模版到您当前目录下... ').start();
              _context.next = 13;
              return flow.copyFile(sorceDir, copyDirTo);

            case 13:
              spinner.succeed(chalk.green('复制新模板成功'));
              _context.next = 16;
              return flow.setConfigFile(copyDirTo, inputInfo);

            case 16:
              spinner.succeed(chalk.green('项目信息写入成功'));
              process.exit(0);
              console.log(' ');
              _context.next = 25;
              break;

            case 21:
              _context.prev = 21;
              _context.t0 = _context['catch'](1);

              spinner.fail(_context.t0.text + '\n\n' + _context.t0.error);
              process.exit(1);

            case 25:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[1, 21]]);
    }))();
  } else {
    // 创建模版
    _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
      var spinner;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              spinner = null;
              _context2.prev = 1;

              spinner = ora('复制模版到您当前目录下... ').start();
              _context2.next = 5;
              return flow.copyFile(sorceDir, copyDirTo);

            case 5:
              spinner.succeed(chalk.green('复制新模板成功'));
              _context2.next = 8;
              return flow.setConfigFile(copyDirTo, inputInfo);

            case 8:
              spinner.succeed(chalk.green('项目信息写入成功'));
              process.exit(0);
              console.log(' ');
              _context2.next = 17;
              break;

            case 13:
              _context2.prev = 13;
              _context2.t0 = _context2['catch'](1);

              spinner.fail(_context2.t0.text + '\n\n' + _context2.t0.error);
              process.exit(1);

            case 17:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this, [[1, 13]]);
    }))();
  }
}

/**
 * 开始执行 cli
 * 
 * @param {any} res 
 * @returns 
 */
function cliStart(res) {
  var checkVersionMsg = '';
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
    message: chalk.yellow('您当前使用的是旧版本，是否需要更新？')
  }]).then(function (res) {
    console.log(' ');
    if (res.update) {
      var spinner = ora('正在更新，请勿中断... ').start();;
      exec('npm install cyy-cli -g', function (error, stdout, stderr) {
        if (error) {
          spinner.fail(chalk.red('\u66F4\u65B0\u5931\u8D25\n\n' + error));
          process.exit(1);
          return;
        }
        if (stdout) {
          spinner.succeed(chalk.green('\u66F4\u65B0\u6210\u529F\n\n' + chalk.green('' + stdout)));
          process.exit(0);
        } else {
          spinner.succeed(chalk.yellow('\u66F4\u65B0\u5931\u8D25\n\n' + chalk.yellow('' + stdout)));
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