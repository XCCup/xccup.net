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
 * For paragliders include at least 1 one-way flight.
 */
function reduceToTopFlights(
  flights: UserResultFlight[],
  maxNumberOfFlights: number
) {
  // Include (n-1) of maxNumberFlights from top
  const topFlights = flights.slice(0, maxNumberOfFlights - 1);
  // Check if a free flight is already in the top flights
  // If free flight is already contained add the next flight in line
  if (isFreeFlightIncluded(topFlights)) {
    addNextPossibleFlight(flights, topFlights, maxNumberOfFlights);
    return topFlights;
  }
  // Add also next flight in line if the previous flights were all made my a hangglider
  if (areAllFlightsMadeByHandglider(topFlights)) {
    console.log(JSON.stringify(topFlights, null, 2));
    addNextPossibleFlight(flights, topFlights, maxNumberOfFlights);
    console.log(JSON.stringify(topFlights, null, 2));
    return topFlights;
  }
  // Find the next best free flight
  const nextFreeFlight = findNextFreeFlight(flights);
  if (nextFreeFlight) topFlights.push(nextFreeFlight);
  return topFlights;
}

function addNextPossibleFlight(
  allFlights: UserResultFlight[],
  topFlights: UserResultFlight[],
  maxNumberOfFlights: number
) {
  console.log("Hi");

  // Add only an entry if a flight is present
  if (allFlights[maxNumberOfFlights - 1]) {
    console.log("Ho");
    topFlights.push(allFlights[maxNumberOfFlights - 1]);
  }
}

function isFreeFlightIncluded(flights: UserResultFlight[]) {
  const found = flights.find((f) => f.flightType == FLIGHT_TYPE.FREE);
  return found ? true : false;
}

function areAllFlightsMadeByHandglider(flights: UserResultFlight[]) {
  const HANGGLIDER_PREFIX = "HG";
  return flights.every((f) =>
    f.glider.gliderClass.key.includes(HANGGLIDER_PREFIX)
  );
}

function findNextFreeFlight(flights: UserResultFlight[]) {
  const found = flights.find((f) => f.flightType == FLIGHT_TYPE.FREE);
  return found;
}

function sumUp(
  flights: UserResultFlight[],
  key: "flightPoints" | "flightDistance"
) {
  return flights.reduce((acc, cur) => acc + cur[key], 0);
}
