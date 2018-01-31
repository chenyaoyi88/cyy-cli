// var HOST
var HOST = window.location.host;
var API = '';
if (HOST.includes('sit')) {
    // 测试环境
    API = '//sit.guanghuobao.com';
} else if (HOST.includes('www')) {
    API = '//www.guanghuobao.com';
} else {
    API = '//10.2.10.227';
}

(function (win) {
    const docEl = win.document.documentElement;
    // 设计图宽度：默认按 640 计算
    const PSD_STD = 640;
    // 换算比例
    const CALC_SCALE = 100;
    // 计算 rem
    function refreshRem() {
        docEl.style.fontSize = docEl.clientWidth / (PSD_STD / 100) + 'px';
    }

    win.addEventListener('resize', function () {
        refreshRem();
    }, false);

    win.addEventListener('pageshow', function (e) {
        if (e.persisted) {
            refreshRem();
        }
    }, false);

    refreshRem();

})(window);

function json2url(json) {
    json.t = Math.random();
    var arr = [];
    for (var name in json) {
        arr.push(name + '=' + encodeURIComponent(json[name]));
    }
    return arr.join('&');
}

function ajax(options) {
    options = options || {};
    if (!options.url) {
        return;
    }

    options.data = options.data || {};
    options.type = options.type || 'GET';
    options.timeout = options.timeout || 0;
    options.header = options.header || {};

    let xhr = null;
    let timer = null;
    const str = json2url(options.data);

    //1 创建
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    if (options.type.toUpperCase() === 'GET') {
        xhr.open('GET', options.url + '?' + str, true);
        xhr.send();
    } else {
        xhr.open('POST', options.url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        for (let pro in options.header) {
            xhr.setRequestHeader(pro, options.header[pro]);
        }
        xhr.send(str);
    }

    return new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
            // 完成
            if (xhr.readyState === 4) { 
                clearTimeout(timer);
                // 成功
                if (xhr.status >= 200 && xhr.status < 300 || xhr.status === 304) {
                    options.success && options.success(JSON.parse(xhr.responseText));
                    resolve(JSON.parse(xhr.responseText));
                } else {
                    //失败
                    options.error && options.error('error');
                    reject('error');
                }

            }
        };

        if (options.timeout) {
            timer = setTimeout(function () {
                reject('timeout');
                // 终止
                xhr.abort();
            }, options.timeout);
        }
    });

}

const toast = function (text) {
    if (document.getElementById('toast')) {
        return false;
    }

    const doc = document.body;
    const toastText = text;

    doc.insertAdjacentHTML(
        'beforeEnd',
        `<div class='toast' id='toast'>
                <div class='toast-wrap'>
                    <div class='toast-content'>${toastText}</div>
                </div>
            </div>`
    );

    var oToast = document.getElementById('toast');
    var oToastText = oToast.querySelector('.toast-content');

    oToastText.classList.add('slideInUp', 'animated');

    oToastText.addEventListener('webkitAnimationEnd', function () {
        doc.removeChild(oToast);
    });
}