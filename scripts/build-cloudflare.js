const fs = require("fs");
const path = require("path");

const source = path.join(__dirname, "..", "src", "worker.js");
const target = path.join(__dirname, "..", "public", "_worker.js");

fs.copyFileSync(source, target);
console.log("Cloudflare Pages worker prepared.");
