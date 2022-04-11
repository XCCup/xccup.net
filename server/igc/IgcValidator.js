const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const logger = require("../config/logger");
const config = require("../config/env-config").default;

const igcValidator = {
  G_RECORD_PASSED: "PASSED",
  G_RECORD_FAILED: "FAILED",

  /**
   * Checks with the FAI API if a IGC file has a valid G record.
   *
   * @param {Object} igc An object which contains the path to or the content of the IGC file as also the IGC filename.
   * @param {Boolean} options Options: { disableGCheck }
   * @returns
   */
  execute: async (igc, options) => {
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
