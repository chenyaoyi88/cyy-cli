const chalk = require('chalk');
const request = require('request');
const ora = require('ora');

const packageConfig = require('./../package.json');

module.exports = function (done) {
  // 命令行中显示 loading 等待中...
  const spinner = ora(chalk.gray('正在检查版本...')).start();

  // 请求查看 npmjs 获取包的信息
  request({
    url: 'https://registry.npmjs.org/cyy-cli',
    timeout: 1000
  }, function (err, res, body) {
    // 停止loading
    spinner.stop();

    if (!err && res.statusCode == 200) {
      // 最新版本号和以前的版本号之间的对比，然后给出相应的提示信息
      const latestVersion = JSON.parse(body)['dist-tags'].latest;
      const localVersion = packageConfig.version;
      if (latestVersion !== localVersion) {
        console.log()
        console.log(chalk.gray('  cyy-cli新版本可用.'))
        console.log()
        console.log(chalk.gray('  最新版本: ' + latestVersion))
        console.log(chalk.gray('  本地版本: ' + localVersion))
        console.log()
        console.log('  重新安装获得新特性: ' + chalk.green('npm install -g cyy-cli'))
        console.log()
      }
    }

    done();
  })
};