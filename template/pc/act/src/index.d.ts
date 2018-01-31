
interface Ajax<T> {
    // 请求类型
    type: string;
    // 提交的 url 
    url: string;
    //  提交的数据对象
    data?: T;
    //  请求超时时间
    timeout?: number;
    //  需要设置的请求头
    headers?: any;
    //  请求成功回调
    success?: Function;
    //   请求失败回调
    error?: Function;
}


interface Ajax_Options {
    headers: any;
    timeout: number;
}

/**
 * 倒计时
 */
interface Countdown {
    // 当前的服务器时间
    serverTimestamp: any;
    // 活动开始时间
    startTimestamp: any;
    // 显示时间的元素
    showTimeElement?: HTMLElement;
    // 时分秒的格式符号
    showTimeSymbol?: {
        // 天
        day?: string;
        // 小时
        hour?: string;
        // 分
        min?: string;
        // 秒
        sec?: string;
    };
    // 显示天、小时、分、秒的回调
    showtime?: Function;
    // 时间到了的回调
    timeup?: Function;
}
