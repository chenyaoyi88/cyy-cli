#!/usr/bin/env node

const inquirer = require('inquirer');
const program = require('commander');
const Promise = require("bluebird");
const fs = Promise.promisifyAll(require('fs-extra'));
const chalk = require('chalk');
const figlet = require('figlet');
const ora = require('ora');
const exec = require('promise-exec');
const clone = require('git-clone');
const shell = require('shelljs');
const fsp = require('fs-promise');
const path = require('path');

// 定义一个对象，用于合并数据
let configTemp = {};
const installConfig = require('./../lib/installConfig');
const checkVersion = require('./../lib/check-version');

const rootPath = __dirname.replace(/(bin)|(lib)/, '');
// console.log('rootPath', rootPath);
const templatePath = rootPath + 'template/';
const nowPath = process.cwd();

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
		// 选中的项：{ appType: 'web' }
		assignConfig(args);
		nameInit();
	})
});

/**
 * 专题名称
 */
function nameInit() {
	// 选择相应的专题名称
	inquirer.prompt(installConfig.nameInit).then(function (args) {
		assignConfig(args, true);
		// assignConfig(args);
		// authorInit();
	})
}
/**
 * 作者名
 */
function authorInit() {
	inquirer.prompt(installConfig.authorInit).then(function (args) {
		// console.log('args', args);
		assignConfig(args, true);
	})
};

/**
 * 合并数据，创建模版
 * 
 * @param {any} args 传过来要合并的创建所需参数
 * @param {any} flag 如果flag为true，则进行文件的创建
 */
function assignConfig(args, flag) {
	configTemp = Object.assign(configTemp, args);
	// console.log('configTemp', configTemp);
	if (flag) {
		createFn();
	}
}

/**
 * 创建初始化文件
 */
function createFn() {
	// 初始化类型和路径
	let type = 'web',
		typePath = '';
	if (configTemp.appType === 'app') {
		// 选择类型为app时

		// 类型 
		type = 'app';
		// 路径
		typePath = 'app';
		createTemplate(type, typePath);
	} else if (configTemp.appType === 'web') {
		// 选择类型为web时

		// 类型 
		type = 'web';
		// 路径
		typePath = 'web';
		createTemplate(type, typePath);
	}
}

/**
 * 创建模版
 * 
 * @param {any} type 模版类型 app/web
 * @param {any} typePath 
 */
function createTemplate(type, typePath) {

	// 当前目录
	const sorceDir = path.join(templatePath, typePath);
	/**
	 * 要复制到的目录
	 * @param {string} nowPath 复制到的目录
	 * @param {string} configTemp.appName 输入的项目名
	 * 输入出来的路径大概是：你命令行的当前位置\输入的项目名
	 */
	const copyDirTo = path.join(nowPath, configTemp.appName);

	console.log(' ');
	console.log('选择类型', type);
	console.log('选择类型目录名称', typePath);
	console.log('选择类型的模板位置', sorceDir);
	console.log('要复制到的目录', copyDirTo);
	console.log(' ');

	const spinner = ora('正在生产... ').start();

	console.log(' ');
	// 复制模板目录
	fsp.copy(sorceDir, copyDirTo)
		.then(function () {
			// console.log(chalk.green('模板文件复制成功'));
		}).then(function () {
			// const configFile = path.join(copyDirTo, 'config.json');
			// fs.writeFileSync(configFile, `
			// {
			// 	"appName": "${configTemp.appName}",
			// 	"title": "${configTemp.appName}",
			// 	"description": "${configTemp.appName}",
			// 	"keywords": "${configTemp.appName}"
			// }
			// `);
			// console.log(data);
		}).then(function () {
			spinner.stop();
			console.log('');
			ora(chalk.green('项目模板生成成功')).succeed();
		});
	// });
}