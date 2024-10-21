import http2 from "node:http2";
import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "url";

// Get the __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let server = http2.createSecureServer({
  key: fs.readFileSync(path.join(__dirname, "cert", "key.pem")),
  cert: fs.readFileSync(path.join(__dirname, "cert", "cert.pem")),
});

let homePage = fs.readFileSync(path.join(__dirname, "static", "index.html"));

let corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

server.on("stream", (stream) => {
  stream.respond({
    status: 200,
    "Content-Type": "text/html",
    ...corsHeaders,
  });
  stream.end(homePage);
});
server.on("sessionError", (err) => {
  console.log(err);
});
server.on("error", (err) => {
  console.log(err);
});

server.listen(443, () => {
  console.log("SERVER RUNNING ON PORT 443");
});

let redirectServer = http
  .createServer((req, res) => {
    res.writeHead(301, { Location: "https://" + req.headers.host + req.url });
    res.end();
  })
  .listen(80, () => console.log("REDIRECT SERVER RUNNING ON PORT 80"));
