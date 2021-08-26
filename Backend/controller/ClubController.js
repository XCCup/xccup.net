const express = require("express");
const router = express.Router();
const service = require("../service/ClubService");
const { NOT_FOUND, INTERNAL_SERVER_ERROR } = require("./Constants");
const { authToken, requesterIsNotModerator } = require("./Auth");
const {
  checkOptionalIsBoolean,
  checkOptionalStringObjectNotEmpty,
  checkStringObjectNotEmpty,
  validationHasErrors,
} = require("./Validation");

// @desc Gets all open information of all active clubs
// @route GET /clubs

router.get("/", async (req, res) => {
  const clubs = await service.getAllActive();
  res.json(clubs);
});

// @desc Gets all active and non-active clubs
// @route GET /clubs/all
// @access Only moderator

router.get("/all", authToken, async (req, res) => {
  if (await requesterIsNotModerator(req, res)) return;
  const clubs = await service.getAll();
  res.json(clubs);
});

// @desc Gets all members of clubs
// @route GET /clubs/:shortName/member/
// @access All logged-in user

router.get("/:shortName/member", async (req, res) => {
  const shortName = req.params.shortName;
  const members = await service.getAllMemberOfClub(shortName);
  res.json(members);
});

// @desc Get all club information
// @route GET /clubs/:id
// @access Only moderator

router.get("/:id", authToken, async (req, res) => {
  if (await requesterIsNotModerator(req, res)) return;

  const clubId = req.params.id;
  const retrievedClub = await service.getById(clubId);
  if (!retrievedClub) return res.sendStatus(NOT_FOUND);

  res.json(retrievedClub);
});

// @desc Saves a new user to the database
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
  async (req, res) => {
    if (validationHasErrors(req, res)) return;
    if (await requesterIsNotModerator(req, res)) return;

    const transferObject = req.body;

    console.log("TEST: " + transferObject.contacts);
    console.log("HELLO MY DARLING");

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

    service
      .create(club)
      .then((club) => res.json(club))
      .catch((error) => {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).send(error);
      });
  }
);

// @desc Edits a club
// @route PUT /clubs/
// @access Only moderator

router.put(
  "/:id",
  authToken,
  checkOptionalStringObjectNotEmpty("name"),
  checkOptionalStringObjectNotEmpty("shortName"),
  checkOptionalStringObjectNotEmpty("homepage"),
  checkOptionalStringObjectNotEmpty("urlLogo"),
  checkOptionalIsBoolean("isActiveParticipant"),
  async (req, res) => {
    if (validationHasErrors(req, res)) return;
    if (await requesterIsNotModerator(req, res)) return;

    const clubId = req.params.id;
    const club = await service.getById(clubId);
    if (!club) return res.sendStatus(NOT_FOUND);

    const transferObject = req.body;
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

    service
      .update(club)
      .then((club) => res.json(club))
      .catch((error) => {
        console.error(error);
        res.status(INTERNAL_SERVER_ERROR).send(error);
      });
  }
);

// @desc Deletes a club by id
// @route DELETE /club/:id
// @access Only moderator

router.delete("/:id", authToken, async (req, res) => {
  if (await requesterIsNotModerator(req, res)) return;

  const clubId = req.params.id;
  const club = await service.getById(clubId);
  if (!club) return res.sendStatus(NOT_FOUND);

  const numberOfDestroyedRows = await service.delete(clubId);
  res.json(numberOfDestroyedRows);
});

module.exports = router;
