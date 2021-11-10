const express = require("express");
const router = express.Router();
const service = require("../service/ClubService");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { authToken, requesterIsNotModerator } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkParamIsUuid,
  checkIsBoolean,
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
  checkStringObjectNotEmpty("website"),
  checkStringObjectNotEmpty("contacts"),
  checkIsBoolean("isActiveParticipant"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const {
      name,
      shortName,
      website,
      contacts,
      isActiveParticipant
    } = req.body;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const club = {
        name,
        shortName,
        website,
        contacts,
        participantInSeasons: isActiveParticipant
          ? [new Date().getFullYear()]
          : [],
      };

      const newClub = await service.create(club)

      res.json(newClub);
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
  checkStringObjectNotEmpty("name"),
  checkStringObjectNotEmpty("shortName"),
  checkStringObjectNotEmpty("website"),
  checkStringObjectNotEmpty("contacts"),
  checkIsBoolean("isActiveParticipant"),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const clubId = req.params.id;
    const {
      name,
      shortName,
      website,
      contacts,
      isActiveParticipant
    } = req.body;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const club = await service.getById(clubId);
      if (!club) return res.sendStatus(NOT_FOUND);

      club.name = name;
      club.shortName = shortName;
      club.homepage = website;
      club.contacts = contacts;
      if (
        isActiveParticipant &&
        !club.participantInSeasons.includes(new Date().getFullYear())
      ) {
        isActiveParticipant.push(new Date().getFullYear());
      }

      const updatedClub = await service.update(club)

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
