function _extend(target: any, source: any): any {
  for (let key in source) {
    if (source[key] != null) {
      target[key] = source[key];
    }
  }
}

interface PhaxInit {
  url?: string,
  credentials?: string,
  method?: string,
  accept?: string,
  body?: any,
  json?: object,
  headers?: any
}

interface PhaxIntl { 
  get?: (a: any)=>void
}

function _init(initParams: any): PhaxInit {
  let params: any = { credentials: 'same-origin', method: 'GET' };
  if (typeof initParams[0] === 'string') {
    params.url = initParams[0];
    if (typeof initParams[1] === 'string') {
      params.accept = initParams[1];
      if (typeof initParams[2] === 'object') {
        _extend(params, initParams[2]);
      }
    } else {
      _extend(params, initParams[1] || {});
    }
  } else {
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
function _fetch(params: any): any {
  let url: string = params.url;
  let accept: string = params.accept;
  delete params.url;
  delete params.accept;
  return fetch(url, params).then((res: any) => {
    if (res.ok) {
      // 请求成功
      // 接收的返回值类型
      accept = accept || res.headers.get("Content-Type") || "text";
      if (/json/.test(accept)) {
        return res.json();
      } else if (/form-data/.test(accept)) {
        return res.formData();
      } else {
        return res.text();
      }
    } else {
      // 请求失败
      let error: any = new Error(res.statusText);
      error.name = "FetchError";
      error.statusCode = res.status;
      throw error;
    }
  });
}

/**
 * 使用 Interface 定义函数
 */
interface PhaxFunc {
  (url: string): Promise<any>
  (options: PhaxInit): Promise<any>
  (url: string, accept: string): Promise<any>
  (url: string, accept: string, options: PhaxInit): Promise<any>
  (url: string, options: PhaxInit): Promise<any>
  (url: string, options: PhaxInit): Promise<any>,
  get: PhaxFunc,
  post: PhaxFunc
}

let phax: PhaxFunc | any = function (params: any): any {
  return _fetch(_init(arguments));
};

['get', 'post'].forEach(function (m: string) {
  phax[m] = function (params: any) {
    let p: any = _init(arguments);
    p.method = m.toUpperCase();
    return _fetch(p);
  }
})

export default phax
