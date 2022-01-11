const { IGC_STORE } = require("../constants/flight-constants");
const path = require("path");
const fs = require("fs");
const logger = require("../config/logger");

function createFileName(externalId, igcFileName, isTemp, stripFactor) {
  const dataPath = process.env.SERVER_DATA_PATH;
  const store = IGC_STORE;
  const pathToFolder = isTemp
    ? path.join(dataPath, store, "temp", externalId.toString())
    : path.join(dataPath, store);

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

function deleteIgcFile(igcPath) {
  if (!igcPath)
    return logger.warn("IFU: Should delete igc file but path prop was empty");

  const fullfilepath = path.join(global.__basedir, igcPath);
  logger.debug("IFU: Will delete igc " + fullfilepath);
  fs.unlink(fullfilepath, (err) => {
    if (err) {
      logger.error(err);
    }
  });
}

exports.createFileName = createFileName;
exports.deleteIgcFile = deleteIgcFile;
