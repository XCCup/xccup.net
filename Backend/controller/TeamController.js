const express = require("express");
const router = express.Router();
const service = require("../service/TeamService");
const { NOT_FOUND, BAD_REQUEST } = require("./Constants");
const { authToken, requesterIsNotModerator } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkIsArray,
  validationHasErrors,
} = require("./Validation");

// @desc Gets information of all active teams
// @route GET /teams

router.get("/", async (req, res, next) => {
  try {
    const teams = await service.getAllActive();
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all active and non-active teams
// @route GET /teams/all
// @access Only moderator

router.get("/all", authToken, async (req, res, next) => {
  try {
    if (await requesterIsNotModerator(req, res)) return;
    const teams = await service.getAll();
    res.json(teams);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all members of teams
// @route GET /teams/:name/member/

router.get("/:name/member", async (req, res, next) => {
  const name = req.params.name;
  try {
    const members = await service.getAllMemberOfTeam(name);
    res.json(members);
  } catch (error) {
    next(error);
  }
});

// @desc Gets all users with no team association
// @route GET /teams/availableUsers

router.get("/availableUsers", async (req, res, next) => {
  try {
    const members = await service.findAvailableUsers();
    res.json(members);
  } catch (error) {
    next(error);
  }
});

// @desc Saves a new team to the database
// @route POST /teams/
// @access All logged-in user

router.post(
  "/",
  authToken,
  checkStringObjectNotEmpty("name"),
  checkIsArray("memberIds", 5),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    const memberIds = req.body.memberIds;
    const teamName = req.body.name;

    try {
      if (await service.checkMembersAlreadyAssigned(memberIds))
        return res
          .status(BAD_REQUEST)
          .send("User already asigned to different team");

      service.create(teamName, memberIds).then((team) => res.json(team));
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a team by id
// @route DELETE /teams/:id
// @access Only moderator

router.delete("/:id", authToken, async (req, res, next) => {
  try {
    if (await requesterIsNotModerator(req, res)) return;

    const teamId = req.params.id;
    const team = await service.getById(teamId);
    if (!team) return res.sendStatus(NOT_FOUND);

    const numberOfDestroyedRows = await service.delete(teamId);
    res.json(numberOfDestroyedRows);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
