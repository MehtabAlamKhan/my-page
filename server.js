import http2 from "node:http2";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "url";
import os from "node:os";
import cluster from "node:cluster";

const cores = os.cpus().length;

// Get the __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server = http2.createSecureServer({
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
  minVersion: "TLSv1.3",
});

let homePage = fs.readFileSync(path.join(__dirname, "static", "index.html"));
let font = fs.readFileSync(path.join(__dirname, "static", "F.ttf"), (err) => {});

let corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

server.on("stream", (stream, headers) => {
  if (headers[":path"] == "/") {
    stream.respond({
      ":status": 200,
      "Content-Type": "text/html;charset=utf-8",
      ...corsHeaders,
    });
    stream.end(homePage);
  }
  if (headers[":path"] == "/F.ttf") {
    stream.respond({
      ":status": 200,
      "content-type": "font/ttf",
      "Content-Length": 188504,
      ...corsHeaders,
    });
    stream.end(font);
  }
});
server.on("sessionError", (err) => {
  // console.log(err);
});
server.on("error", (err) => {
  // console.log(err);
});

if (cluster.isPrimary) {
  for (let i = 0; i < cores; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
} else {
  server.listen(443, () => {
    // console.log("SERVER RUNNING ON PORT 443");
  });
  let redirectServer = http
    .createServer((req, res) => {
      res.writeHead(301, { Location: "https://" + req.headers.host + req.url });
      res.end();
    })
    .listen(80, () => {});
}
