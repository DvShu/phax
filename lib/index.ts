import { generateSignatureHeader } from "@asteres/signature";

/** 默认配置对象，包含 AppID、AppSecret 和基础 URL */
let defaultConfig = {
  /** 用于签名的 AppID */
  appId: "",
  /** 用于签名的 AppSecret */
  appSecret: "",
  /** 基础 URL，用于拼接请求路径 */
  baseUrl: "",
};

export type RequestConfig = {
  /** 请求的 URL */
  url: string;
  /** HTTP 方法，默认为 "GET" */
  method?: "GET" | "POST";
  /** 请求头对象 */
  headers?: Record<string, string>;
  /** 要发送的 JSON 数据，会自动序列化为字符串, 并且自动添加请求头 */
  json?: Record<string, any>;
  /** 请求体，可以是字符串、FormData 或 URLSearchParams */
  body?: string | FormData | URLSearchParams | null;
  /** 查询参数 */
  query?: string | Record<string, any>;
  /** 期望的服务端响应格式，默认为 "json" */
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "formData";
};

export type RConfig = RequestConfig & Partial<typeof defaultConfig>;

/**
 * 设置默认配置的函数
 *
 * @param config - 包含 AppID、AppSecret 和基础 URL 的配置对象
 */
export async function setConfig(config: typeof defaultConfig) {
  Object.assign(defaultConfig, config);
}

/**
 * 将查询参数对象或 URLSearchParams 转换为查询字符串
 * @param query - 查询参数对象或 URLSearchParams 实例
 * @returns 返回格式化后的查询字符串,以'?'开头,如果 query 为空则返回空字符串
 */
function queryStringify(query: string | Record<string, any> | object) {
  if (query) {
    let q;
    if (!(query instanceof URLSearchParams)) {
      q = new URLSearchParams(query as string);
    } else {
      q = query;
    }
    const qstr = q.toString();
    return `${qstr ? "?" : ""}${qstr}`;
  }
  return "";
}

/**
 * 发送 HTTP 请求的工具函数
 *
 * @param config - 请求配置对象
 * @returns 返回一个解析为 JSON 的 Promise
 * @throws 当响应状态不为 ok 时抛出错误
 */
export async function r(config: RConfig) {
  const method = config.method || "GET";
  const headers = new Headers({ ...config.headers });
  let body: null | string | FormData | URLSearchParams | undefined = config.body;

  // 处理 JSON 数据
  if (!body && config.json) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json;charset=UTF-8");
    }
    body = JSON.stringify(config.json);
  }

  // 签名
  const appid = config.appId || defaultConfig.appId;
  const appSecret = config.appSecret || defaultConfig.appSecret;
  let url = config.url;
  if (appid && appSecret) {
    const signInfo = await generateSignatureHeader({
      appid: appid,
      secretKey: appSecret,
      method: method,
      url: config.url,
      body,
      query: config.query as object,
    });
    url = signInfo.url;
    delete config.query;
    headers.set("X-Signature", signInfo["headerValue"]);
  }
  if (config.query) {
    url += queryStringify(config.query);
  }
  url = `${defaultConfig.baseUrl}${url}`;

  // 发送请求并处理响应
  return fetch(url, {
    method,
    headers,
    body, // oxlint-disable-line
  })
    .then((res) => {
      const resQuue: any[] = [
        Promise.resolve({
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
          headers: res.headers,
        }),
      ];
      if (res.ok) {
        let resType = config.responseType;
        if (!resType) {
          let accept =
            res.headers.get("Content-Type") || res.headers.get("Accept") || "application/json";
          accept = accept.toLowerCase();
          if (accept.includes("application/json")) {
            resType = "json";
          } else {
            resType = "text";
          }
        }
        switch (resType) {
          case "text":
            resQuue.push(res.text());
            break;
          case "blob":
            resQuue.push(res.blob());
            break;
          case "arrayBuffer":
            resQuue.push(res.arrayBuffer());
            break;
          case "formData":
            resQuue.push(res.formData());
            break;
          default:
            resQuue.push(res.json());
            break;
        }
      } else {
        resQuue.push(res.text());
      }
      return Promise.all(resQuue);
    })
    .then((res: any) => {
      if (res[0].ok) {
        return res[1];
      }
      const e: any = new Error(`${res[0].status} - ${res[0].statusText}`);
      e.name = "HTTPRequestError";
      e.status = res[0].status;
      e.statusText = res[0].statusText;
      e.data = res[1];
      throw e;
    });
}
