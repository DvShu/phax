class PhaxErrorInstance extends Error {
    constructor(status, errmsg, body) {
        super(errmsg);
        this.body = body;
        this.status = status;
    }
}
function _extend(target, source) {
    for (let key in source) {
        if (source[key] != null) {
            target[key] = source[key];
        }
    }
}
/**
 * 组装 数组 形式的值为 post 参数形式
 */
function arrayParams(key, arr) {
    let q = "";
    arr.forEach((item) => {
        q +=
            "&" +
                encodeURIComponent(key + "[]") +
                "=" +
                encodeURIComponent(item.trim());
    });
    return q.substring(1);
}
/**
 * 将数据组装为请求参数
 * @param {Object} params 需要组装为请求参数的数据对象
 */
function qs(params) {
    let str = "";
    for (let key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            let value = params[key];
            if (value != null) {
                if (value instanceof Array) {
                    str += "&" + arrayParams(key, value);
                }
                else {
                    value = String(value);
                    if (value.trim().length > 0) {
                        str += "&" + key + "=" + encodeURIComponent(value.trim());
                    }
                }
            }
        }
    }
    return str === "" ? str : str.substring(1);
}
// 拦截器
let interceptors = {
    request: function (params) {
        return params;
    },
    response: function (res) {
        return res;
    },
    error: function (err) {
        return err;
    },
};
function _init(initParams) {
    let params = { credentials: "same-origin", method: "GET" };
    if (typeof initParams[0] === "string") {
        params.url = initParams[0];
        if (typeof initParams[1] === "string") {
            params.accept = initParams[1];
            if (typeof initParams[2] === "object") {
                _extend(params, initParams[2]);
            }
        }
        else {
            _extend(params, initParams[1] || {});
        }
    }
    else {
        _extend(params, initParams[0]);
    }
    return params;
}
/**
 * 组装各种参数包括, json、query
 * @param params 配置参数
 */
function _genBody(params) {
    if (params.json) {
        // json
        params.headers = params.headers || {};
        params.body = JSON.stringify(params.json);
        params.headers["Content-Type"] = "application/json;charset=utf-8";
        delete params.json;
    }
    else if (params.params) {
        // form
        params.headers = params.headers || {};
        params.body = qs(params.params);
        params.headers["Content-Type"] =
            "application/x-www-form-urlencoded;charset=utf-8";
        delete params.params;
    }
    if (params.query) {
        // get
        const qsstr = qs(params.query);
        let str = "";
        if (qsstr !== "") {
            let st = params.url.indexOf("?");
            if (st > 0) {
                // 请求地址已经存在请求参数
                let searchStr = params.url.substring(st + 1);
                if (searchStr != null && searchStr.trim().length > 0) {
                    str = "&";
                }
            }
            else {
                str = "?";
            }
            str += qsstr;
        }
        params.url += str;
        delete params.query;
    }
    return params;
}
/**
 * 执行 fetch 请求
 * @param config 请求配置
 */
function _fetch(config) {
    if (typeof interceptors.request === "function") {
        config = interceptors.request(config);
    }
    config = _genBody(config); // 进行参数组装
    let url = config.url;
    let accept = config.accept;
    delete config.url;
    delete config.accept;
    return fetch(url, config)
        .then((res) => {
        if (res.ok) {
            let all = [];
            // 请求成功
            // 接收的返回值类型
            accept = (accept ||
                res.headers.get("Content-Type") ||
                "text");
            if (/json/.test(accept)) {
                all.push(res.json());
            }
            else if (/form-data/.test(accept)) {
                all.push(res.formData());
            }
            else {
                all.push(res.text());
            }
            all.push({ __tag: "ok", status: res.status });
            return Promise.all(all);
        }
        else {
            let all = [
                Promise.resolve(-1),
                Promise.resolve({
                    __tag: "FetchError",
                    status: res.status,
                    text: res.statusText,
                }),
            ];
            return Promise.all(all);
        }
    })
        .then((a) => {
        let extra = a[1];
        if (extra.__tag === "ok") {
            return Promise.resolve(a[0]);
        }
        else {
            let error = new PhaxErrorInstance(extra.status, extra.text, a[0]);
            error.name = extra.__tag;
            interceptors.error(error);
            return Promise.reject(error);
        }
    }, (err) => {
        interceptors.error(err);
        return Promise.reject(err);
    });
}
let phax = function () {
    let a = _fetch(_init(arguments));
    return a;
};
["get", "post"].forEach((m) => {
    phax[m] = function () {
        let p = _init(arguments);
        p.method = m.toUpperCase();
        return _fetch(p);
    };
});
/**
 * 注册拦截器(过滤器)
 */
phax.interceptors = {
    /**
     * 注册请求过滤器，用于在每一次请求前，对参数进行自定义的处理
     * @param cb 过滤函数，用于对参数的处理
     */
    request: function (cb) {
        interceptors.request = cb;
    },
    response: function (cb, err) {
        interceptors.response = cb;
        if (typeof err === "function") {
            interceptors.error = err;
        }
    },
};
export default phax;
