'use strict';

/**
 * 替换 html 文本
 *
 * @param {any} oReg 替换的数组
 * @param {any} str 字符串
 * @returns
 */
function replaceHtml(aReg, str) {
    var strNew = str;

    var _loop = function _loop(item) {
        strNew = strNew.replace(new RegExp(item.reg, 'gi'), function (s) {
            return item.text;
        });
    };

    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
        for (var _iterator = aReg[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            _loop(item);
        }
    } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
    } finally {
        try {
            if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
            }
        } finally {
            if (_didIteratorError) {
                throw _iteratorError;
            }
        }
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
 * 获取文件类型
 * 
 * @param {any} file 文件
 * @returns 类型后缀
 */
function getFileType(file) {
    var cuttingPoint = file.lastIndexOf('.');
    if (cuttingPoint == -1) {
        return 'unknow';
    } else {
        return file.substring(cuttingPoint + 1);
    }
}

exports.replaceHtml = replaceHtml;
exports.addZero = addZero;
exports.getFileType = getFileType;