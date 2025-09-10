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
export async function r(config: RConfig): Promise<any>;
