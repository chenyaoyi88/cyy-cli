const chalk = require('chalk');
// const inquirer = require('inquirer');
// const terminal = '';

// 选择类型
const oChoices = {
  // 创建 app 的类型
  appType: ['移动端', 'PC端'],
  // pc 端的类型
  pcType: ['前端SPA', '服务端express', '专题'],
  // 移动端的类型
  mType: ['前端SPA', '专题']
};

// 创建 app 的类型
const appType = [
  {
    name: 'appType',
    type: 'list',
    message: '选择平台类型',
    choices: oChoices.appType
  }
];

// pc 端的类型
const pcType = [
  {
    name: 'pcType',
    type: 'list',
    message: '选择项目类型',
    choices: oChoices.pcType
  }
];

// 移动端的类型
const mType = [
  {
    name: 'mType',
    type: 'list',
    message: '选择项目类型',
    choices: oChoices.mType
  }
];

// 输入项目名称
const nameInit = [
  {
    name: 'appName',
    type: 'input',
    message: '输入项目名' + chalk.gray('(例: cyy)： '),
    validate(value) {
      if (value.length) {
        return true;
      } else {
        return '请输入您项目的名称：';
      }
    }
  }
];

// 输入开发人员名字
const authorInit = [
  {
    name: 'author',
    type: 'input',
    message: '作者' + chalk.gray('(例：cyy)：'),
    validate(value) {
      if (value.length) {
        return true;
      } else {
        return '请输入您作者名称：';
      }
    }
  }
];

module.exports = {
  oChoices: oChoices,
  appType: appType,
  pcType: pcType,
  mType: mType,
  authorInit: authorInit,
  nameInit: nameInit
};
