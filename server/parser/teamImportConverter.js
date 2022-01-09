const teams = require("../convertToTeamModel.json");
const teamMembers = require("../convertToTeamMembers.json");
const users = require("../import/usersImport.json");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

function findMembers(teamId, season) {
  const membersOfTeam = teamMembers.filter(
    (m) => m.Season == season && m.TeamID == teamId
  );
  // if (members.length != 5) console.log(members);

  return membersOfTeam.map((member) => {
    const found = users.find((u) => u.oldId == member.PilotID);
    if (!found) console.log("no user found for pilotId: " + member.PilotID);
    return found?.id;
  });
}

const convertedTeams = teams.map((team) => {
  const transformedTeam = {
    id: team.RowID,
    oldId: team.TeamID,
    name: team.TeamName,
    season: team.Season,
    members: findMembers(team.TeamID, team.Season),
    createdAt: team.Lupd_Timestamp,
  };

  return transformedTeam;
});

fs.writeFile(
  "teamsImport.json",
  JSON.stringify(
    convertedTeams.filter((t) => !!t),
    null,
    2
  ),
  "utf8",
  (err) => {
    console.log(err);
  }
);
