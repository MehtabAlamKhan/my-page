import http2 from "node:http2";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let keyPath = path.join(__dirname, "cert", "key.pem");
let certPath = path.join(__dirname, "cert", "cert.pem");

let deployServer = http2.createSecureServer({
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
  minVersion: "TLSv1.3",
});

deployServer.on("stream", (stream, headers) => {
  let msg = "";

  stream.on("data", (chunk) => {
    msg += chunk.toString("utf-8");
  });

  stream.on("end", () => {
    startDeployment(msg);
    stream.respond({ ":status": 200 });
    stream.end(JSON.stringify({ status: 200, message: "Message received" }));
  });
});

function startDeployment(msg) {
  console.log(JSON.parse(msg).msg);
  if (JSON.parse(msg).msg == "DEPLOY") {
    const exec = require("node:child_process");
    const scriptPath = "./deply.sh";

    const process = exec.exec(`bash ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing script: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Script stderr: ${stderr}`);
        return;
      }
    });
    process.on("exit", (code) => {
      console.log(`Process exited with code ${code}`);
    });
  }
}

deployServer.listen(8080, () => {
  console.log("Server is listening on port 8080");
});
