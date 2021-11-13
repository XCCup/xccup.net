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
function create(path, targetHeight) {
  const pathThumb = createThumbnailPath(path);
  sharp(path)
    .resize(null, targetHeight)
    // eslint-disable-next-line no-unused-vars
    .toFile(pathThumb, (err, resizedImageInfo) => {
      if (err) {
        logger.error(err);
      }
    });
  return pathThumb;
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
exports.createThumbnail = create;
exports.createThumbnailPath = createThumbnailPath;
exports.defineFileDestination = defineFileDestination;
exports.defineImageFileNameWithCurrentDateAsPrefix = defineImageFileNameWithCurrentDateAsPrefix;
exports.THUMBNAIL_POSTFIX = THUMBNAIL_POSTFIX;
