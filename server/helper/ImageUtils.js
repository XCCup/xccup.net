const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const logger = require("../config/logger");

const THUMBNAIL_POSTFIX = "-thumb";

/**
 * This function creates a thumbnail for a given image.
 * The thumbnail will be stored next to the given image.
 * The filename of the thumbnail is based on the given image but extended by "-thumb".
 * @param {*} path The path of the image to which a thumbnail should be created.
 */
async function createThumbnail(path, targetHeight) {
  const pathThumb = createThumbnailPath(path);
  return await resizeImage(path, targetHeight, pathThumb);
}

/**
 * This function resizes the original image.
 * If no targetPath is supplied the original image will be overridden.
 * @param {*} sourcePath The path of the image to resize.
 * @param {*} maxDimensions The max height or width to which the image will be resized. Preserving aspect ratio, resize the image to be as large as possible while ensuring its dimensions are less than or equal to both those specified.
 * @param {*} targetPath The path where the resized image should be stored.
 */
async function resizeImage(sourcePath, maxDimensions, targetPath) {
  const replaceOriginal = targetPath ? false : true;
  const target = replaceOriginal ? sourcePath + "_resize" : targetPath;

  logger.info("IU: Will resize image and store it to: " + target);
  const targetResult = await new Promise(function (resolve, reject) {
    sharp(sourcePath)
      .withMetadata()
      .resize(maxDimensions, maxDimensions, {
        fit: "inside",
      })
      // eslint-disable-next-line no-unused-vars
      .toFile(target, (err, resizedImageInfo) => {
        if (err) {
          logger.error(err);
          reject(err);
        }
        resolve(target);
      });
  });

  if (!replaceOriginal) return targetResult;

  await fs.rename(target, sourcePath, (err) => {
    if (err) logger.error("IU: " + err);
  });
}

/**
 * Creates a path for a thumbnail. The path of the base image will be extended by a postfix.
 * The position of a possible fileextension at the end of a path will be keeped.
 * @param {*} basePath
 * @returns
 */
function createThumbnailPath(basePath) {
  const pathAsString = basePath.toString();
  const indexOfFileExtension = pathAsString.lastIndexOf(".");
  const insertionPosition =
    indexOfFileExtension < 0 ? pathAsString.length : indexOfFileExtension;
  return (
    pathAsString.slice(0, insertionPosition) +
    THUMBNAIL_POSTFIX +
    pathAsString.slice(insertionPosition)
  );
}

/**
 * Deletes the images to the corresponding imageObject properties path and pathThumb
 * @param {*} imageObject The imageObject from the db.
 * @returns A promise of the delete operations
 */
async function deleteImages(imageObject) {
  const pathBase = imageObject.path;
  const deleteOperations = [];
  if (pathBase) {
    logger.debug("Will delete images for path " + pathBase);
    const fullfilepath = path.join(path.resolve(), pathBase);
    deleteOperations.push(
      fs.unlink(fullfilepath, (err) => {
        if (err) {
          logger.error(err);
        }
      })
    );
  }
  const pathThumb = imageObject.pathThumb;
  if (pathThumb) {
    logger.debug("Will delete images for path " + pathThumb);
    const fullfilepathThumb = path.join(path.resolve(), pathThumb);
    deleteOperations.push(
      fs.unlink(fullfilepathThumb, (err) => {
        if (err) {
          logger.error(err);
        }
      })
    );
  }
  return await Promise.all(deleteOperations);
}

function defineFileDestination(destination) {
  return function (req, file, cb) {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, true);
    }
    cb(null, destination);
  };
}

function defineImageFileNameWithCurrentDateAsPrefix() {
  return function (req, file, cb) {
    const prefix = Date.now();
    cb(null, prefix + "-" + file.originalname);
  };
}

exports.deleteImages = deleteImages;
exports.resizeImage = resizeImage;
exports.createThumbnail = createThumbnail;
exports.createThumbnailPath = createThumbnailPath;
exports.defineFileDestination = defineFileDestination;
exports.defineImageFileNameWithCurrentDateAsPrefix =
  defineImageFileNameWithCurrentDateAsPrefix;
exports.THUMBNAIL_POSTFIX = THUMBNAIL_POSTFIX;
