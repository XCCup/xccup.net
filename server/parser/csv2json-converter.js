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
