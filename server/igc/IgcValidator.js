const axios = require("axios");
const FormData = require("form-data");
const logger = require("../config/logger");

const igcValidator = {
  G_RECORD_PASSED: "PASSED",
  G_RECORD_FAILED: "FAILED",
  execute: async (igc) => {
    // http://vali.fai-civl.org/webservice.html
    logger.info("Validating igc file with FAI API");

    try {
      const url = "http://vali.fai-civl.org/api/vali/json";
      const formData = new FormData();
      var buffer = Buffer.from(igc.body);

      formData.append("igcfile", buffer, {
        filename: igc.name,
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
      return res.data.result;
    } catch (error) {
      logger.error(error);
    }
  },
};

module.exports = igcValidator;
