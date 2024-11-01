import http from "node:http";

let data = JSON.stringify({ msg: "DEPLOY" });

const options = {
  hostname: "http://deploy.mehtab.in",
  port: 8080,
  path: "/",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(data),
  },
};

const req = http.request(options, (res) => {});
req.on("error", (error) => {});
req.write(data);
req.end();
