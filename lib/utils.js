function replaceHtml(aReg, str) {
    let strNew = str;
    for (let item of aReg) {
        strNew = strNew.replace(new RegExp(item.reg, 'gi'), function (s) {
            return item.text;
        });
    }
    return strNew;
}

exports.replaceHtml = replaceHtml;