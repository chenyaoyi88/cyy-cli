const chalk = require('chalk');

const aChoices = {
  plaform: {
    list: ['m', 'pc'],
  },
  pc: {
    list: ['spa', 'express', 'act']
  },
  // 移动端的类型
  m: {
    list: ['spa', 'act']
  }
};

const createInit = [{
  type: 'list',
  name: 'plaform',
  message: '选择平台类型',
  choices: ['m', 'pc']
}, {
  type: 'list',
  name: 'pc',
  message: '选择项目类型',
  choices: ['spa', 'express', 'act'],
  when: function (res) {
    return res.plaform === 'pc'
  }
}, {
  type: 'list',
  name: 'm',
  message: '选择项目类型',
  choices: ['spa', 'act'],
  when: function (res) {
    return res.plaform === 'm'
  }
}, {
  type: 'list',
  name: 'spa',
  message: '选择项目类型',
  choices: ['react', 'angular', 'vue'],
  when: function (res) {
    return res.m === 'spa'
  }
}, {
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
}, {
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
  createInit: createInit
};