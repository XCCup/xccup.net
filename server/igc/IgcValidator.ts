import fs from "fs";
import axios from "axios";
import axiosRetry from "axios-retry";
import FormData from "form-data";
import logger from "../config/logger";
import config from "../config/env-config";

axiosRetry(axios, { retries: 2 });

interface Options {
  disableGCheck?: boolean;
}

interface File {
  body: Buffer;
  name: string;
}

type ValidationResult = "PASSED" | "FAILED";

const igcValidator = {
  G_RECORD_PASSED: "PASSED" as const,
  G_RECORD_FAILED: "FAILED" as const,

  /**
   * Checks with the FAI API if a IGC file has a valid G record.
   *
   * @param {Object} igc An object which contains the path to or the content of the IGC file as also the IGC filename.
   */
  // TODO: Why not return boolean
  execute: async (
    igc: File | Express.Multer.File,
    options?: Options
  ): Promise<ValidationResult | undefined> => {
    // Skip igc validation if disabled in .env or method options
    if (config.get("disableGCheck") || options?.disableGCheck) {
      logger.info("Skipping igc G-Record validation");
      return igcValidator.G_RECORD_PASSED;
    }

    // http://vali.fai-civl.org/webservice.html
    logger.info("Validating igc file with FAI API");
    try {
      const url = "http://vali.fai-civl.org/api/vali/json";
      const formData = new FormData();

      // Differenciate between IGC upload via file transfer (normal) or via stream (leonardo)
      let buffer: Buffer;
      let filename: string;

      // If "path" exists on the igc object it means it's of type Express.Multer.File
      // Otherwise it's of type File
      if ("path" in igc) {
        buffer = fs.readFileSync(igc.path);
        filename = igc.filename;
      } else {
        buffer = Buffer.from(igc.body);
        filename = igc.name;
      }

      formData.append("igcfile", buffer, {
        filename,
        contentType: "application/octet-stream",
      });

      const config = {
        headers: {
          "Content-Type":
            "multipart/form-data; boundary=" + formData.getBoundary(),
          "Content-length": formData.getLengthSync(),
        },
        timeout: 20000,
      };
      const res = await axios.post(url, formData, config);

      const result = res.data.result;
      logger.debug("Validation result: " + result);

      return result;
    } catch (error) {
      logger.error(error);
    }
  },
};

module.exports = igcValidator;
export default igcValidator;
