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
exports.getFileType = getFileType;