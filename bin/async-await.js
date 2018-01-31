function step1(str) {
    return new Promise((resolve, reject) => {
        console.log('传数据给下一步：', str);
        resolve(str);
    });
}

function step2(str, bool) {
    return new Promise((resolve, reject) => {
        console.log('接收到了上一步传过来的数据：', str);
        bool ? resolve() : reject('第二步的时候报错啦');
    });
}

function step3(bool) {
    return new Promise((resolve, reject) => {
        console.log('结束了');
        bool ? resolve() : reject('错啦');
    });
}

async function start() {
    try {
        console.log('开始');
        let data = await step1('123');
        console.log(4444);
        await step2(data, false);
        await step3(true);
    } catch (err) {
        console.log(err);
    }
};

start();