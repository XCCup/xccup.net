import { IGC_STORE } from "../constants/flight-constants";
import path from "path";
import fs from "fs";
import logger from "../config/logger";
import { getCurrentYear } from "./Utils";
import config from "../config/env-config";

export function createFileName(
  externalId: number,
  igcFileName: string,
  isTemp?: boolean,
  stripFactor?: number,
  year = getCurrentYear().toString()
) {
  const dataPath = config.get("dataPath");
  const store = IGC_STORE;
  const pathToFolder = isTemp
    ? path.join(dataPath, store, "temp", externalId.toString(), year)
    : path.join(dataPath, store, year);

  //Ensure that path exists
  fs.mkdirSync(pathToFolder, { recursive: true });

  const tempFileName =
    stripFactor == null ? `turnpoints` : `striped_by_${stripFactor}`;
  const pathToFile = isTemp
    ? path.join(pathToFolder.toString(), tempFileName + ".igc")
    : path.join(
        pathToFolder.toString(),
        externalId.toString() + "_" + igcFileName
      );
  logger.debug("IFU: IGC Path " + pathToFile + " created");

  return pathToFile;
}

export function deleteIgcFile(igcPath?: string) {
  if (!igcPath)
    return logger.warn("IFU: Should delete igc file but path prop was empty");
  const fullfilepath = path.join(config.get("rootDir"), igcPath);
  logger.debug("IFU: Will delete igc " + fullfilepath);
  fs.unlink(fullfilepath, (err) => {
    if (err) {
      logger.error("IFU: " + err);
    }
  });
}

exports.createFileName = createFileName;
exports.deleteIgcFile = deleteIgcFile;
