#!/usr/bin/env node

var inquirer = require('inquirer');
var program = require('commander');
var Promise = require("bluebird");
var fs = Promise.promisifyAll(require('fs-extra'));
var chalk = require('chalk');
var figlet = require('figlet');
var ora = require('ora');
var exec = require('promise-exec');
var clone = require('git-clone');
var shell = require('shelljs');
var fsp = require('fs-promise');

// var log = require('tracer').colorConsole();

// 定义一个对象，用于合并数据
var configTemp = {};
var installConfig = require('./../lib/installConfig');
var checkVersion = require('./../lib/check-version');

var rootPath = __dirname.replace(/(bin)|(lib)/, '');
console.log('rootPath', rootPath);
var templatePath = rootPath + 'template/';
var nowPath = process.cwd();

function printHelp() {
	console.log('帮助信息');
}

program.version(process.version)
	.usage('[options]');

program.on('--help', printHelp);

program.parse(process.argv);

checkVersion(function () {
	console.log(
		chalk.green(
			figlet.textSync("CYY CLI")
		)
	);

	// 选择项目的类型，是'web'还是'app'
	inquirer.prompt(installConfig.type).then(function (args) {
		assignConfig(args, true);
		// nameInit();
	})
});

/**
 * @description 合并数据，如果flag为true，则进行文件的创建
 * @param {Object} args 
 */
function assignConfig(args, flag) {
	configTemp = Object.assign(configTemp, args);

	if (flag) {
		createFn();
	}
}

/**
 * @description 专题名称
 */
function nameInit() {
	// 选择相应的专题名称
	inquirer.prompt(installConfig.nameInit).then(function (args) {
		assignConfig(args);
	})
}

/**
 * @description 创建初始化文件
 */
function createFn() {
	// 初始化类型和路径
	var type = 'web',
		path = '';
	if (configTemp.appType === 'app') {
		// 选择类型为app时

		// 类型 
		type = 'app';
		// 路径
		path = 'app';
		createTemplate(type, path);
	} else if (configTemp.appType === 'web') {
		// 选择类型为web时

		// 类型 
		type = 'web';
		// 路径
		path = 'web';
		createTemplate(type, path);
	}
}

/**
 * @description 创建模版
 * @param {string} type - 类型 
 * @param {string} path - 路径 
 */
function createTemplate(type, path) {

	console.log(' ');
	console.log('type', type);
	console.log('path', path);
	console.log('templatePath', templatePath);
	console.log('nowPath+', nowPath + '\\' + configTemp.appType + '/');

	// fs.readFile(templatePath + path + '/index.html', function (err, buffer) {
	// 	if (err) throw err;

	var spinner = ora('   正在生产... ').start();
	fsp.copy(templatePath + path + '/', nowPath + '\\' + configTemp.appType + '/')
		.then(function () {
			fsp.ensureDir(nowPath + '\\' + configTemp.appType + '');
		}).then(function () {
			// fsp.writeFile(nowPath + '\\' + configTemp.appType + '/index.html', 'gb2312');
		}).then(function () {
			spinner.stop();
			console.log('');
			ora(chalk.green('目录生成成功')).succeed();
		})
	// });
}