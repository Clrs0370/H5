/*
    share.js
    by yesun
*/
(function ($, undefined) {

    var _URL = {
        SINA: "http://service.weibo.com/share/share.php",//http://weibo.cn/ext/share
        QQ: "http://v.t.qq.com/share/share.php",//http://share.v.t.qq.com/index.php?c=share&a=index
    }

    $.csdn = $.extend($.csdn || {}, {
        share: {
            sina: function (options) {
                _share(_URL.SINA, options);
            },
            qq: function (options) {
                _share(_URL.QQ, options);
            },
            other: function (url, options) {
                _share(url, options);
            }
        }
    });

    function _share(url, options) {
        var temp = [];
        for (var p in options) {
            temp.push(p + "=" + encodeURIComponent(options[p] || ""));
        }

        location.href = url + "?" + temp.join("&");
    }
})(window.Zepto || null);