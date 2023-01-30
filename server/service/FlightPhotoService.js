const FlightPhoto = require("../db")["FlightPhoto"];
const Flight = require("../db")["Flight"];
const User = require("../db")["User"];
const Sequelize = require("sequelize");
const logger = require("../config/logger");
const AdmZip = require("adm-zip");
const { default: config } = require("../config/env-config");

const service = {
  getById: async (id) => {
    return FlightPhoto.findByPk(id);
  },

  getRandomCurrentYear: async (count) => {
    const randomPhotos = await FlightPhoto.findAll({
      where: {
        andOp: Sequelize.where(
          Sequelize.fn(
            "date_part",
            "year",
            Sequelize.col("FlightPhoto.createdAt")
          ),
          new Date().getFullYear()
        ),
      },
      order: Sequelize.literal("random()"),
      limit: count,
      include: [
        {
          model: Flight,
          as: "flight",
          attributes: ["externalId"],
        },
        {
          model: User,
          as: "user",
          // Nested includes do not allow include virtual fields: https://github.com/sequelize/sequelize/issues/10552
          attributes: ["firstName", "lastName"],
        },
      ],
      attributes: ["id", "description", "createdAt"],
    });
    return randomPhotos.map((p) => p.toJSON());
  },

  createArchiveForYear: async (year) => {
    logger.info("FPS: Create photo archiv for year: " + year);
    const photosOfYear = await FlightPhoto.findAll({
      where: {
        andOp: Sequelize.where(
          Sequelize.fn(
            "date_part",
            "year",
            Sequelize.col("FlightPhoto.createdAt")
          ),
          year
        ),
      },
      include: [
        {
          model: Flight,
          as: "flight",
          attributes: ["externalId"],
        },
        {
          model: User,
          as: "user",
          attributes: ["firstName", "lastName"],
        },
      ],
      attributes: ["path"],
    });

    const archivePath =
      config.get("dataPath") + "/flight_photos_" + year + ".zip";

    logger.info(
      "FPS: Will create photo archive of " +
        photosOfYear.length +
        " entries and write it to " +
        archivePath
    );

    const archive = new AdmZip();
    photosOfYear.forEach((p) => {
      const photoMeta = p.toJSON();
      archive.addLocalFile(
        photoMeta.path,
        // store photos in folders in zip archive
        photoMeta.user.firstName +
          "_" +
          photoMeta.user.lastName +
          "/Flight_" +
          photoMeta.flight.externalId.toString()
      );
    });
    archive.writeZip(archivePath);

    return archivePath;
  },

  create: async (media) => {
    return FlightPhoto.create(media);
  },

  countPhotosOfFlight: async (flightId) => {
    return FlightPhoto.count({
      where: {
        flightId,
      },
    });
  },

  update: async (media) => {
    return await media.save();
  },

  toggleLike: async (media, requesterId) => {
    if (media.likers.includes(requesterId)) {
      media.likers.splice(media.likers.indexOf(requesterId));
    } else {
      media.likers.push(requesterId);
    }
    media.changed("likers", true);
    return await media.save();
  },

  delete: async (id) => {
    const numberOfDestroyedRows = await FlightPhoto.destroy({
      where: { id },
    });
    return numberOfDestroyedRows;
  },
};

module.exports = service;
