const fs = require("fs");
const path = require("path");

const htmlPath = path.join(__dirname, "..", "the-system.html");
const html = fs.readFileSync(htmlPath, "utf8");
const match = html.match(/<script>([\s\S]*)<\/script>/);

if (!match) {
  throw new Error("No inline script found in the-system.html");
}

new Function(match[1]);
console.log("HTML JavaScript syntax OK");
