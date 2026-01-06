import { r } from "../lib/index.ts";
import type { RConfig } from "../lib/index.ts";
import test from "node:test";

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

// nodejs test

describe("phax", function () {
  describe("#get", function () {
    it("base", function (done) {
      phax.get("/test?id=1").then((res: PhaxBodyResponse) => {
        expect(res.method).to.eql("GET");
        expect(res.body.id).to.eql(1);
        expect(res.pathname).to.equal("/test");
        done();
      });
    });

    it("response_string", function (done) {
      phax.get("/system_monitor").then((res: string) => {
        expect(res).to.equal("SUCCESS");
        done();
      });
    });

    it("option_request", function (done) {
      phax({
        method: "get",
        url: "/test?id=1",
      }).then((res: PhaxBodyResponse) => {
        expect(res.method).to.eql("GET");
        expect(res.body.id).to.eql(1);
        expect(res.pathname).to.equal("/test");
        done();
      });
    });
  });

  describe("#post", function () {
    it("querystring", function (done) {
      phax
        .post({
          url: "/post",
          body: "id=1",
        })
        .then((res: PhaxPostResponse) => {
          expect(res.pathname).to.equal("/post");
          expect(res.method).to.eql("POST");
          expect(res.type).to.eql("qs");
          expect(res.body.id).to.eql(1);
          done();
        });
    });

    it("json", function (done) {
      phax
        .post({
          url: "/post",
          json: { id: 1 },
        })
        .then((res: PhaxPostResponse) => {
          expect(res.pathname).to.equal("/post");
          expect(res.method).to.eql("POST");
          expect(res.type).to.eql("json");
          expect(res.body.id).to.eql(1);
          done();
        });
    });
  });

  describe("#interceptors", function () {
    it("request_and response", function (done) {
      // 配置请求拦截
      phax.interceptors.request(function (params: PhaxRequestConfig) {
        params.json.b = 2;
        return params;
      });
      // 配置返回拦截
      phax.interceptors.response(
        function (params) {
          return params;
        },
        (err: PhaxError) => {},
      );
      phax({
        method: "POST",
        url: "/post",
        json: { id: 1 },
      }).then((res: PhaxPostResponse) => {
        expect(res.pathname).to.equal("/post");
        expect(res.method).to.eql("POST");
        expect(res.type).to.eql("json");
        expect(res.body.id).to.eql(1);
        expect((res.body as any).b).to.eql(2);
        done();
      });
    });
  });
});
