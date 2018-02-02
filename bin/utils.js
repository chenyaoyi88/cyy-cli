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

function resetUserData(arr) {
    let maxLevel = 0;
    const setRepo = function (arr, opt) {
        let options = opt || {};
        for (let i = 0; i < arr.length; i++) {
            arr[i].parentCode = options.parentCode || null;
            arr[i].level = options.level || 0;
            if (!options.level) {
                arr[i].code = arr[i].name;
            } else {
                arr[i].code = options.parentCode + '>' + arr[i].name;
            }
            if (arr[i].child && arr[i].child.length) {
                arr[i].type = 'list';
                if (maxLevel < arr[i].level) {
                    maxLevel = arr[i].level;
                }
                arr[i].message = options.message ? options.message : '请选择' + arr[i].text + '类型';
                setRepo(arr[i].child, {
                    code: arr[i].code,
                    parentCode: arr[i].name,
                    level: Number(arr[i].level) + 1
                });
            }
        }
    }
    setRepo(arr);
    return {
        userData: arr,
        maxLevel: maxLevel
    };
}

function userDataToinquirerData(fn) {
    const obj = fn;
    const maxLevel = obj.maxLevel;
    const userData = obj.userData;
    let aResetUserData = [];
    let aInquirer = [];

    function userDataLoop(arr) {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].type === 'list') {
                if (arr[i].child && arr[i].child.length) {
                    if (arr[i].parentCode) {
                        arr[i].when = function (res) {
                            return res[arr[i].parentCode] === arr[i].text;
                        }
                    }
                    aResetUserData.push(arr[i]);
                    userDataLoop(arr[i].child);
                }
            } else if (arr[i].type === 'input') {
                aResetUserData.push(arr[i]);
            }
        }
    };
    userDataLoop(userData);

    for (let userData of aResetUserData) {
        if (userData.child) {
            const aChild = userData.child;
            const choices = [];
            for (let choice of aChild) {
                choices.push(choice.text);
            }
            userData.choices = choices;
        }
    }

    return aResetUserData;
}

function getInquirerData(arr) {
    return userDataToinquirerData(resetUserData(arr));
}

exports.replaceHtml = replaceHtml;
exports.addZero = addZero;
exports.getInquirerData = getInquirerData;