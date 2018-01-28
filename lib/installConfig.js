var chalk = require('chalk');
var inquirer = require('inquirer');
var terminal = '';

let type = [{
  name: 'appType',
  type: 'list',
  message: '选择类型',
  choices: ['app', 'web']
}];

// 输入项目名称
let nameInit = [{
  name: 'appName',
  type: 'input',
  message: '输入项目名' + chalk.gray('(例: vip)： '),
  validate(value) {
    if (value.length) {
      return true;
    } else {
      return '请输入您项目的名称：';
    }
  }
}];
// 输入开发人员名字
let authorInit = [{
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
}];

module.exports = {
  type: type,
  authorInit: authorInit,
  nameInit: nameInit
};