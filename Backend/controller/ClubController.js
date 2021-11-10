const express = require("express");
const router = express.Router();
const service = require("../service/ClubService");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { authToken, requesterIsNotModerator } = require("./Auth");
const {
  checkOptionalIsBoolean,
  checkOptionalStringObjectNotEmpty,
  checkStringObjectNotEmpty,
  checkParamIsUuid,
  validationHasErrors,
} = require("./Validation");

// @desc Gets all open information of all active clubs
// @route GET /clubs

router.get("/public", async (req, res, next) => {
  try {
    const clubs = await service.getAllActive();
    res.json(clubs);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all active and non-active clubs
// @route GET /clubs/all
// @access Only moderator

router.get("/", authToken, async (req, res, next) => {
  try {
    if (await requesterIsNotModerator(req, res)) return;
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
  authToken,
  async (req, res, next) => {
    try {
      if (await requesterIsNotModerator(req, res)) return;

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
  authToken,
  checkStringObjectNotEmpty("name"),
  checkStringObjectNotEmpty("shortName"),
  checkOptionalStringObjectNotEmpty("homepage"),
  checkOptionalStringObjectNotEmpty("urlLogo"),
  checkOptionalIsBoolean("isActiveParticipant"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const transferObject = req.body;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const club = {
        name: transferObject.name,
        shortName: transferObject.shortName,
        homepage: transferObject.homepage,
        urlLogo: transferObject.urlLogo,
        participantInSeasons: transferObject.isActiveParticipant
          ? [new Date().getFullYear()]
          : [],
        contacts: transferObject.contacts,
      };

      service.create(club).then((club) => res.json(club));
    } catch (error) {
      next(error);
    }
  }
);

// @desc Edits a club
// @route PUT /clubs/
// @access Only moderator

router.put(
  "/:id",
  authToken,
  checkParamIsUuid("id"),
  checkOptionalStringObjectNotEmpty("name"),
  checkOptionalStringObjectNotEmpty("shortName"),
  checkOptionalStringObjectNotEmpty("homepage"),
  checkOptionalStringObjectNotEmpty("urlLogo"),
  checkOptionalIsBoolean("isActiveParticipant"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const clubId = req.params.id;
    const transferObject = req.body;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const club = await service.getById(clubId);
      if (!club) return res.sendStatus(NOT_FOUND);

      club.name = transferObject.name ?? club.name;
      club.shortName = transferObject.shortName ?? club.shortName;
      club.homepage = transferObject.homepage ?? club.homepage;
      club.urlLogo = transferObject.urlLogo ?? club.urlLogo;
      club.contacts = transferObject.contacts ?? club.contacts;
      if (
        transferObject.isActiveParticipant &&
        !club.participantInSeasons.includes(new Date().getFullYear())
      ) {
        transferObject.isActiveParticipant.push(new Date().getFullYear());
      }

      service.update(club).then((club) => res.json(club));
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
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const clubId = req.params.id;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const club = await service.getById(clubId);
      if (!club) return res.sendStatus(NOT_FOUND);

      const numberOfDestroyedRows = await service.delete(clubId);
      res.json(numberOfDestroyedRows);
    } catch (error) {
      next();
    }
  }
);

module.exports = router;
