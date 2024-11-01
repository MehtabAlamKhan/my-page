import http from "node:http";

const deployServer = http
  .createServer((req, res) => {
    console.log(req.socket.remoteAddress);
    let msg = "";
    req.on("data", (chunk) => {
      msg += chunk.toString();
    });
    req.on("close", () => {
      console.log(msg);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ status: 200, message: "Message received" }));
    });
  })
  .listen(8080);
