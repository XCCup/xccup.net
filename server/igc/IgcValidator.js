const fs = require("fs");
// const buffer = require("buffer");
const axios = require("axios");
const FormData = require("form-data");
const logger = require("../config/logger");

const igcValidator = {
  G_RECORD_PASSED: "PASSED",
  G_RECORD_FAILED: "FAILED",
  execute: async (igcFile) => {
    // http://vali.fai-civl.org/webservice.html
    logger.info("Validating igc file with FAI API");
    try {
      const url = "http://vali.fai-civl.org/api/vali/json";
      const formData = new FormData();

      // formData.append("igcfile", fs.createReadStream(igcFile.path));
      // var buffer = Buffer.from(igc.body);

      // formData.append("igcfile", buffer, {
      //   filename: igc.name,
      //   contentType: "application/octet-stream",
      // });
      const bufferData = fs.readFileSync(igcFile.path);
      // const bufferTranscode = buffer.transcode(
      //   Buffer.from(bufferData),
      //   "utf8",
      //   "latin1"
      // );
      // const buffer = Buffer.from(fs.readFileSync(igcFile.path), "latin1");

      formData.append("igcfile", bufferData, {
        filename: igcFile.filename,
        contentType: "application/octet-stream",
      });

      console.log("File size: ", igcFile.size);
      console.log("File encoding: ", igcFile.encoding);

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

      console.log("RES: ", JSON.stringify(res.data, null, 2));

      return result;
    } catch (error) {
      logger.error(error);
    }
  },
};

module.exports = igcValidator;

// async function executeRequest(igc, transcode) {
//   // http://vali.fai-civl.org/webservice.html
//   const url = "http://vali.fai-civl.org/api/vali/json";
//   const formData = new FormData();

//   let bufferData = Buffer.from(igc.body);

//   if (transcode) bufferData = buffer.transcode(bufferData, "utf8", "latin1");

//   formData.append("igcfile", bufferData, {
//     filename: igc.name,
//     contentType: "application/octet-stream",
//   });

//   const config = {
//     headers: {
//       "Content-Type": "multipart/form-data; boundary=" + formData.getBoundary(),
//       "Content-length": formData.getLengthSync(),
//     },
//   };
//   const res = await axios.post(url, formData, config);

//   const result = res.data.result;
//   logger.debug("Validation result: " + result);
//   return result;
// }
