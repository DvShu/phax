# phax

基于 `fetch` 封装的轻量级的 `http` 请求封装;

## 安装

```bash
pnpm add phax
```

## 使用

```javascript
import { r } from "phax";

await r({ url: "" });
```

### API

1. `r(config: RConfig): Promise<any>`

执行 http 请求

### RConfig

```typescript
type RConfig = {
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
  /** 期望的服务端响应格式，如果不传则根据响应头的 `content-type` 和 `accept` 自动识别，如果都未识别到则为 "json" */
  responseType?: "json" | "text" | "blob" | "arrayBuffer" | "formData";
};
```

## License

[MIT](https://github.com/DvShu/phax/blob/master/LICENSE "MIT")
