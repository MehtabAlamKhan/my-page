import http from "node:http";

let data = { msg: "DEPLOY" };

const options = {
  hostname: "https://deploy.mehtab.in",
  port: 8080,
  path: "/",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = http.request(options, (res) => {});
req.on("error", (error) => {});
req.write(data);
req.end();
