import fs from "fs";
import path from "path";
import IGCParser from "../helper/igc-parser";
import { findLaunchAndLandingIndexes } from "../igc/FindLaunchAndLanding";

test("Test launch & landing detection", () => {
  const tests = [
    {
      file: "demo_igcs/flight_with_car_drive/flight_with_car_drive.igc",
      launch: 1750,
      landing: 2362,
    },
    {
      file: "demo_igcs/no-pressure-alt.igc",
      launch: 0,
      landing: 15757,
    },
  ];

  for (let test of tests) {
    const flight = IGCParser.parse(
      fs.readFileSync(path.join("igc", test.file), "utf8"),
      { lenient: true }
    );
    const ll = findLaunchAndLandingIndexes(flight);
    expect(ll.launch).toBe(test.launch);
    expect(ll.landing).toBe(test.landing);
  }
});
