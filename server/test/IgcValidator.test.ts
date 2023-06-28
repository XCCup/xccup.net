/**
 * @jest-environment node
 */
import path from "path";
import { validateIgc } from "../igc/IgcValidator";
import { readIgcFile } from "../igc/IgcFileRead";

test("Validate an igc-File which should result to PASSED", (done) => {
  const { content, encoding } = readFile("kai_fai", "fai_60km42_3h53m.igc");

  const igc = {
    name: "AValidFile.igc",
    body: content,
  };

  validateIgc(igc.body, igc.name)
    .then((result) => {
      expect(result).toBe("PASSED");
      done();
    })
    .catch((error) => done(error));
});

test("Validate an igc-File which should result to PASSED (ANSI Encoding)", (done) => {
  const { content, encoding } = readFile("ansi", "77814_36RXXXX1.igc");

  const igc = {
    name: "AValidFile.igc",
    body: content,
  };

  validateIgc(igc.body, igc.name, encoding)
    .then((result) => {
      expect(result).toBe("PASSED");
      done();
    })
    .catch((error) => done(error));
});

test("Validate an igc-File which should result to FAILED", (done) => {
  const { content, encoding } = readFile(
    "kai_fai_invalid",
    "removed_line_20to22.igc"
  );

  const igc = {
    name: "AInvalidFile.igc",
    body: content,
  };

  validateIgc(igc.body, igc.name, encoding)
    .then((result) => {
      expect(result).toBe("FAILED");
      done();
    })
    .catch((error) => done(error));
});

function readFile(folder: string, file: string) {
  const parentDir = path.resolve(__dirname, "..");
  const igcFilePath = path.join(parentDir, "/igc/demo_igcs", folder, file);

  return readIgcFile(igcFilePath);
}
