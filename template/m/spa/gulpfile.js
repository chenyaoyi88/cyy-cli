const gulp = require('gulp');
const sass = require('gulp-sass');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;
// js 压缩
const uglify = require('gulp-uglify');
// 在处理 Node.js 流(pipe)的时候可以捕捉到具体的错误
const pump = require('pump');
// 只编译改动过的文件          
const changed = require('gulp-changed');
// css 浏览器前缀补全
const autoprefixer = require('gulp-autoprefixer');
// 压缩 css    
const cleanCSS = require('gulp-clean-css');
// js 代码检查
const eslint = require('gulp-eslint');
// 编译 es6 代码
const babel = require('gulp-babel');
// 图片压缩
const imagemin = require('gulp-imagemin');
// 添加 md5
const md5 = require('gulp-md5-plus');
// 基本配置
const Config = require('./gulp.config').Config;
// 检测源文件文件变化
const CheckFile = require('./gulp.config').CheckFile;
// 文件输出路径
const OutputFile = require('./gulp.config').OutputFile;
// 任务列表
const Task = require('./gulp.config').Task;
// 服务器配置
const DevServer = require('./gulp.config').DevServer;
// 服务器配置
const AutofxConfig = require('./gulp.config').AutofxConfig;

/**
 * 生产-处理 html 文件夹里面的文件
 * 1. 检测有改变的文件进行处理
 */
gulp.task(Task.prod.moveHtml, function () {
    return gulp.src(CheckFile.html)
        .pipe(changed(OutputFile.html))
        .pipe(gulp.dest(OutputFile.html));
});

/**
 * 开发/生产-处理 scss 文件夹里面的文件 
 * 1. 将 scss 文件转为 css 文件
 * 2. 自动添加前缀
 * 3. 重载/刷新
 */
gulp.task(Task.sassToCss, function () {
    return gulp.src(CheckFile.scss)
        .pipe(sass().on('error', sass.logError))
        .pipe(rename(function (path) {
           path.dirname = path.dirname.replace('/scss', 'css');
           console.log(path); 
        }))
        .pipe(autoprefixer(AutofxConfig))
        .pipe(gulp.dest(Config.src + '/css'))
        .pipe(reload({ stream: true }));
});

/**
 * 生产-处理 css 文件夹里面的文件 
 * 1. 监测文件的改动
 * 2. 自动添加前缀
 * 3. 压缩 css
 * 4. css 文件添加 md5，并在 html 文件中替换加了 md5 之后的 css 文件
 */
gulp.task(Task.prod.moveCss, [Task.sassToCss], function () {
    return gulp.src(CheckFile.css)
        .pipe(changed(OutputFile.css))
        .pipe(autoprefixer(AutofxConfig))
        .pipe(cleanCSS({
            compatibility: 'ie8',
            keepSpecialComments: '*'
        }))
        .pipe(md5(10, Config.build + '/html/**/*.html', {
            mappingFile: 'manifest.json'
        }))
        .pipe(gulp.dest(OutputFile.css));
});

/**
 * 生产-处理 js 文件夹里面的文件 
 * 1. 监测文件的改动
 * 2. 转成 es2015
 * 3. js 代码压缩
 * 4. js 文件添加 md5，并在 html 文件中替换加了 md5 之后的 js 文件
 */
gulp.task(Task.prod.moveJs, function (cb) {
    pump([
        gulp.src(CheckFile.js),
        changed(OutputFile.js),
        babel({
            presets: ['es2015']
        }),
        uglify(),
        md5(10, Config.build + '/html/**/*.html'),
        gulp.dest(OutputFile.js)
    ], cb);

    // 下面这个写法返回的 nodejs 流捕抓不到错误信息
    // return gulp.src(CheckFile.js)
    //     .pipe(changed(OutputFile.js))
    //     .pipe(babel({
    //         presets: ['es2015']
    //     }))
    //     .pipe(gulp.dest(OutputFile.js));
});

/**
 * 生产-处理 images 文件夹里面的文件 
 * 1. 压缩图片
 * 2. 图片文件添加 MD5，并在 css/html 文件中替换加了 md5 之后的图片文件
 */
gulp.task(Task.prod.moveImage, function () {
    return gulp.src(CheckFile.image)
        .pipe(imagemin())
        .pipe(md5(10, Config.build + '/{css,html}/**/*.{css,html}', {
            mappingFile: 'manifest.json'
        }))
        .pipe(gulp.dest(OutputFile.image));
});

// 生产-预览打包/构建完的静态文件
gulp.task(Task.prod.preview, function () {
    // 启动静态文件检测服务器
    browserSync.init(DevServer(Config.build, Config.port.prod));
});

// 生产-打包/构建静态文件
gulp.task(Task.prod.start, (cb) => {
    // 按照顺序执行任务
    runSequence(
        Task.prod.moveHtml,
        Task.prod.moveCss,
        Task.prod.moveImage,
        Task.prod.moveJs,
        cb);
});

// 开发-启动静态文件检测服务器
gulp.task(Task.dev.start, [Task.sassToCss], function () {
    // 启动静态文件检测服务器
    browserSync.init(DevServer(Config.src, Config.port.dev));
    // 检测 sass 文件，编译成 css 文件，刷新页面
    gulp.watch(CheckFile.scss, [Task.sassToCss]);
    // 检测 html 文件，刷新页面
    gulp.watch(CheckFile.html).on('change', reload);
});