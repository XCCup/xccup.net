const express = require("express");
const logger = require("../config/logger");
const {
  FORBIDDEN,
  NOT_FOUND,
  OK,
} = require("../constants/http-status-constants");
const { validationHasErrors } = require("./Validation");
const { query } = require("express-validator");
const { sleep } = require("../helper/Utils");
const config = require("../config/env-config").default;

const router = express.Router();

// @desc Initiates the import of data from the import folder
// @route GET /importdata/

router.get(
  "/",
  query("modelName").not().isEmpty().trim().escape(),
  query("fileName").not().isEmpty().trim(),
  query("token").isUUID(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    try {
      const { modelName, fileName, token } = req.query;
      if (token != config.get("serverImportToken"))
        return res.status(FORBIDDEN).send("Wrong token");

      logger.info(
        "Will try to import data from " + fileName + " to model " + modelName
      );

      const model = require("../db.ts")[modelName];
      if (!model) return res.status(NOT_FOUND).send("Model not found");

      if (modelName == "FlightFixes") {
        const importErros = await addAllFlightFixes(fileName);
        return res.json(importErros);
      }
      const fileContent =
        modelName == "FlightFixes"
          ? findAllFlightFixes(fileName)
          : require("../import/" + fileName + ".json");

      // const fileContent = require("../import/" + fileName + ".json");
      const importErros = await addDataset(model, fileContent);
      res.json(importErros);
    } catch (error) {
      next(error);
    }
  }
);
// @desc Truncates a data model
// @route GET /importdata/truncate

router.get(
  "/truncate",
  query("modelName").not().isEmpty().trim().escape(),
  query("token").isUUID(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    try {
      const { modelName, token } = req.query;

      if (token != config.get("serverImportToken"))
        return res.status(FORBIDDEN).send("Wrong token");

      logger.info("Will truncate all data of model " + modelName);

      const model = require("../db.ts")[modelName];
      if (!model) return res.status(NOT_FOUND).send("Model not found");

      await model.destroy({
        truncate: { cascade: true },
      });
      res.sendStatus(OK);
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
      } else {
        logger.error("IDC: " + err);
        errors.push(err);
      }
    });
    // Let the db take a break ;-)
    // await sleep(1000);
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

async function addAllFlightFixes(year) {
  const fs = require("fs");
  const fixesDir = `${global.__basedir}/import/fixes/${year}`;
  const fixesFileNames = fs.readdirSync(fixesDir);
  console.log("FOUND FIXES: ", fixesFileNames);
  const errors = [];
  for (let i = 0; i < fixesFileNames.length; i++) {
    const file = fixesFileNames[i];
    const fixes = require(fixesDir + "/" + file);
    const importErrors = await addDataset(require("../db.ts")["FlightFixes"], [
      fixes,
    ]);
    errors.push(importErrors);
  }
  return errors;
}
function findAllFlightFixes(year) {
  const fs = require("fs");
  const fixesDir = `${global.__basedir}/import/fixes/${year}`;
  const fixesFileNames = fs.readdirSync(fixesDir);
  console.log("FOUND FIXES: ", fixesFileNames);
  const fixesAsOneArray = fixesFileNames.map((file) =>
    require(fixesDir + "/" + file)
  );
  return fixesAsOneArray;
}

module.exports = router;
