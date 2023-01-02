const express = require("express");
const router = express.Router();
const service = require("../service/ClubService");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { requesterMustBeModerator } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkParamIsUuid,
  validationHasErrors,
  checkIsArray,
} = require("./Validation");
const { getCache, setCache, deleteCache } = require("./CacheManager");
const CACHE_RELEVANT_KEYS = ["home", "clubs", "filterOptions"];

// @desc Gets all open information of all active clubs
// @route GET /clubs/public

router.get("/public", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const clubs = await service.getAllActive();

    setCache(
      req,
      clubs.map((c) => c.toJSON())
    );

    res.json(clubs);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all club names
// @route GET /clubs/names

router.get("/names", async (req, res, next) => {
  try {
    const value = getCache(req);
    if (value) return res.json(value);

    const clubs = await service.getAllNames();

    setCache(
      req,
      clubs.map((c) => c.toJSON())
    );

    res.json(clubs);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all active and non-active clubs
// @route GET /clubs/
// @access Only moderator

router.get("/", async (req, res, next) => {
  try {
    const clubs = await service.getAll();
    res.json(clubs);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all members of clubs
// @route GET /clubs/:shortName/member/
// @access All logged-in user

router.get("/:shortName/member", async (req, res, next) => {
  const shortName = req.params.shortName;
  try {
    const members = await service.getAllMemberOfClub(shortName);
    res.json(members);
  } catch (error) {
    next(error);
  }
});

// @desc Get all club information
// @route GET /clubs/:id
// @access Only moderator

router.get(
  "/:id",
  checkParamIsUuid("id"),
  // requesterMustBeModerator,
  async (req, res, next) => {
    try {
      const clubId = req.params.id;

      const retrievedClub = await service.getById(clubId);
      if (!retrievedClub) return res.sendStatus(NOT_FOUND);

      res.json(retrievedClub);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Saves a new club to the database
// @route POST /clubs/
// @access Only moderator

router.post(
  "/",
  requesterMustBeModerator,
  checkStringObjectNotEmpty("name"),
  checkStringObjectNotEmpty("shortName"),
  checkStringObjectNotEmpty("website"),
  checkIsArray("contacts"),
  checkIsArray("participantInSeasons"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const { name, shortName, website, contacts, participantInSeasons } =
      req.body;

    try {
      const club = {
        name,
        shortName,
        website,
        contacts,
        participantInSeasons,
      };

      const newClub = await service.create(club);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(newClub);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits a club
// @route PUT /clubs/:id
// @access Only moderator

router.put(
  "/:id",
  requesterMustBeModerator,
  checkParamIsUuid("id"),
  checkStringObjectNotEmpty("name"),
  checkStringObjectNotEmpty("shortName"),
  checkStringObjectNotEmpty("website"),
  checkIsArray("contacts"),
  checkIsArray("participantInSeasons"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const clubId = req.params.id;
    const { name, shortName, website, contacts, participantInSeasons } =
      req.body;

    try {
      const club = await service.getById(clubId);
      if (!club) return res.sendStatus(NOT_FOUND);

      club.name = name;
      club.shortName = shortName;
      club.homepage = website;
      club.contacts = contacts;
      club.participantInSeasons = participantInSeasons;

      const updatedClub = await service.update(club);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(updatedClub);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a club by id
// @route DELETE /clubs/:id
// @access Only moderator

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  requesterMustBeModerator,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const clubId = req.params.id;

    try {
      const club = await service.getById(clubId);
      if (!club) return res.sendStatus(NOT_FOUND);

      const numberOfDestroyedRows = await service.delete(clubId);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(numberOfDestroyedRows);
    } catch (error) {
      next();
    }
  }
);

// Logos aren't currently used anywhere on the frontend for clubs
// // @desc Uploads a new logo for a club
// // @route POST /clubs/logo/
// // @access Only moderator

// @desc Gets the logo of an club
// @route GET /clubs/logo/:id

// router.get(
//   "/logo/:id",
//   checkParamIsUuid("id"),
//   query("size")
//     .optional()
//     .isIn(Object.values(IMAGE_SIZES).map((f) => f.name)),
//   async (req, res, next) => {
//     if (validationHasErrors(req, res)) return;
//     const id = req.params.id;
//     const size = req.query.size;

//     try {
//       const logo = await logoService.getById(id);

//       if (!logo) return res.sendStatus(NOT_FOUND);

//       const fullfilepath = retrieveFilePath(logo.path, size);

//       return res.type(logo.mimetype).sendFile(fullfilepath);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// router.post(
//   "/logo/",
//   requesterMustBeModerator,
//   imageUpload.single("image"),
//   async (req, res, next) => {
//     if (validationHasErrors(req, res)) return;
//     try {
//       const { originalname, mimetype, size, path } = req.file;
//       const clubId = req.body.sponsorId;

//       const club = await service.getById(clubId);
//       if (!club) return res.sendStatus(NOT_FOUND);

//       if (club.logo) {
//         logoService.deleteOldLogo(club);
//       }

//       const logo = await logoService.create({
//         originalname,
//         mimetype,
//         size,
//         path,
//         sponsorId: clubId,
//       });

//       deleteCache([club.logo?.id, "clubs/public"]);
//       res.json(logo);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// // @desc Deletes a logo for a club
// // @route DELETE /clubs/logo/:id
// // @access Only moderator

// router.delete(
//   "/logo/:id",
//   requesterMustBeModerator,
//   checkParamIsUuid("id"),
//   async (req, res, next) => {
//     if (validationHasErrors(req, res)) return;
//     try {
//       const club = await service.getById(req.params.id);
//       if (!club) return res.sendStatus(NOT_FOUND);

//       if (club.logo) {
//         logoService.deleteOldLogo(club);
//       }

//       deleteCache([club.logo.id, "clubs/public"]);
//       res.sendStatus(OK);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

module.exports = router;
