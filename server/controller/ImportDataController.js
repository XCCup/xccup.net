const express = require("express");
const logger = require("../config/logger");
const { FORBIDDEN, NOT_FOUND } = require("../constants/http-status-constants");
const { validationHasErrors } = require("./Validation");
const { query } = require("express-validator");
const { sleep } = require("../helper/Utils");
const router = express.Router();

// @desc Initiates the import of data from the import folder
// @route GET /importdata/

router.get(
  "/",
  query("modelName").not().isEmpty().trim().escape(),
  query("fileName").not().isEmpty().trim().escape(),
  query("token").isUUID(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    try {
      const { modelName, fileName, token } = req.query;

      logger.info(
        "Will try to import data from " + fileName + " to model " + modelName
      );

      if (token != process.env.SERVER_IMPORT_TOKEN)
        return res.status(FORBIDDEN).send("Wrong token");

      const model = require("../config/postgres")[modelName];
      if (!model) return res.status(NOT_FOUND).send("Model Not found");

      const jsonFileContent = require("../import/" + fileName + ".json");

      const importErros = await addDataset(model, jsonFileContent);

      res.json(importErros);
    } catch (error) {
      next(error);
    }
  }
);

async function addDataset(model, dataset) {
  const chunks = sliceIntoChunks(dataset, 73);
  const errors = [];

  for (let i = 0; i < chunks.length; i++) {
    logger.info("Will add chunk " + i + " of " + chunks.length);
    const elements = chunks[i];
    await model.bulkCreate(elements).catch((err) => {
      if (err.errors) {
        logger.error("IDC: " + err.errors[0].message);
        errors.push(err.errors[0]);
      } else logger.error("IDC: " + err);
    });
    // Let the db take a break ;-)
    await sleep(1000);
  }
  return errors;
}

function sliceIntoChunks(arr, chunkSize) {
  const res = [];
  for (let i = 0; i < arr.length; i += chunkSize) {
    const chunk = arr.slice(i, i + chunkSize);
    res.push(chunk);
  }
  return res;
}

module.exports = router;
