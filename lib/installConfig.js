const chalk = require('chalk');

// 选择类型
const oChoices = {
  // 创建 app 的类型
  appType: ['m', 'pc'],
  // pc 端的类型
  pc: ['spa', 'express', 'act'],
  // 移动端的类型
  m: ['spa', 'act']
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

// pc端 的类型
const pc = [
  {
    name: 'pc',
    type: 'list',
    message: '选择项目类型',
    choices: oChoices.pc
  }
];

// m端 的类型
const m = [
  {
    name: 'm',
    type: 'list',
    message: '选择项目类型',
    choices: oChoices.m
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
  appType: appType,
  m: m,
  pc: pc,
  authorInit: authorInit,
  nameInit: nameInit
};
