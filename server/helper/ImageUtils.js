const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const logger = require("../config/logger");

class ImageSize {
  constructor(name, maxWidth) {
    this.name = name;
    this.maxWidth = maxWidth;
  }
  getPostfix() {
    if (this.name) return this.name;
    return "";
  }
}

// Never allow image dimensions to exceed 4000px
const MAX_DIMENSION = 4000;

const IMAGE_SIZES = {
  THUMB: new ImageSize("thumb", 310),
  XSMALL: new ImageSize("xsmall", 620),
  SMALL: new ImageSize("small", 1100),
  REGULAR: new ImageSize("regular", 2000),
  FULL: new ImageSize(null, MAX_DIMENSION),
};

/**
 * This function creates a smaller versions for a given image.
 * The these images will be stored next to the given image.
 * The filename of the smaller version is based on the given image but extended by "-<<SIZE_NAME>>".
 *
 * @param {String} path The path of the image to which a smaller versions should be created.
 */
async function createImageVersions(path, options = {}) {
  if (!path) return logger.error("IU: Missing arguments");

  const resizingCalls = Object.values(IMAGE_SIZES).map((format) => {
    const resizeImagePath = createSizePath(path, format.getPostfix());
    return resizeImage(path, resizeImagePath, format.maxWidth, options);
  });
  return await Promise.all(resizingCalls);
}

/**
 * This function resizes the original image.
 * If no targetPath is supplied the original image will be overwritten.
 *
 * @param {String} sourcePath The path of the image to resize.
 * @param {String} targetPath The path where the resized image should be stored.
 * @param {Number} maxDimensions The max height or width to which the image will be resized. Preserving aspect ratio, resize the image to be as large as possible while ensuring its dimensions are less than or equal to both those specified.
 */
async function resizeImage(sourcePath, targetPath, maxWidth, options) {
  if (!sourcePath || !targetPath || !maxWidth)
    return logger.error("IU: Missing arguments"); // TODO: Should something happen?

  let targetWidth = maxWidth < MAX_DIMENSION ? maxWidth : MAX_DIMENSION;

  // Sharp cannot read and write to the same location at the same time.
  // Therefore we create a temporary name for the resized image and change it back later.
  const replaceOriginal = targetPath == sourcePath;
  const target = replaceOriginal
    ? createTempResizeName(sourcePath)
    : targetPath;

  const image = sharp(sourcePath);
  const metadata = await sharp(sourcePath).metadata();

  // Do not resize if the desired size is bigger than the original image.
  if (maxWidth > metadata.width && maxWidth != MAX_DIMENSION) return;

  // But make sure that the orignal is reprocessed in all cases to keep the 80% jpeg quality goal.
  if (maxWidth > metadata.width && maxWidth == MAX_DIMENSION)
    targetWidth = metadata.width;

  logger.debug(
    "IU: Resizing image to width " + maxWidth + " and store it to " + target
  );

  const resizedImage = await new Promise(function (resolve, reject) {
    if (options.forceJpeg) image.jpeg();
    image
      .withMetadata()
      .resize({
        width: targetWidth,
        height: MAX_DIMENSION,
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

  if (!replaceOriginal) return resizedImage;

  fs.rename(target, sourcePath, (err) => {
    if (err) logger.error("IU: " + err);
  });
}

function createTempResizeName(sourcePath) {
  const RESIZE_POSTFIX = "_resize";
  const index = sourcePath.lastIndexOf(".");
  return sourcePath.slice(0, index) + RESIZE_POSTFIX + sourcePath.slice(index);
}

/**
 * Creates a path for a smaller size version of the base image. The path of the base image will be extended by a postfix.
 * The position of a possible fileextension at the end of a path will be preserved.
 *
 * @param {String} basePath The path to the original image.
 * @returns {String} A file name for a smaller size version of the original image.
 */
function createSizePath(basePath, size) {
  const pathAsString = basePath.toString();
  const postfix = size ? "-" + size : "";
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
 * Deletes the images to the corresponding imageObject property path
 * @param {Object} imageObject The imageObject from the db.
 * @returns A promise of the delete operations
 */
async function deleteImages(imageObject) {
  const pathBase = imageObject.path;
  const deleteOperations = [];
  if (pathBase) {
    deletePath(pathBase, deleteOperations);
    Object.values(IMAGE_SIZES).forEach((format) =>
      deletePath(pathBase, deleteOperations, "-" + format.getPostfix())
    );
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

function retrieveFilePath(originalPath, size) {
  const fileName = size ? createSizePath(originalPath, size) : originalPath;
  const filePath = path.join(path.resolve(), fileName);

  return fs.existsSync(filePath)
    ? filePath
    : path.join(path.resolve(), originalPath);
}

exports.retrieveFilePath = retrieveFilePath;
exports.deleteImages = deleteImages;
exports.resizeImage = resizeImage;
exports.createImageVersions = createImageVersions;
exports.defineFileDestination = defineFileDestination;
exports.defineImageFileNameWithCurrentDateAsPrefix =
  defineImageFileNameWithCurrentDateAsPrefix;
exports.IMAGE_SIZES = IMAGE_SIZES;
