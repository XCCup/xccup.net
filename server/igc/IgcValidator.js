const axios = require("axios");
const buffer = require("buffer");
const FormData = require("form-data");
const logger = require("../config/logger");

const igcValidator = {
  G_RECORD_PASSED: "PASSED",
  G_RECORD_FAILED: "FAILED",

  execute: async (igc) => {
    logger.info("Validating igc file with FAI API");
    try {
      const result = await executeRequest(igc);
      if (result == this.G_RECORD_PASSED) return result;

      logger.warn(
        "First request to FAI API failed. Will try with latin1 encoding"
      );
      return await executeRequest(igc, true);
    } catch (error) {
      logger.error(error);
    }
  },
};

module.exports = igcValidator;

async function executeRequest(igc, transcode) {
  // http://vali.fai-civl.org/webservice.html
  const url = "http://vali.fai-civl.org/api/vali/json";
  const formData = new FormData();

  let bufferData = Buffer.from(igc.body);

  if (transcode) bufferData = buffer.transcode(bufferData, "utf8", "latin1");

  formData.append("igcfile", bufferData, {
    filename: igc.name,
    contentType: "application/octet-stream",
  });

  const config = {
    headers: {
      "Content-Type": "multipart/form-data; boundary=" + formData.getBoundary(),
      "Content-length": formData.getLengthSync(),
    },
  };
  const res = await axios.post(url, formData, config);

  const result = res.data.result;
  logger.debug("Validation result: " + result);
  return result;
}
