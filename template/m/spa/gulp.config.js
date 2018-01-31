const Config = {
    // 资源文件夹
    src: 'src',
    // 生产环境编译出来的的资源文件夹
    build: 'build',
    // 端口
    port: {
        // 开发环境端口
        dev: 3000,
        // 生产环境端口
        prod: 4000
    }
};

// 检测源文件文件变化
const CheckFile = {
    html: Config.src + '/html/**/*.html',
    css: Config.src + '/css/**/*.css',
    scss: Config.src + '/scss/**/*.scss',
    js: Config.src + '/js/**/*.js',
    image: Config.src + '/images/**/*.*'
};

// 检测源文件文件变化-数组
const ArrCheckFile = Object.keys(CheckFile).map(function (el) {
    return CheckFile[el];
});

// 文件输出路径
const OutputFile = {
    html: Config.build + '/html',
    css: Config.build + '/css',
    js: Config.build + '/js',
    image: Config.build + '/images'
};

// 任务
const Task = {
    dev: {
        start: 'dev',
    },
    prod: {
        start: 'build-prod',
        preview: 'build-preview',
        moveCss: 'move-css',
        moveJs: 'move-js',
        moveHtml: 'move-html',
        moveImage: 'move-image'
    },
    sassToCss: 'sass-css'
};

// 服务器配置
const DevServer = function (dir, port) {
    return {
        // 检测的文件类型
        files: ArrCheckFile,
        server: {
            // 服务器启动的根目录
            baseDir: dir || 'src',
            // 找不到默认的启动文件 index.html 的时候，显示服务器的目录列表
            directory: true
        },
        // 文件添加时间戳
        timestamps: true,
        // 端口
        port: port || 3000,
        // 重载等待时间
        // reloadDelay: 300
        startPath: '/html/index.html',
        // 关闭刷新通知
        notify: false
    }
}

// gulp-autoprefixer 添加浏览器前缀
exports.AutofxConfig = {
    browsers: [
        'ie >= 9',
        'ie_mob >= 10',
        'ff >= 30',
        'chrome >= 34',
        'safari >= 7',
        'opera >= 23',
        'ios >= 7',
        'android >= 4.4',
        'bb >= 10'
    ],
    cascade: true,
    remove: true
};

exports.Config = Config;
exports.CheckFile = CheckFile;
exports.ArrCheckFile = ArrCheckFile;
exports.OutputFile = OutputFile;
exports.Task = Task;
exports.DevServer = DevServer;
