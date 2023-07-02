/**
 * @jest-environment node
 */
import path from "path";
import fs from "fs";
import { validateIgc } from "../igc/IgcValidator";

test("Validate an igc-File which should result to PASSED", (done) => {
  const igc = {
    name: "AValidFile.igc",
    path: createFilePath("kai_fai", "fai_60km42_3h53m.igc"),
  };

  validateIgc(igc.path, igc.name)
    .then((result) => {
      expect(result).toBe("PASSED");
      done();
    })
    .catch((error) => done(error));
});

test("Validate an igc-File which should result to PASSED (Win1252 Encoding)", (done) => {
  const igc = {
    name: "AValidFile.igc",
    path: createFilePath("non-utf8", "Win1252.igc"),
  };

  validateIgc(igc.path, igc.name)
    .then((result) => {
      expect(result).toBe("PASSED");
      done();
    })
    .catch((error) => done(error));
});

test("Validate an igc-File which should result to FAILED", (done) => {
  const igc = {
    name: "AInvalidFile.igc",
    path: createFilePath("kai_fai_invalid", "removed_line_20to22.igc"),
  };

  validateIgc(igc.path, igc.name)
    .then((result) => {
      expect(result).toBe("FAILED");
      done();
    })
    .catch((error) => done(error));
});

function readFile(folder: string, file: string) {
  const parentDir = path.resolve(__dirname, "..");
  const igcFilePath = path.join(parentDir, "/igc/demo_igcs", folder, file);

  // return readIgcFile(igcFilePath);
  return fs.readFileSync(igcFilePath);
}

function createFilePath(folder: string, file: string) {
  const parentDir = path.resolve(__dirname, "..");
  return path.join(parentDir, "/igc/demo_igcs", folder, file);
}
