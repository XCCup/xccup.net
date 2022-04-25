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

interface File extends Express.Multer.File {
  body?: Buffer;
  name?: string;
}

const igcValidator = {
  G_RECORD_PASSED: "PASSED",
  G_RECORD_FAILED: "FAILED",

  /**
   * Checks with the FAI API if a IGC file has a valid G record.
   *
   * @param {Object} igc An object which contains the path to or the content of the IGC file as also the IGC filename.
   */

  execute: async (igc: File, options?: Options) => {
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
      // TODO: 🧐🍝
      let buffer: Buffer;
      if (igc.path) {
        buffer = fs.readFileSync(igc.path);
      } else if (igc.body) {
        buffer = Buffer.from(igc.body);
      } else {
        return;
      }

      const filename = igc.filename ?? igc.name;

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
