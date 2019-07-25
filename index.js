function _extend(target, source) {
    for (let key in source) {
        if (source[key] != null) {
            target[key] = source[key];
        }
    }
}
/*
 * 整理参数
 *    1. url: String, accept: String, opts: Object
 *    2. opts: Object
 */
function _opts(args) {
    let opts = { credentials: 'same-origin', method: 'GET' };
    if (typeof args[0] === 'string') { // 第一个参数传递的是 url
        opts.url = args[0];
        if (typeof args[1] === 'string') {
            opts.accept = args[1];
            if (typeof args[2] === 'object') {
                _extend(opts, args[2]);
            }
        }
        else {
            _extend(opts, args[1] || {});
        }
    }
    else {
        _extend(opts, args.shift());
    }
    if (opts.json) {
        opts.headers = opts.headers || {};
        opts.body = JSON.stringify(opts.json);
        opts.headers['Content-Type'] = 'application/json;charset=utf-8';
        delete opts.json;
    }
    return opts;
}
/**
 * 进行 fetch 请求，跟原生的 fetch 不同的是，该函数允许通过 opts.url 的方式定义请求路径
 * @param opts
 *    url: String  请求地址
 *    accept: String  接收的返回数据格式， fetch 会将数据转换为对应的格式返回，如果没有传则根据 res.headers.Content-Type 来识别返回
 * @private
 */
function _fetch(opts) {
    let url = opts.url;
    delete opts.url;
    let accept = opts.accept;
    delete opts.accept;
    return fetch(url, opts).then((res) => {
        if (res.ok) {
            accept = accept || res.headers.get('Content-Type') || 'text';
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
            let error = new Error(res.statusText);
            error.name = 'StatusError';
            error.statusCode = res.status;
            throw error;
        }
    });
}
let phax = (...args) => _fetch(_opts(args));
phax.get = (...args) => _fetch(_opts(args));
['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD'].forEach((m) => {
    phax[m.toLowerCase()] = (...args) => {
        let opts = _opts(args);
        opts.method = m;
        return _fetch(opts);
    };
});
export default phax;
