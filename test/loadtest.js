import http from "k6/http";
import { check } from "k6";

// Define the target URL
const url = "https://127.0.0.1:443/";

export let options = {
  vus: 10, // Number of virtual users
  duration: "15s", // Duration of the test
};

const cert = open("../cert/cert.pem");
const key = open("../cert/key.pem");

export default function () {
  const res = http.get(url, {
    insecure: true,
  });

  // Check the response status code
  check(res, {
    "is status 200": (r) => r.status === 200,
  });
}
