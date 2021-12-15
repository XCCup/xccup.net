const fs = require("fs");

const igcPath = process.argv[2];
console.log("Will parse ", igcPath);

const IGCParser = require("igc-parser");

const igcAsPlainText = fs.readFileSync(igcPath, "utf8");

const igcAsJson = IGCParser.parse(igcAsPlainText, { lenient: true });

console.log(JSON.stringify(igcAsJson, null, 2));
