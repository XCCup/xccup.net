/*
 * Modified version of launch & landing detection of https://github.com/mmomtchev/igc-xc-score
 *
 * Launch and landing are detected on a n-second moving average
 * of the horizontal and vertical speed
 *
 * maPeriod is the number of seconds for the moving average
 *
 * Launch detection requires that the horizontal and vertical moving averages
 * raise above xt/zt and then stay above x0/z0 for at least t seconds - the launch
 * is considered to have happened at the xt/zt.
 *
 * t is the number of seconds that the conditions must be true
 * (the event is still assigned to the start of the period)
 *
 * x is the horizontal speed in m/s
 *
 * z is the absolute value of the vertical speed in m/s
 *
 * Launch/landing is detected when both of the moving averages
 * cross the detection threshold for t seconds
 */

import type { BRecord, IGCFile } from "../helper/igc-parser";
import { Point } from "./igc-score/foundation";

interface ExtendedBRecord extends BRecord {
  hspeed?: number;
  vspeed?: number;
  hma?: number;
  vma?: number;
  stateFlight?: boolean;
  stateGround?: boolean;
}

const maPeriod = 10;
const definitionFlight = {
  t: 60,
  x0: 1.5,
  xt: 5,
  z0: 0.05,
  zt: 0.9,
};

const definitionGround = {
  t: 20,
  xmax: 2.1,
  zmax: 0.2,
};
// Attach horizontal and vertical speed to each fix
function prepare(fixes: ExtendedBRecord[]) {
  for (let i = 0; i < fixes.length; i++) {
    if (i > 0) {
      const deltaTimestamp = fixes[i].timestamp - fixes[i - 1].timestamp;
      if (deltaTimestamp > 0) {
        fixes[i].hspeed =
          ((new Point(fixes, i - 1).distanceEarth(new Point(fixes, i)) * 1000) /
            deltaTimestamp) *
          1000;

        /** Prefer pressure altitude over gps altitude for calculation of vertical movement.
         * This may have mixed pressure references when only one fix
         * has undefined pressure alt. But it's very unlikely to happen… */

        const alt1 = fixes[i].pressureAltitude ?? fixes[i].gpsAltitude;
        const alt2 = fixes[i - 1].pressureAltitude ?? fixes[i - 1].gpsAltitude;

        if (alt1 && alt2)
          fixes[i].vspeed = ((alt1 - alt2) / deltaTimestamp) * 1000;
      } else {
        fixes[i].hspeed = fixes[i - 1].hspeed;
        fixes[i].vspeed = fixes[i - 1].vspeed;
      }
    } else {
      fixes[i].hspeed = 0;
      fixes[i].vspeed = 0;
    }
  }

  for (let i = 0; i < fixes.length; i++) {
    const now = fixes[i].timestamp;
    let start, end;
    for (
      start = i;
      start > 0 &&
      fixes[start].timestamp > now - Math.round((maPeriod * 1000) / 2);
      start--
    );
    for (
      end = i;
      end < fixes.length - 1 &&
      fixes[end].timestamp < now + Math.round((maPeriod * 1000) / 2);
      end++
    );
    const maSegment = fixes.slice(start, end + 1);

    fixes[i].hma =
      maSegment.reduce(
        (sum, x) => (fixes[i].hma = x.hspeed ? sum + x.hspeed : 0),
        0
      ) / maSegment.length;
    fixes[i].vma =
      maSegment.reduce((sum, x) => sum + Math.abs(x.vspeed ?? 0), 0) /
      maSegment.length;
  }
}

function detectFlight(fixes: ExtendedBRecord[]) {
  let start: number | undefined;
  for (let i = 0; i < fixes.length - 1; i++) {
    const fix = fixes[i];

    if (
      start === undefined &&
      fix.hma! > definitionFlight.xt &&
      fix.vma! > definitionFlight.zt
    )
      start = i;
    if (start !== undefined)
      if (fix.hma! > definitionFlight.x0 && fix.vma! > definitionFlight.z0) {
        if (
          fixes[i].timestamp >
          fixes[start].timestamp + definitionFlight.t * 1000
        )
          for (let j = start; j <= i; j++) fix.stateFlight = true;
      } else {
        start = undefined;
      }
  }
}

function detectGround(fixes: ExtendedBRecord[]) {
  let start;
  for (let i = 0; i < fixes.length - 1; i++) {
    const fix = fixes[i];

    // // Uncomment this block and adjust the timestamps to analyze a flight
    // if (fix.timestamp > 1682941530000 && fix.timestamp < 1682941730000) {
    //   console.log(
    //     `T: ${fix.time}; GA: ${fix.gpsAltitude}; HS: ${fix.hspeed?.toFixed(
    //       2
    //     )}; VS: ${fix.vspeed?.toFixed(2)}; HMA: ${fix.hma?.toFixed(
    //       2
    //     )}; VMA: ${fix.vma?.toFixed(2)}`
    //   );
    // }

    if (
      start === undefined &&
      fix.hma! < definitionGround.xmax &&
      fix.vma! < definitionGround.zmax
    ) {
      // console.log("Start of possible ground contact: ", fix.time);
      start = i;
    }
    if (start !== undefined)
      if (
        fix.hma! < definitionGround.xmax &&
        fix.vma! < definitionGround.zmax
      ) {
        if (
          fix.timestamp >
          fixes[start].timestamp + definitionGround.t * 1000
        ) {
          // console.log("Mark this as ground: ", fix.time);
          for (let j = start; j <= i; j++) fix.stateGround = true;
        }
      } else {
        // console.log("Revoke possible ground contact: ", fix.time);
        start = undefined;
      }
  }
}

export function detectLaunchLanding(fixes: ExtendedBRecord[]) {
  for (let i = 0; i < fixes.length - 1; i++) {
    if (fixes[i].stateFlight) {
      let j;
      for (j = i; j > 0 && !fixes[j].stateGround; j--);
      const launch = j;
      for (j = i; j < fixes.length - 2 && !fixes[j].stateGround; j++);
      const landing = j;

      return { launch, landing: j };
    }
  }
  return { launch: 0, landing: fixes.length - 1 };
}

export function findLaunchAndLandingIndexes(flight: IGCFile) {
  prepare(flight.fixes);
  detectFlight(flight.fixes);
  detectGround(flight.fixes);
  return detectLaunchLanding(flight.fixes);
}

exports.findLaunchAndLandingIndexes = findLaunchAndLandingIndexes;
