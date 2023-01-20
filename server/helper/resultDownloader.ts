import db from "../db";
import axios from "axios";

/**
 * This module gives you the opportunity to download results from the live system and store in the local postgres instance.
 * After that you can export the local results table and import it to the live system.
 *
 * Beware: The local IDs have to be updated to ensure uniqueness. Otherwise the import will fail.
 * UPDATE "Results" SET "id" = "id" + A_GREAT_OFFSET_NUMBER
 */

storeOldResults(2022);

function storeOldResults(year: number) {
  const BASEURL = "https://xccup.net/api/";

  const resultTupels = createResultTuple(year);

  db["Result"].create({
    result: [],
    season: year,
    type: "DELETE_ME",
  });

  resultTupels.forEach(async (r) => {
    try {
      const res = await axios.get(BASEURL + r[1]);
      const values = res.data.values;

      db["Result"].create({ result: values, season: year, type: r[0] });
    } catch (error) {
      console.log(error);
    }
  });
}

function createResultTuple(year: number) {
  return [
    ["overall", `results/?year=${year}`],
    ["ladies", `results/?year=${year}&gender=F`],
    ["gsSport", `results/?year=${year}&rankingClass=gsSport`],
    ["gsIntermediate", `results/?year=${year}&rankingClass=gsIntermediate`],
    ["gsPerformance", `results/?year=${year}&rankingClass=gsPerformance`],
    ["gsTandem", `results/?year=${year}&rankingClass=gsTandem`],
    ["hgFlex", `results/?year=${year}&rankingClass=hgFlex`],
    ["hgFixed", `results/?year=${year}&rankingClass=hgFixed`],
    ["club", `results/clubs?year=${year}`],
    ["team", `results/teams?year=${year}`],
    ["seniors", `results/seniors?year=${year}`],
    ["LUX", `results/state/LUX?year=${year}`],
    ["RP", `results/state/RP?year=${year}`],
    ["newcomer", `results/newcomer?year=${year}`],
  ];
}
