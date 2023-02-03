import { FLIGHT_TYPE } from "../constants/flight-constants";
import { FlightInstanceUserInclude } from "../db/models/Flight";
import {
  Member,
  TeamWithMemberFlights,
  Totals,
  UserResultFlight,
  UserResults,
} from "../types/ResultTypes";

export function limitFlightsForUserAndCalcTotals(
  resultArray: UserResults[],
  maxNumberOfFlights: number,
  useClassicMode?: boolean
) {
  const limitFunction = useClassicMode
    ? selectTopFlightsOnlyByPoints
    : selectTopMixedFlights;

  return resultArray.map((entry) => {
    const flights = limitFunction(entry.flights, maxNumberOfFlights);

    return {
      ...entry,
      flights,
      totalFlights: flights.length,
      totalDistance: sumUp(flights, "flightDistance"),
      totalPoints: sumUp(flights, "flightPoints"),
    };
  });
}

function selectTopFlightsOnlyByPoints(
  flights: UserResultFlight[],
  maxNumberOfFlights: number
) {
  return flights.slice(0, maxNumberOfFlights);
}

/**
 * Find top flights.
 * For hangglider pilots score always top 3 flights.
 * For paragliders allow only 2 of a kind oneway (free) or triangle (flat&fai).
 * To work correctly it is mandatory that the flights are already sorted desc by flightPoints (normally achieved by sorting in the db query).
 */
function selectTopMixedFlights(
  flights: UserResultFlight[],
  maxNumberOfFlights: number
) {
  // Include (n-1) of maxNumberFlights from top
  const topFlights = flights.slice(0, maxNumberOfFlights - 1);
  // Add next flight in line if the previous flights were all made my a hangglider
  if (areAllFlightsMadeByHandglider(topFlights)) {
    addNextPossibleFlight(flights, topFlights);
    return topFlights;
  }
  // Add next triangle flight if only oneway flights are present
  if (areAllFlightsOneway(topFlights)) {
    addNextTriangleFlight(flights, topFlights);
    return topFlights;
  }
  // Add next oneway flight if only triangle flights are present
  if (areAllFlightsTriangle(topFlights)) {
    addNextOnewayFlight(flights, topFlights);
    return topFlights;
  }

  addNextPossibleFlight(flights, topFlights);
  return topFlights;
}

function addNextPossibleFlight(
  allFlights: UserResultFlight[],
  topFlights: UserResultFlight[]
) {
  // Add only an entry if a flight is present
  if (allFlights[topFlights.length]) {
    topFlights.push(allFlights[topFlights.length]);
  }
}

function areAllFlightsMadeByHandglider(flights: UserResultFlight[]) {
  const HANGGLIDER_PREFIX = "HG";
  return flights.every((f) =>
    f.glider.gliderClass.key.includes(HANGGLIDER_PREFIX)
  );
}

function areAllFlightsOneway(flights: UserResultFlight[]) {
  return flights.every((f) => f.flightType == FLIGHT_TYPE.FREE);
}

function areAllFlightsTriangle(flights: UserResultFlight[]) {
  return flights.every(
    (f) => f.flightType == FLIGHT_TYPE.FAI || f.flightType == FLIGHT_TYPE.FLAT
  );
}

function addNextOnewayFlight(
  allFlights: UserResultFlight[],
  topFlights: UserResultFlight[]
) {
  const found = allFlights.find((f) => f.flightType == FLIGHT_TYPE.FREE);
  if (found) topFlights.push(found);
}

function addNextTriangleFlight(
  allFlights: UserResultFlight[],
  topFlights: UserResultFlight[]
) {
  const found = allFlights.find(
    (f) => f.flightType == FLIGHT_TYPE.FAI || f.flightType == FLIGHT_TYPE.FLAT
  );
  if (found) topFlights.push(found);
}

function sumUp(
  flights: UserResultFlight[],
  key: "flightPoints" | "flightDistance"
) {
  return flights.reduce((acc, cur) => acc + cur[key], 0);
}

export function calcTotalsOverMembers(team: TeamWithMemberFlights) {
  return {
    ...team,
    totalPoints: team.members.reduce(
      (acc, member) => acc + member.totalPoints,
      0
    ),
    totalDistance: team.members.reduce(
      (acc, member) => acc + member.totalDistance,
      0
    ),
  };
}

export function calcTotalsOfMember(member: Member) {
  member.totalPoints = member.flights.reduce((acc, flight) => {
    if (flight.isDismissed) return acc;
    return acc + flight.flightPoints;
  }, 0);
  member.totalDistance = member.flights.reduce((acc, flight) => {
    if (flight.isDismissed) return acc;
    return acc + flight.flightDistance;
  }, 0);
}

/**
 * Sorts an array of result objects descending by the value of the "totalPoints" field of each entry.
 * @param {*} resultArray The result array to be sorted.
 */
export function sortDescendingByTotalPoints(resultArray: Totals[]) {
  resultArray.sort((a, b) => {
    return b.totalPoints - a.totalPoints;
  });
}

export function sortDescendingByTotalPointsDismissed(resultArray: Totals[]) {
  resultArray.sort((a, b) => {
    if (!a.totalPointsDismissed && !b.totalPointsDismissed) return 0;
    if (!b.totalPointsDismissed) return -1;
    if (!a.totalPointsDismissed) return 1;
    return b.totalPointsDismissed - a.totalPointsDismissed;
  });
}

export function removeMultipleEntriesForUsers(
  resultsWithMultipleEntriesForUser: FlightInstanceUserInclude[]
) {
  const results: FlightInstanceUserInclude[] = [];

  resultsWithMultipleEntriesForUser.forEach((e) => {
    const found = results.find((r) => r.user.id == e.user.id);
    if (found) return;
    results.push(e);
  });
  return results;
}
