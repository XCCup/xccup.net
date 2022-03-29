const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const logger = require("../config/logger");

class ImageFormat {
  constructor(name, maxDimension) {
    this.name = name;
    this.maxDimension = maxDimension;
  }
  getPostfix() {
    return "-" + this.name;
  }
}

const IMAGE_FORMATS = {
  THUMB: new ImageFormat("thumb", 310),
  XSMALL: new ImageFormat("xsmall", 620),
  SMALL: new ImageFormat("small", 1100),
  REGULAR: new ImageFormat("regular", 2000),
};

/**
 * This function creates a thumbnail for a given image.
 * The thumbnail will be stored next to the given image.
 * The filename of the thumbnail is based on the given image but extended by "-thumb".
 * @param {*} path The path of the image to which a thumbnail should be created.
 */
async function createThumbnail(path, targetHeight) {
  const pathThumb = createSizePath(path, IMAGE_FORMATS.THUMB.getPostfix());
  return await resizeImage(path, targetHeight, pathThumb);
}

async function createSmallerSizes(path) {
  const resizingCalls = Object.values(IMAGE_FORMATS).map((format) => {
    const imagePath = createSizePath(path, format.getPostfix());
    return resizeImage(path, format.maxDimension, imagePath);
  });
  return await Promise.all(resizingCalls);
}

/**
 * This function resizes the original image.
 * If no targetPath is supplied the original image will be overridden.
 * If the max dimension of the original file is smaller than the request maxDimension no resizing will be executed.
 *
 * @param {*} sourcePath The path of the image to resize.
 * @param {*} maxDimensions The max height or width to which the image will be resized. Preserving aspect ratio, resize the image to be as large as possible while ensuring its dimensions are less than or equal to both those specified.
 * @param {*} targetPath The path where the resized image should be stored.
 */
async function resizeImage(sourcePath, maxDimensions, targetPath) {
  const replaceOriginal = targetPath ? false : true;
  const target = replaceOriginal ? sourcePath + "_resize" : targetPath;

  logger.debug("IU: Will attempt to resize image and store it to " + target);

  const image = sharp(sourcePath);

  // Don't create new file if dimension is already smaller than the maxDimension
  const { width, height } = await image.metadata();
  const maxDim = Math.max(width, height);
  if (maxDim < maxDimensions) return;

  logger.info("IU: Will start resizing to " + maxDimensions);

  const targetResult = await new Promise(function (resolve, reject) {
    image
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
    Object.values(IMAGE_FORMATS).forEach((format) =>
      deletePath(pathBase, deleteOperations, format.getPostfix())
    );
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
exports.IMAGE_FORMATS = IMAGE_FORMATS;
