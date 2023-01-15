import { limitFlightsForUserAndCalcTotalsNew } from "../helper/ResultUtils";
import { UserResultFlight, UserResults } from "../types/ResultTypes";

test("Pilot has 5 FAI --> Top 2 count", () => {
  const flights = createTestEntry(createTestFlights(1, 2, "FAI", "GS", 5));

  const topFlights = limitFlightsForUserAndCalcTotalsNew(flights, 3);

  expect(topFlights[0].flights.length).toBe(2);
  expect(topFlights[0].totalPoints).toBe(2);
  expect(topFlights[0].totalDistance).toBe(4);
});

test("Pilot has 2 FAI --> Top 2 count", () => {
  const flights = createTestEntry(createTestFlights(1, 2, "FAI", "GS", 2));

  const topFlights = limitFlightsForUserAndCalcTotalsNew(flights, 3);

  expect(topFlights[0].flights.length).toBe(2);
  expect(topFlights[0].totalPoints).toBe(2);
  expect(topFlights[0].totalDistance).toBe(4);
});

test("Pilot has 5 FAI flights but is hangglider --> Top 3 count", () => {
  const flights = createTestEntry(createTestFlights(1, 2, "FAI", "HG", 5));

  const topFlights = limitFlightsForUserAndCalcTotalsNew(flights, 3);

  expect(topFlights[0].flights.length).toBe(3);
  expect(topFlights[0].totalPoints).toBe(3);
  expect(topFlights[0].totalDistance).toBe(6);
});

test("Pilot has 1 free, 1 fai, 1 flat --> All flights count", () => {
  const flights = createTestEntry(
    createTestFlights(1, 4, "FAI", "GS", 1),
    createTestFlights(2, 5, "FLAT", "GS", 1),
    createTestFlights(3, 6, "FREE", "GS", 1)
  );

  const topFlights = limitFlightsForUserAndCalcTotalsNew(flights, 3);

  expect(topFlights[0].flights.length).toBe(3);
  expect(topFlights[0].totalPoints).toBe(6);
  expect(topFlights[0].totalDistance).toBe(15);
});

test("Pilot has top 3 fai, 2 free, 1 flat --> Top 2 fai and top 1 free count", () => {
  const flights = createTestEntry(
    createTestFlights(5, 13, "FAI", "GS", 3),
    createTestFlights(15, 5, "FREE", "GS", 2),
    createTestFlights(3, 3, "FLAT", "GS", 1)
  );

  const topFlights = limitFlightsForUserAndCalcTotalsNew(flights, 3);

  expect(topFlights[0].flights.length).toBe(3);
  expect(topFlights[0].totalPoints).toBe(25);
  expect(topFlights[0].totalDistance).toBe(31);
});

test("Pilot has only 1 fai flight --> The 1 flight should cont", () => {
  const flights = createTestEntry(createTestFlights(5, 13, "FAI", "GS", 1));

  const topFlights = limitFlightsForUserAndCalcTotalsNew(flights, 3);

  expect(topFlights[0].flights.length).toBe(1);
  expect(topFlights[0].totalPoints).toBe(5);
  expect(topFlights[0].totalDistance).toBe(13);
});

test("Pilot has 1 free, 1 fai, 1 flat --> All flights count", () => {
  const flights = createTestEntry(
    createTestFlights(5, 13, "FAI", "GS", 1),
    createTestFlights(15, 5, "FREE", "GS", 1),
    createTestFlights(3, 3, "FLAT", "GS", 1)
  );

  const topFlights = limitFlightsForUserAndCalcTotalsNew(flights, 3);

  expect(topFlights[0].flights.length).toBe(3);
  expect(topFlights[0].totalPoints).toBe(23);
  expect(topFlights[0].totalDistance).toBe(21);
});

function createTestEntry(...testFlights: UserResultFlight[][]): UserResults[] {
  const flights = testFlights.flat();
  return [
    {
      flights,
      club: { id: "", name: "" },
      team: { id: "", name: "" },
      user: { firstName: "", gender: "", id: "", lastName: "" },
    },
  ];
}

function createTestFlights(
  flightPoints: number,
  flightDistance: number,
  flightType: string,
  gliderType: string,
  amount: number
): UserResultFlight[] {
  const arr = [];
  for (let i = 0; i < amount; i++) {
    const flight: UserResultFlight = {
      flightDistance,
      flightPoints,
      flightType,
      glider: {
        gliderClass: { key: gliderType, shortDescription: "" },
        brand: "",
        id: "",
        model: "",
      },
      ageOfUser: 0,
      externalId: 0,
      id: "",
      takeoffId: "",
      takeoffName: "",
      takeoffRegion: "",
      takeoffShortName: "",
      isDismissed: false,
    };
    arr.push(flight);
  }

  arr.sort((a, b) => b.flightPoints - a.flightPoints);

  return arr;
}
