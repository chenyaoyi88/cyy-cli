const path = require('path');
const fs = require('fs');

const aRegInfo = [{
    reg: /"(\s)?appName(\s)?"(\s)?:(\s)?".*"/,
    text: `"appName": "appName1"`
}, {
    reg: /"(\s)?author(\s)?"(\s)?:(\s)?".*"/,
    text: `"author": "author1"`
}, {
    reg: /"(\s)?year(\s)?"(\s)?:(\s)?".*"/,
    text: `"year": "year1"`
}, {
    reg: /"(\s)?month(\s)?"(\s)?:(\s)?".*"/,
    text: `"month": "month1"`
}, {
    reg: /"(\s)?date(\s)?"(\s)?:(\s)?".*"/,
    text: `"date": "date1"`
}];

function replaceHtml(aReg, str) {
    let strNew = str;
    for (let item of aReg) {
        strNew = strNew.replace(new RegExp(item.reg, 'gi'), function (s) {
            return item.text;
        });
    }
    return strNew;
}

function configFileModify(dir, file, json) {
    const configFile = path.join(dir, file);
    const str = fs.readFileSync(configFile, 'utf-8');
    const strNew = replaceHtml(aRegInfo, str);
    fs.writeFileSync(configFile, strNew, 'utf-8');
}

configFileModify(__dirname, 'config.json');