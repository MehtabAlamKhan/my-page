import http from "node:http";

let data = JSON.stringify({ msg: "DEPLOY" });

const options = {
  hostname: "deploy.mehtab.in",
  port: 8080,
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = http.request(options, (res) => {
  res.on("end", () => {
    process.exit(0);
  });
});
req.on("error", (error) => {
  process.exit(1);
});
req.write(data);
req.end();
