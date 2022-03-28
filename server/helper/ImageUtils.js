const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const logger = require("../config/logger");

const THUMBNAIL_POSTFIX = "-thumb";
const MOBILE_POSTFIX = "-mobile";

const THUMBNAIL_MAX_DIMENSION = 256;
const MOBILE_MAX_DIMENSION = 1024;

/**
 * This function creates a thumbnail for a given image.
 * The thumbnail will be stored next to the given image.
 * The filename of the thumbnail is based on the given image but extended by "-thumb".
 * @param {*} path The path of the image to which a thumbnail should be created.
 */
async function createThumbnail(path, targetHeight) {
  const pathThumb = createSizePath(path, THUMBNAIL_POSTFIX);
  return await resizeImage(path, targetHeight, pathThumb);
}

async function createSmallerSizes(path) {
  const pathThumb = createSizePath(path, THUMBNAIL_POSTFIX);
  const pathMobile = createSizePath(path, MOBILE_POSTFIX);
  return await Promise.all(
    [resizeImage(path, THUMBNAIL_MAX_DIMENSION, pathThumb)],
    [resizeImage(path, MOBILE_MAX_DIMENSION, pathMobile)]
  );
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
        withoutEnlargement: true,
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
function createSizePath(basePath, postfix) {
  const pathAsString = basePath.toString();
  const indexOfFileExtension = pathAsString.lastIndexOf(".");
  const insertionPosition =
    indexOfFileExtension < 0 ? pathAsString.length : indexOfFileExtension;
  return (
    pathAsString.slice(0, insertionPosition) +
    postfix +
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
    deletePath(pathBase, deleteOperations);
    deletePath(pathBase, deleteOperations, MOBILE_POSTFIX);
    deletePath(pathBase, deleteOperations, THUMBNAIL_POSTFIX);
  }
  const pathThumb = imageObject.pathThumb;
  if (pathThumb) {
    deletePath(pathThumb, deleteOperations);
  }
  return await Promise.all(deleteOperations);
}

function deletePath(pathValue, deleteOperations, optionalPostfix) {
  logger.debug("Will delete images for path " + pathValue);
  const fullfilepath = optionalPostfix
    ? path.join(path.resolve(), pathValue + optionalPostfix)
    : path.join(path.resolve(), pathValue);

  if (fs.existsSync(fullfilepath)) {
    deleteOperations.push(
      fs.unlink(fullfilepath, (err) => {
        if (err) {
          logger.error(err);
        }
      })
    );
  }
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

function retrieveFilePath(pathValue, size) {
  const sizeValue = size ?? "";
  const postfix = sizeValue ? "-" + sizeValue : "";
  const filePathSmallerSize = path.join(path.resolve(), pathValue + postfix);
  return fs.existsSync(filePathSmallerSize)
    ? filePathSmallerSize
    : path.join(path.resolve(), pathValue);
}

exports.retrieveFilePath = retrieveFilePath;
exports.deleteImages = deleteImages;
exports.resizeImage = resizeImage;
exports.createThumbnail = createThumbnail;
exports.createSmallerSizes = createSmallerSizes;
exports.defineFileDestination = defineFileDestination;
exports.defineImageFileNameWithCurrentDateAsPrefix =
  defineImageFileNameWithCurrentDateAsPrefix;
exports.THUMBNAIL_POSTFIX = THUMBNAIL_POSTFIX;
