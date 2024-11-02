import http2 from "node:http2";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "url";
import zlib from "node:zlib";
import minifier from "html-minifier";
import os from "node:os";
import cluster from "node:cluster";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cores = os.cpus().length;

let keyPath, certPath;
if (process.env.NODE_ENV === "PROD") {
  keyPath = "/etc/ssl/private/privkey.pem";
  certPath = "/etc/ssl/certs/fullchain.pem";
} else {
  keyPath = path.join(__dirname, "cert", "key.pem");
  certPath = path.join(__dirname, "cert", "cert.pem");
}

let server = http2.createSecureServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
  minVersion: "TLSv1.3",
});

let homePage = fs.readFileSync(path.join(__dirname, "static", "index.html")).toString("utf-8");
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
    stream.end(compress(minifier.minify(homePage, { removeAttributeQuotes: true, removeComments: true })));
    return;
  } else if (headers[":path"] == "/F.woff") {
    stream.respond({
      ":status": 200,
      "content-type": "application/font-woff",
      "Content-Encoding": "gzip",
      ...corsHeaders,
    });
    stream.end(compress(font));
    return;
  } else {
    stream.respond({
      ":status": 404,
      "content-type": "text/html;charset=utf-8",
      "Content-Encoding": "gzip",
    });
    stream.end(
      compress(`
      <html>
          <body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
              <h1 style="text-align: center;font-family: monospace;">404 Not Found - 💩</h1>
          </body>
      </html>
  `)
    );
  }
});
server.on("sessionError", (err) => {});
server.on("error", (err) => {});
process.on("uncaughtException", (err) => {});

if (cluster.isPrimary) {
  for (let i = 0; i < cores; i++) {
    cluster.fork();
  }
  cluster.on("exit", (worker, code, signal) => {
    cluster.fork();
  });
} else {
  server.listen(443, () => {});
}

function compress(data) {
  return zlib.gzipSync(data, { level: 9 });
}
