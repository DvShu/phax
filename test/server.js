const http = require("http");
const fs = require("fs");
const path = require("path");
const ts = require("typescript");
const qs = require("querystring");

const tsConfig = {
  compilerOptions: {
    module: ts.ModuleKind.ES2015,
    removeComments: true,
  },
};

// 加载源文件
function loadSource(fn) {
  const prefix = [
    "(function (global, factory) {",
    "typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :",
    " typeof define === 'function' && define.amd ? define(factory) :",
    " (global = global || self, global.phax = factory());",
    "}(this, function () {\r\n",
  ];
  fs.readFile("lib/index.ts", "utf-8", (err, source) => {
    if (err) {
      console.error(err);
      fn({ code: 0 });
    } else {
      let compile = ts.transpileModule(source, tsConfig);
      const sourceText = compile.outputText.replace("export default", "return");
      prefix.push(sourceText);
      prefix.push("}));");
      fn({ code: 1, source: prefix.join("") });
    }
  });
}

// 加载测试源文件
function loadTestSource(fn) {
  fs.readFile("test/phax.test.ts", "utf-8", (err, data) => {
    if (err) {
      console.error(err);
      fn({ code: 0 });
    } else {
      let compile = ts.transpileModule(data, tsConfig);
      const sourceText = compile.outputText.replace(
        /import phax from .*\r\n/,
        ""
      );
      fn({ code: 1, source: sourceText });
    }
  });
}

function send(res, contentType, err, data) {
  if (err) {
    console.error(err);
    res.writeHead(404, { "Content-Type": "text/plain" });
  } else {
    res.writeHead(200, { "Content-Type": contentType });
    res.write(data);
  }
  res.end();
}

// 参数解析
function parseData(req, contentType, fn) {
  let reqData = "";
  req.on("data", function (chunk) {
    reqData += chunk;
  });
  req.on("end", function () {
    if (reqData !== "") {
      if (
        contentType != null &&
        contentType.indexOf("application/json") !== -1
      ) {
        fn({ type: "json", data: JSON.parse(reqData) });
      } else {
        fn({ type: "qs", data: Object.assign({}, qs.parse(reqData)) });
      }
    } else {
      fn(null);
    }
  });
}

http
  .createServer(function (req, res) {
    const parseUrl = new URL(req.url, "http://127.0.0.1:3000");
    const pathname = parseUrl.pathname;
    let filename = "/index.html";
    let contentType = "text/html";
    let staticFile = pathname === "/" ? true : false;
    if (pathname.endsWith(".js")) {
      filename = pathname;
      contentType = "application/javascript;charset=utf-8";
      staticFile = true;
    }
    if (staticFile === true) {
      // 访问首页地址
      if (filename === "/phax.js") {
        loadSource((s) => {
          send(
            res,
            "application/javascript;charset=utf-8;",
            s.code === 0 ? new Error("load source error!") : null,
            s.source
          );
        });
      } else if (filename === "/phax.test.js") {
        loadTestSource((s) => {
          send(
            res,
            "application/javascript;charset=utf-8;",
            s.code === 0 ? new Error("load source error!") : null,
            s.source
          );
        });
      } else {
        fs.readFile(path.join("test/", filename), function (err, data) {
          send(res, contentType, err, data);
        });
      }
    } else {
      if (pathname === "/system_monitor") {
        send(res, "text/plain", null, "SUCCESS");
      } else {
        let resBody = { pathname, method: req.method };
        let body = null;
        if (req.method === "GET" && parseUrl.search !== "") {
          // 有参 GET 请求
          body = {};
          for (let pair of parseUrl.searchParams.entries()) {
            body[pair[0]] = pair[1];
          }
          resBody.body = body;
          send(res, "application/json", null, JSON.stringify(resBody));
        } else if (req.method === "POST") {
          contentType = req.headers["content-type"];
          parseData(req, contentType, function (data) {
            if (data != null) {
              resBody.body = data.data;
              resBody.type = data.type;
            }
            send(res, "application/json", null, JSON.stringify(resBody));
          });
        }
      }
    }
  })
  .listen(3000);

console.log("Server running at http://127.0.0.1:3000");
