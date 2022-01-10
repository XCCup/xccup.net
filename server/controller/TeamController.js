const express = require("express");
const router = express.Router();
const service = require("../service/TeamService");
const mailService = require("../service/MailService");
const { NOT_FOUND } = require("../constants/http-status-constants");
const { authToken, requesterIsNotModerator } = require("./Auth");
const {
  checkStringObjectNotEmpty,
  checkIsArray,
  checkParamIsUuid,
  validationHasErrors,
} = require("./Validation");
const { query } = require("express-validator");
const { getCache, setCache, deleteCache } = require("./CacheManager");
const CACHE_RELEVANT_KEYS = ["teams", "filterOptions"];

// @desc Gets all teams of year
// @route GET /teams

router.get(
  "/",
  query("year").optional().isInt(),
  query("includeStats").optional().isBoolean(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      const value = getCache(req);
      if (value) return res.json(value);

      const teams = await service.getAll({ ...req.query });

      setCache(req, teams);

      res.json(teams);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Gets all team names of year
// @route GET /teams/names

router.get(
  "/names",
  query("year").optional().isInt(),
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;
    const { year } = req.query;

    try {
      const teams = await service.getAllNames(year);
      res.json(teams);
    } catch (error) {
      next(error);
    }
  }
);

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

    const { name, memberIds } = req.body;

    try {
      await service.checkMembersAlreadyAssigned(memberIds);

      const team = await service.create(name, memberIds);
      mailService.sendAddedToTeamMail(name, memberIds);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(team);
    } catch (error) {
      next(error);
    }
  }
);

// @desc Deletes a team by id
// @route DELETE /teams/:id
// @access Only moderator

router.delete(
  "/:id",
  checkParamIsUuid("id"),
  authToken,
  async (req, res, next) => {
    if (validationHasErrors(req, res)) return;

    try {
      if (await requesterIsNotModerator(req, res)) return;

      const numberOfDestroyedRows = await service.delete(req.team.id);

      deleteCache(CACHE_RELEVANT_KEYS);

      res.json(numberOfDestroyedRows);
    } catch (error) {
      next(error);
    }
  }
);

// Handle not found db entry
router.param("id", async (req, res, next, id) => {
  try {
    const team = await service.getById(id);
    if (!team) return res.sendStatus(NOT_FOUND);
    req.team = team;
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = router;
