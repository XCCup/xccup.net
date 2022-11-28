import multer from "multer";
import config from "../config/env-config";
import path from "path";
import { IGC_STORE, IGC_MAX_SIZE } from "../constants/flight-constants";
import { getCurrentYear } from "./Utils";
import FlightService from "../service/FlightService";

export function createMulterIgcUploadHandler({ parts = 1 } = {}) {
  const dataPath = config.get("dataPath");
  // Create new external ID
  // TODO: Is this prone to collisions when there are simultanious uploads?

  const igcStorage = multer.diskStorage({
    destination: path
      .join(dataPath, IGC_STORE, getCurrentYear().toString())
      .toString(),
    filename: async function (req, file, cb) {
      const externalId = await FlightService.createExternalId();

      req.externalId = externalId;
      cb(null, externalId + "_" + file.originalname);
    },
  });
  return multer({
    storage: igcStorage,
    limits: {
      fileSize: IGC_MAX_SIZE,
      files: 1,
      parts,
    },
  });
}
export default createMulterIgcUploadHandler;

const foo = createMulterIgcUploadHandler();
