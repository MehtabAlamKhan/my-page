import http2 from "node:http2";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "url";
import os from "node:os";
import cluster from "node:cluster";
import dotenv from "dotenv";
import zlib from "node:zlib";

// Get the __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cores = os.cpus().length;

let keyPath = "";
let certPath = "";
let homePage;

console.log(process.env.ENV);
if (process.env.ENV === "PROD") {
  keyPath = "/etc/letsencrypt/live/mehtab.in/privkey.pem";
  certPath = "/etc/letsencrypt/live/mehtab.in/fullchain.pem";
  homePage = fs.readFileSync(path.join(__dirname, "static", "minify.html"));
} else {
  keyPath = path.join(__dirname, "cert", "key.pem");
  certPath = path.join(__dirname, "cert", "cert.pem");
  homePage = fs.readFileSync(path.join(__dirname, "static", "index.html"));
}

let server = http2.createSecureServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
  minVersion: "TLSv1.3",
});

let font = fs.readFileSync(path.join(__dirname, "static", "F.woff"));

let corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

server.on("stream", (stream, headers) => {
  if (headers[":path"] == "/") {
    stream.respond({
      ":status": 200,
      "Content-Type": "text/html;charset=utf-8",
      "Content-Encoding": "gzip",
      ...corsHeaders,
    });
    stream.end(compress(homePage));
    return;
  }
  if (headers[":path"] == "/F.woff") {
    stream.respond({
      ":status": 200,
      "content-type": "application/font-woff",
      "Content-Encoding": "gzip",
      ...corsHeaders,
    });
    stream.end(compress(font));
    return;
  }
});
server.on("sessionError", (err) => {
  // console.log(err);
});
server.on("error", (err) => {
  // console.log(err);
});
server.listen(443, () => {
  // console.log("SERVER RUNNING ON PORT 443");
});

// if (cluster.isPrimary) {
//   for (let i = 0; i < cores; i++) {
//     cluster.fork();
//   }
//   cluster.on("exit", (worker, code, signal) => {
//     cluster.fork();
//   });
// } else {

//   let redirectServer = http
//     .createServer((req, res) => {
//       res.writeHead(301, { Location: "https://" + req.headers.host + req.url });
//       res.end();
//     })
//     .listen(8080, () => {});
// }

function compress(data) {
  return zlib.gzipSync(data, { level: 9 });
}
