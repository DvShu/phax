export interface PhaxRequestConfig {
  /**
   * 请求的地址
   */
  url: string;
  /**
   * 配置是否带上 cookie，默认：same-origin: 表示cookie只能同域发送，不能跨域发送
   */
  credentials?: RequestCredentials;
  /**
   * 请求的方法，默认：GET
   */
  method?: string;
  /**
   * 解析的返回类型，可以有 json | text，如果不传，则根据 response.headers Content-Type 进行判断
   */
  accept?: string;
  /**
   * 请求的实体内容，fetch-body
   */
  body?: any;
  /**
   * 当上传 json 格式的参数时，配置这个字段，会自动将请求的 Content-Type 配置为 json
   */
  json?: any;
  /**
   * 请求头部，fetch-headers
   */
  headers?: any;
  /**
   * 拼接到 url 地址上的请求参数
   */
  query?: any;
  /**
   * 转换为 form-urlencoded 请求的参数
   */
  params?: any;
}

interface InterceptorIntf {
  /**
   * 注册请求过滤器，用于在每一次请求前，对参数进行自定义的处理
   * @param cb 过滤函数，用于对参数的处理
   */
  request: (cb: (params: PhaxRequestConfig) => PhaxRequestConfig) => void;
  /**
   * 注册返回过滤器，用于对返回的结果做处理
   * @param cb  过滤函数，用于对返回结果的处理
   * @param err 错误处理，对请求失败后的错误做处理
   */
  response: (cb: (params: any) => any, err?: (err: PhaxError) => void) => void;
}

/**
 * 执行 fetch 请求
 */
interface PhaxInstance {
  /**
   * 配置拦截器
   */
  interceptors: InterceptorIntf;
  /**
   * 执行 GET 请求
   */
  get: PhaxInstance;
  post: PhaxInstance;
  /**
   * 使用 fetch 请求传递的 url
   * @param url 请求地址
   */
  (options: string | PhaxRequestConfig): Promise<any>;
  /**
   * 使用 fetch 请求传递的 url
   * @param url {string}    请求地址
   * @param options {string | Object} 如果为 string 则表示解析的返回类型，可以有 json | text，如果不传，则根据 response.headers Content-Type 进行判断
   */
  (url: string, options: string | PhaxRequestConfig): Promise<any>;
  /**
   * 使用 fetch 请求
   * @param url 请求地址
   * @param accept {string} 解析的返回类型，可以有 json | text，如果不传，则根据 response.headers Content-Type 进行判断
   * @param options {PhaxRequestConfig} 请求配置
   */
  (url: string, accept: string, options: PhaxRequestConfig): Promise<any>;

  /**
   * 注册拦截器(过滤器)
   */
  [index: string]: any;
}

export interface PhaxError extends Error {
  /**
   * 后台返回的错误信息的实体内容
   */
  body: any;
  /**
   * 错误状态码
   */
  status: number;
}

class PhaxErrorInstance extends Error implements PhaxError {
  public body: any;
  public status: number;
  public constructor(status: number, errmsg: string, body: any) {
    super(errmsg);
    this.body = body;
    this.status = status;
  }
}

function _extend(target: any, source: any): any {
  for (let key in source) {
    if (source[key] != null) {
      target[key] = source[key];
    }
  }
}

/**
 * 组装 数组 形式的值为 post 参数形式
 */
function arrayParams(key: string, arr: string[]) {
  let q = "";
  arr.forEach((item: string) => {
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
function qs(params: any) {
  let str = "";
  for (let key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      let value = params[key];
      if (value != null) {
        if (value instanceof Array) {
          str += "&" + arrayParams(key, value);
        } else {
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
  request: function (params: PhaxRequestConfig) {
    return params;
  },
  response: function (res: any) {
    return res;
  },
  error: function (err: PhaxErrorInstance) {
    return err;
  },
};

function _init(initParams: any) {
  let params: any = { credentials: "same-origin", method: "GET" };
  if (typeof initParams[0] === "string") {
    params.url = initParams[0];
    if (typeof initParams[1] === "string") {
      params.accept = initParams[1];
      if (typeof initParams[2] === "object") {
        _extend(params, initParams[2]);
      }
    } else {
      _extend(params, initParams[1] || {});
    }
  } else {
    _extend(params, initParams[0]);
  }
  return params;
}

/**
 * 组装各种参数包括, json、query
 * @param params 配置参数
 */
function _genBody(params: any) {
  if (params.json) {
    // json
    params.headers = params.headers || {};
    params.body = JSON.stringify(params.json);
    params.headers["Content-Type"] = "application/json;charset=utf-8";
    delete params.json;
  } else if (params.params) {
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
      } else {
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
function _fetch(config: PhaxRequestConfig): any {
  if (typeof interceptors.request === "function") {
    config = interceptors.request(config);
  }
  config = _genBody(config); // 进行参数组装
  let url = config.url;
  let accept = config.accept;
  delete (config as any).url;
  delete config.accept;
  return fetch(url as string, config)
    .then((res) => {
      if (res.ok) {
        let all = [];
        // 请求成功
        // 接收的返回值类型
        accept = (accept ||
          res.headers.get("Content-Type") ||
          "text") as string;
        if (/json/.test(accept)) {
          all.push(res.json());
        } else if (/form-data/.test(accept)) {
          all.push(res.formData());
        } else {
          all.push(res.text());
        }
        all.push({ __tag: "ok", status: res.status });
        return Promise.all(all);
      } else {
        let all: any = [
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
    .then(
      (a) => {
        let extra = a[1];
        if (extra.__tag === "ok") {
          return Promise.resolve(a[0]);
        } else {
          let error = new PhaxErrorInstance(extra.status, extra.text, a[0]);
          error.name = extra.__tag;
          interceptors.error(error);
          return Promise.reject(error);
        }
      },
      (err: PhaxError) => {
        interceptors.error(err);
        return Promise.reject(err);
      }
    );
}

let phax: PhaxInstance = (function () {
  let a = _fetch(_init(arguments));
  return a;
} as unknown) as PhaxInstance;

["get", "post"].forEach((m: string) => {
  phax[m] = function () {
    let p: any = _init(arguments);
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
  request: function (cb: (param: PhaxRequestConfig) => PhaxRequestConfig) {
    interceptors.request = cb;
  },
  response: function (cb: any, err: any) {
    interceptors.response = cb;
    if (typeof err === "function") {
      interceptors.error = err;
    }
  },
};

export default phax;
