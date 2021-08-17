const express = require("express");
const router = express.Router();
const service = require("../service/ClubService");
const { NOT_FOUND } = require("./Constants");
const { authToken, requesterIsNotModerator } = require("./Auth");

// @desc Gets all clubs
// @route GET /clubs

router.get("/", async (req, res) => {
  const clubs = await service.getAll();
  res.json(clubs);
});

// @desc Gets all members of clubs
// @route GET /clubs/member/:id
// @access All logged-in user

router.get("/member/:id", authToken, async (req, res) => {
  const clubId = req.params.id;
  const members = await service.getAllMemberOfClub(clubId);
  res.json(members);
});

// @desc Gets all members of clubs
// @route GET /clubs/member/:id
// @access Only moderator

router.get("/:id", authToken, async (req, res) => {
  const clubId = req.params.id;
  const retrievedClub = await service.getById(clubId);

  if (await requesterIsNotModerator(req, res)) {
    console.log("Controller");
    return;
  }
  if (!retrievedClub) return res.sendStatus(NOT_FOUND);

  res.json(retrievedClub);
});

module.exports = router;
