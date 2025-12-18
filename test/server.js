import http from "http";
import qs from "querystring";

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
      if (contentType != null && contentType.indexOf("application/json") !== -1) {
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
    let contentType = "text/html";

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
  })
  .listen(3000);

console.log("Server running at http://127.0.0.1:3000");
