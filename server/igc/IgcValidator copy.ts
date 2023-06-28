import axios from "axios";
import axiosRetry from "axios-retry";
import FormData from "form-data";
import logger from "../config/logger";
import fs from "fs";

axiosRetry(axios, { retries: 2 });

export type FaiResponse = "PASSED" | "FAILED" | "ERROR";

/**
 * Checks with the FAI API if an IGC file has a valid G record.
 *
 */
export const validateIgc = async (igcFilePath: string, filename: string) => {
  // http://vali.fai-civl.org/webservice.html
  logger.info("Validating igc file with FAI API");
  try {
    const url = "http://vali.fai-civl.org/api/vali/json";
    const formData = new FormData();
    // const buffer = Buffer.from(content, encoding);

    // const buffer = fs.readFileSync(igcFilePath);

    formData.append("igcfile", Buffer.from(igcFilePath, "base64"), {
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

    const result = res.data.result as FaiResponse;
    logger.debug("IV: Validation result: " + result);

    if (result != "PASSED") {
      logger.info(
        "IV: IGC validation finished with not passed. Result is: " + result
      );
      logger.debug("IV: Full response: " + JSON.stringify(res.data, null, 2));
    }

    return result;
  } catch (error) {
    logger.error(error);
  }
};
