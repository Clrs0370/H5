(function (W) {
    if (typeof W != 'function' || typeof W.session == 'function' || !window.sessionStorage) return;

    var session = function () { },
        S = sessionStorage;
    /// <summary>
    /// 设置将指定的值存放在localstorage的指定键值下
    /// </summary>
    /// <param name="key">键值</param>
    /// <param name="value">值</param>
    session.setItem = function (key, value) {
        S.setItem(key, JSON.stringify(value));
    }
    /// <summary>
    /// 获取指定键值下的值
    /// </summary>
    /// <param name="key">键值</param>
    session.getItem = function (key) {
        var d = S.getItem(key);
        if (!d) return d;
        return JSON.parse(d);
        //return JSON.parse(S.getItem(key))
    }
    /// <summary>
    /// 移除指定键值下的值
    /// </summary>
    /// <param name="key">键值</param>
    session.remove = function (key) {
        S.removeItem(key);
    }
    /// <summary>
    /// 移除localStorage下所有存储的值
    /// </summary>
    session.clear = function () {
        S.clear();
    }
    session.length = function () {
        return S.length;
    }

    W.session = W.session || session;
})($.MyWidget);