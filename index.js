function _extend(target, source) {
  for (let key in source) {
    if (source[key] != null) {
      target[key] = source[key];
    }
  }
}

class Phax {
  constructor(method, args) {
    this.opts = {credentials: 'same-origin', method: method};
    this._args(args);
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

  _request(way = 'text') {
    let url = this.opts.url;
    delete this.opts.url;
    return fetch(url, this.opts).then((res) => {
      if (res.ok) {
        return res[way]();
      } else {
        let error = new Error(res.statusText);
        error.name = 'StatusError';
        error.statusCode = res.status;
        throw error;
      }
    });
  }
}

export function get(...args) {
  return new Phax('GET', args);
}

export function post(...args) {
  return new Phax('POST', args);
}
