var chalk = require('chalk');
var inquirer = require('inquirer');
var terminal = '';

let type = [
  {
    name: 'appType',
    type: 'list',
    message: '选择类型',
    choices: ['app', 'web']
  }
];

let nameInit = [
  {
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
  }
]

module.exports = {
  type: type,
  nameInit: nameInit
};