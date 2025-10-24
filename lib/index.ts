export type RConfig = {
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
  /** 期望的服务端响应格式，默认为 "json" */
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "formData";
};

/**
 * 发送 HTTP 请求的工具函数
 *
 * @param config - 请求配置对象
 * @returns 返回一个解析为 JSON 的 Promise
 * @throws 当响应状态不为 ok 时抛出错误
 */
export async function r(config: RConfig) {
  const headers = new Headers({ ...config.headers });
  let body: null | string | FormData | URLSearchParams | undefined = undefined;

  // 处理 JSON 数据
  if (config.json) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json;charset=UTF-8");
    }
    body = JSON.stringify(config.json);
  }

  // 处理请求体
  if (config.body) {
    body = config.body;
  }

  // 发送请求并处理响应
  return fetch(config.url, {
    method: config.method || "GET",
    headers,
    body,
  })
    .then((res) => {
      const resQuue: any[] = [
        Promise.resolve({
          ok: res.ok,
          status: res.status,
          statusText: res.statusText,
        }),
      ];
      if (res.ok) {
        let resType = config.responseType;
        if (!resType) {
          let accept =
            res.headers.get("Content-Type") ||
            res.headers.get("Accept") ||
            "application/json";
          accept = accept.toLowerCase();
          if (accept.includes("application/json")) {
            resType = "json";
          } else {
            resType = "json";
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
      e.name = "HTTPError";
      e.status = res[0].status;
      e.statusText = res[0].statusText;
      e.data = res[1];
      throw e;
    });
}
