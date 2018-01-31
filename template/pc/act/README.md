# cyy-tool

平时常用的一些函数和方法

## 使用示例

```javascript

// DOM 元素全部加载完成
domReady(() => {
    // 加载之后要处理的逻辑
});

// 确保页面中 js/css 完全加载
const file = 'xxx.js';
loadFile(file, () => {
    // 加载之后要处理的逻辑
});

// url 上面获取参数对应的值
// 当前 url: https://www.baidu.com/?openId=1234abcd
const openId = getQueryString('openId');
console.log(openId);    // 1234abcd

// 返回一个在特点范围内的随机数字
// 需求：随机返回 4-14 范围内的数字
getRandomNum(4, 14);

// 鼠标滚轮事件
const oDiv = document.getElementById('div1');
addMouseWheel(oDiv, (bDown) => {
     if (bDown) {
         // 鼠标滚轮往上滚的时候触发回调
     } else {
         // 鼠标滚轮往下滚的时候触发回调
     }
});

// 判断对象是否为空，true -> json为空
const json = {};
isJsonEmpty(json);  // true

// 获取文件类型
const file = 'xxx.js';
getFileType(file);  // js

// 字符串间隔（字符串四位间隔）
stringSpacing('bankcard': '6225888888888888');  // 6225 8888 8888 8888
stringSpacing('phone': '15912341234');  // 159 1234 1234

// 将小于10的数字前面加上'0'
formatSingleNum(5); //  05

// 时间格式转换
formatDate(new Date().getTime());   // 2017.12.26 10:09:27

// 字符串截取（多余的显示省略号）
stringCut('我我我我我我我我我我我我我我我我我我');    // 我我我我我我我我我我...

// 数值添加千分位处理
formatThousands(1234567890456); // 1,234,567,890,456.00

// json 转成 url
const json = {
    name: 'abc',
    age: 18,
    school: '卧槽'
};
jsonTourl(json);    // name=abc&age=18&school=%E5%8D%A7%E6%A7%BD&t=0.7911412332962664

// 倒计时
// html 元素
// <div id="div1" class="class-div1"></div>
// <div class="class-div1"></div>
// <br>
// <div id="div2"></div>

const oShowTime1 = document.getElementById('div1');
const countdownTimeSec1 = 10;

// 调用方式一：从回调函数里面获取时间，自行决定显示方式
new setCountdown({
    serverTimestamp: new Date().getTime(),
    startTimestamp: (new Date().getTime() / 1000 + countdownTimeSec1) * 1000,
    showtime: function (time) {
        oShowTime1.innerHTML = time.day + '天' + time.hour + '小时' + time.min + '分' + time.sec + '秒';
    },
    timeup: function () {
        console.log('时间到1');
    }
});

// 输出：
// 00天00小时00分09秒

// 调用方式二：设置好显示的 html 元素和自定义显示的格式
new setCountdown({
    showTimeElement: '.class-div1',
    serverTimestamp: new Date().getTime(),
    startTimestamp: (new Date().getTime() / 1000 + countdownTimeSec1) * 1000,
    showTimeSymbol: {
        day: '天',
        hour: '小时',
        min: '分',
        sec: '秒'
    },
    timeup: function () {
        console.log('时间到2');
    }
});

// 输出：
// 00天00时00分06秒
// 00天00时00分06秒
```