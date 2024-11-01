import http2 from "node:http2";
let data = JSON.stringify({ msg: "DEPLOY" });
const client = http2.connect("", {
  rejectUnauthorized: true,
});

const req = client.request({
  ":path": "/",
  ":method": "POST",
  "Content-Type": "application/json",
  "Content-Length": Buffer.byteLength(data),
});

// Handle the response from the server
req.on("response", (headers, flags) => {
  req.on("data", (chunk) => {
    console.log(chunk.toString());
  });
  req.on("end", () => {
    client.close();
  });
});

req.write(data);
req.end();
