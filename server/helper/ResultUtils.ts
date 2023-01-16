import { FLIGHT_TYPE } from "../constants/flight-constants";
import { UserResultFlight, UserResults } from "../types/ResultTypes";

export function limitFlightsForUserAndCalcTotalsNew(
  resultArray: UserResults[],
  maxNumberOfFlights: number
) {
  return resultArray.map((entry) => {
    const flights = reduceToTopFlights(entry.flights, maxNumberOfFlights);

    return {
      ...entry,
      flights,
      totalFlights: flights.length,
      totalDistance: sumUp(flights, "flightDistance"),
      totalPoints: sumUp(flights, "flightPoints"),
    };
  });
}

/**
 * Find top flights.
 * For hangglider pilots score always top 3 flights.
 * For paragliders allow only 2 of a kind oneway (free) or triangle (flat&fai).
 * To work correctly it is mandatory that the flights are already sorted desc by flightPoints (normally achieved by sorting in the db query).
 */
function reduceToTopFlights(
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

function isOnewayFlightIncluded(flights: UserResultFlight[]) {
  const found = flights.find((f) => f.flightType == FLIGHT_TYPE.FREE);
  return found ? true : false;
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
