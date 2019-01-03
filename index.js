function _extend(target, source) {
    for (let key in source) {
        if (source[key] != null) {
            target[key] = source[key];
        }
    }
}
class R {
    constructor(args) {
        this.opts = { credentials: 'same-origin', method: 'GET' };
        this._args(args);
    }
    method(verb) {
        this.opts.method = verb.toUpperCase();
        return this;
    }
    _args(args) {
        if (typeof args[0] === 'string') {
            this.opts.url = args.shift();
        }
        if (typeof args[0] === 'object') {
            _extend(this.opts, args.shift());
        }
        this.opts.headers = this.opts.headers || {};
        if (this.opts.json) {
            this.opts.body = JSON.stringify(this.opts.json);
            this.opts.headers['Content-Type'] = 'application/json';
            delete this.opts.json;
        }
    }
    text() {
        return this._request('text');
    }
    json() {
        return this._request('json');
    }
    blob() {
        return this._request('blob');
    }
    arrayBuffer() {
        return this._request('arrayBuffer');
    }
    formData() {
        return this._request('formData');
    }
    _request(way) {
        let url = this.opts.url;
        delete this.opts.url;
        return fetch(url, this.opts).then((res) => {
            if (res.ok) {
                return res[way]();
            }
            else {
                let error = new Error(res.statusText);
                error.name = 'StatusError';
                error.statusCode = res.status;
                throw error;
            }
        });
    }
}
let phax = (...args) => new R(args);
phax.get = (...args) => new R(args).method('GET');
phax.post = (...args) => new R(args).method('POST');
phax.put = (...args) => new R(args).method('PUT');
phax.patch = (...args) => new R(args).method('PATCH');
phax.delete = (...args) => new R(args).method('DELETE');
phax.head = (...args) => new R(args).method('HEAD');
export default phax;
