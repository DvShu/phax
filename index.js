/**
 * 发送 HTTP 请求的工具函数
 *
 * @param config - 请求配置对象
 * @returns 返回一个解析为 JSON 的 Promise
 * @throws 当响应状态不为 ok 时抛出错误
 */
export async function r(config) {
  const headers = new Headers({ ...config.headers });
  let body = undefined;

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
  }).then((res) => {
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
          return res.text();
        case "blob":
          return res.blob();
        case "arrayBuffer":
          return res.arrayBuffer();
        case "formData":
          return res.formData();
        default:
          return res.json();
      }
    }
    throw new Error(`${res.status} - ${res.statusText}`);
  });
}
