function _extend(target, source) {
    for (let key in source) {
        if (source[key] != null) {
            target[key] = source[key];
        }
    }
}
function _init(initParams) {
    let params = { credentials: 'same-origin', method: 'GET' };
    if (typeof initParams[0] === 'string') {
        params.url = initParams[0];
        if (typeof initParams[1] === 'string') {
            params.accept = initParams[1];
            if (typeof initParams[2] === 'object') {
                _extend(params, initParams[2]);
            }
        }
        else {
            _extend(params, initParams[1] || {});
        }
    }
    else {
        _extend(params, initParams.shift());
    }
    if (params.json) {
        params.headers = params.headers || {};
        params.body = JSON.stringify(params.json);
        params.headers["Content-Type"] = 'application/json;charset=utf-8';
        delete params.json;
    }
    return params;
}
/**
 * @param url 请求地址
 * @param accept 允许的返回值类型, 如果是 json，会对返回值做 JSON.parse 处理
 */
function _fetch(params) {
    let url = params.url;
    let accept = params.accept;
    delete params.url;
    delete params.accept;
    return fetch(url, params).then((res) => {
        if (res.ok) {
            // 请求成功
            // 接收的返回值类型
            accept = accept || res.headers.get("Content-Type") || "text";
            if (/json/.test(accept)) {
                return res.json();
            }
            else if (/form-data/.test(accept)) {
                return res.formData();
            }
            else {
                return res.text();
            }
        }
        else {
            // 请求失败
            let error = new Error(res.statusText);
            error.name = "FetchError";
            error.statusCode = res.status;
            throw error;
        }
    });
}
let phax = function (params) {
    return _fetch(_init(arguments));
};
['get', 'post'].forEach(function (m) {
    phax[m] = function (params) {
        let p = _init(arguments);
        p.method = m.toUpperCase();
        return _fetch(p);
    };
});
export default phax;
