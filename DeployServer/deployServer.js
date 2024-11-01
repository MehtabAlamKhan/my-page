import http from "node:http";

const deployServer = http
  .createServer((req, res) => {
    let msg;
    req.on("data", (chunk) => {
      msg += chunk.toString("utf-8");
    });
    req.on("end", () => {
      console.log(msg);
    });
  })
  .listen(8080);
