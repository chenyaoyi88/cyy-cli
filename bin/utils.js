/**
 * 替换 html 文本
 *
 * @param {any} oReg 替换的数组
 * @param {any} str 字符串
 * @returns
 */
function replaceHtml(aReg, str) {
    let strNew = str;
    for (let item of aReg) {
        strNew = strNew.replace(new RegExp(item.reg, 'gi'), function (s) {
            return item.text;
        });
    }
    return strNew;
}
/**
 * 补零
 * 
 * @param {any} num 数字
 * @returns 补零之后的字符串
 */
function addZero(num) {
    if (num === 'undefined' || num === undefined || num === '' || num === null) return num;
    if (parseInt(num) > 0 && parseInt(num) < 10) {
        return '0' + num;
    } else {
        return num;
    }
}

/**
 * 时间戳格式化
 * 
 * @param {any} time 时间戳
 * @param {any} symbol 年/月/日 相隔符号
 * @returns 年.月.日 时:分:秒
 */
function formatDate(time, symbol) {
    const timeSymbol = symbol || '.';
    if (time) {
        const newTime = typeof time === 'number' ? time : parseInt(time);
        const date = new Date(newTime);
        return date.getFullYear() + timeSymbol + addZero(date.getMonth() + 1) + timeSymbol + addZero(date.getDate()) +
            ' ' + addZero(date.getHours()) + ':' + addZero(date.getMinutes()) + ':' + addZero(date.getSeconds());
    } else {
        return '----.--.-- --:--:--';
    }
}

/**
 * 获取文件类型
 * 
 * @param {any} file 文件
 * @returns 类型后缀
 */
function getFileType(file) {
    const cuttingPoint = file.lastIndexOf('.');
    if (cuttingPoint == -1) {
        return 'unknow';
    } else {
        return file.substring(cuttingPoint + 1);
    }
}

exports.replaceHtml = replaceHtml;
exports.addZero = addZero;
exports.formatDate = formatDate;
exports.getFileType = getFileType;