import { r } from "../lib/index.ts";
import { describe, it } from "node:test";
import assert from "node:assert";

// 执行该文件之前，请先执行 node test/server.js 启动服务器
const baseUrl = "http://127.0.0.1:3000";

interface PhaxResonse {
  /** 请求的地址 */
  pathname: string;
  /** 请求的函数 */
  method: string;
  body?: any;
}

interface PhaxBodyResponse extends PhaxResonse {
  body: {
    /** 请求时上传的参数id */
    id: number;
  };
}

interface PhaxPostResponse extends PhaxBodyResponse {
  /** 请求的类型，可选值有: qs、json */
  type: string;
}

describe("phax", function () {
  describe("#get", function () {
    it("base", async () => {
      const res = await r({ url: `${baseUrl}/test?id=1` });
      assert.strictEqual(res.method, "GET");
      assert.equal(res.body.id, 1);
      assert.strictEqual(res.pathname, "/test");
    });

    it("response_string", async () => {
      const res = await r({ url: `${baseUrl}/system_monitor` });
      assert.strictEqual(res, "SUCCESS");
    });
  });

  describe("#post", function () {
    it("querystring", async () => {
      const res = await r({ url: `${baseUrl}/post`, body: "id=1", method: "POST" });
      assert.strictEqual(res.method, "POST");
      assert.strictEqual(res.type, "qs");
      assert.equal(res.body.id, 1);
      assert.strictEqual(res.pathname, "/post");
    });

    it("json", async () => {
      const res = await r({ url: `${baseUrl}/post`, json: { id: 1 }, method: "POST" });
      assert.strictEqual(res.method, "POST");
      assert.strictEqual(res.type, "json");
      assert.strictEqual(res.body.id, 1);
      assert.strictEqual(res.pathname, "/post");
    });
  });
});
