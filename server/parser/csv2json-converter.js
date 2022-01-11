// const readline = require("readline");
// const { sanitizeHtml } = require("../helper/Utils");
const csv = require("csv-parser");
const fs = require("fs");
const results = [];

fs.createReadStream(process.argv[2])
  .pipe(csv({ separator: ";" }))
  .on("data", (data) => results.push(data))
  .on("end", () => {
    // console.log(results);

    fs.writeFile(
      "convertTo.json",
      JSON.stringify(results, null, 2),
      "utf8",
      (err) => {
        console.log(err);
      }
    );
  });

// // Use this code to parse flight reports
// const regex = /^(\d{2,5});(.*)/;

// let currentObject;

// const rl = readline.createInterface({
//   input: fs.createReadStream(process.argv[2]),
//   output: process.stdout,
//   terminal: false,
// });
// rl.on("line", function (line) {
//   const lineGroups = line.match(regex);
//   try {
//     if (lineGroups) {
//       console.log("test");
//       results.push(currentObject);
//       currentObject = {
//         FlugID: lineGroups[1],
//         Flugbericht: sanitizeHtml(lineGroups[2]),
//       };
//     } else {
//       currentObject.Flugbericht += line;
//     }
//   } catch (error) {
//     console.error(error);
//     console.error("Failed line: ", line);
//   }
// });

// rl.on("close", function (line) {
//   fs.writeFile(
//     "convertTo.json",
//     JSON.stringify(results, null, 2),
//     "utf8",
//     (err) => {
//       console.log(err);
//     }
//   );
// });
