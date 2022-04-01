const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const logger = require("../config/logger");
const config = require("../config/env-config");

const igcValidator = {
  G_RECORD_PASSED: "PASSED",
  G_RECORD_FAILED: "FAILED",

  /**
   *
   * @param {*} igc
   * @param {boolean} options Options: { disableGCheck }
   * @returns
   */
  execute: async (igc, options) => {
    // Skip igc validation if disabled in .env or method options
    if (config.get("disableGCheck") || options?.disableGCheck) {
      logger.info("Skipping igc G-Record validation");
      return "PASSED"; // TODO:  Why does this.G_RECORD_PASSED return undefined?
    }

    // http://vali.fai-civl.org/webservice.html
    logger.info("Validating igc file with FAI API");
    try {
      const url = "http://vali.fai-civl.org/api/vali/json";
      const formData = new FormData();

      // Differenciate between IGC upload via file transfer (normal) or via stream (leonardo)
      const buffer = igc.path
        ? fs.readFileSync(igc.path)
        : Buffer.from(igc.body);
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
