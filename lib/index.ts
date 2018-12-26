function _extend(target: any, source: any) {
  for (let key in source) {
    if (source[key] != null) {
      target[key] = source[key];
    }
  }
}

class Phax {

  opts: any;

  constructor(method: string, args: any[]) {
    this.opts = { credentials: 'same-origin', method: method };
    this._args(args);
  }

  _args(args: any[]) {
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
    let url: string = this.opts.url;
    delete this.opts.url;

    return fetch(url, this.opts).then((res: any) => {
      if (res.ok) {
        return res[way]();
      } else {
        let error: any = new Error(res.statusText);
        error.name = 'StatusError';
        error.statusCode = res.status;
        throw error;
      }
    });
  }
}

export function get(...args: any[]) {
  return new Phax('GET', args);
}

export function post(...args: any[]) {
  return new Phax('POST', args);
}
