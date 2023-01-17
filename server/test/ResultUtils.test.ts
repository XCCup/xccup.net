import { limitFlightsForUserAndCalcTotals } from "../helper/ResultUtils";
import { UserResultFlight, UserResults } from "../types/ResultTypes";

test("Pilot has 5 FAI --> Top 2 count", () => {
  const flights = createTestEntry(createTestFlights(1, 2, "FAI", "GS", 5));

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

  expect(topFlights[0].flights.length).toBe(2);
  expect(topFlights[0].totalPoints).toBe(2);
  expect(topFlights[0].totalDistance).toBe(4);
});

test("Pilot has 2 FAI --> Top 2 count", () => {
  const flights = createTestEntry(createTestFlights(1, 2, "FAI", "GS", 2));

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

  expect(topFlights[0].flights.length).toBe(2);
  expect(topFlights[0].totalPoints).toBe(2);
  expect(topFlights[0].totalDistance).toBe(4);
});

test("Pilot has 5 FAI flights but is hangglider --> Top 3 count", () => {
  const flights = createTestEntry(createTestFlights(1, 2, "FAI", "HG", 5));

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

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

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

  expect(topFlights[0].flights.length).toBe(3);
  expect(topFlights[0].totalPoints).toBe(6);
  expect(topFlights[0].totalDistance).toBe(15);
});

test("Pilot has top 3 fai, 2 free, 1 flat (has more points than free) --> Top 2 fai and top 1 free count", () => {
  const flights = createTestEntry(
    createTestFlights(25, 15, "FAI", "GS", 3),
    createTestFlights(15, 5, "FREE", "GS", 2),
    createTestFlights(20, 10, "FLAT", "GS", 1)
  );

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

  expect(topFlights[0].flights.length).toBe(3);
  expect(topFlights[0].totalPoints).toBe(65);
  expect(topFlights[0].totalDistance).toBe(35);
});

test("Pilot has only 1 fai flight --> The 1 flight should cont", () => {
  const flights = createTestEntry(createTestFlights(5, 13, "FAI", "GS", 1));

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

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

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

  expect(topFlights[0].flights.length).toBe(3);
  expect(topFlights[0].totalPoints).toBe(23);
  expect(topFlights[0].totalDistance).toBe(21);
});

test("Pilot has 3 free flights --> Top 2 count", () => {
  const flights = createTestEntry(
    createTestFlights(15, 5, "FREE", "GS", 2),
    createTestFlights(10, 3, "FREE", "GS", 1)
  );

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

  expect(topFlights[0].flights.length).toBe(2);
  expect(topFlights[0].totalPoints).toBe(30);
  expect(topFlights[0].totalDistance).toBe(10);
});

test("Pilot has 3 free flights (HG) --> Top 3 count", () => {
  const flights = createTestEntry(
    createTestFlights(15, 5, "FREE", "HG", 2),
    createTestFlights(10, 3, "FREE", "HG", 1)
  );

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

  expect(topFlights[0].flights.length).toBe(3);
  expect(topFlights[0].totalPoints).toBe(40);
  expect(topFlights[0].totalDistance).toBe(13);
});

test("Pilot has 4 top free flights, 2 fai, 2 flat (fai top) --> Top 2 free and top fai count", () => {
  const flights = createTestEntry(
    createTestFlights(50, 25, "FREE", "GS", 4),
    createTestFlights(10, 3, "FLAT", "GS", 1),
    createTestFlights(30, 15, "FAI", "GS", 1)
  );

  console.log(JSON.stringify(flights, null, 2));

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

  expect(topFlights[0].flights.length).toBe(3);
  expect(topFlights[0].totalPoints).toBe(130);
  expect(topFlights[0].totalDistance).toBe(65);
});

test("Pilot has 4 top free flights, 2 fai, 2 flat (flat top) --> Top 2 free and top flat count", () => {
  const flights = createTestEntry(
    createTestFlights(50, 25, "FREE", "GS", 4),
    createTestFlights(60, 20, "FLAT", "GS", 1),
    createTestFlights(30, 15, "FAI", "GS", 1)
  );

  const topFlights = limitFlightsForUserAndCalcTotals(flights, 3);

  expect(topFlights[0].flights.length).toBe(3);
  expect(topFlights[0].totalPoints).toBe(160);
  expect(topFlights[0].totalDistance).toBe(70);
});

function createTestEntry(...testFlights: UserResultFlight[][]): UserResults[] {
  const flights = testFlights.flat();
  // Flights arrive from the db sorted desc by flight points
  flights.sort((a, b) => b.flightPoints - a.flightPoints);
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

  return arr;
}
