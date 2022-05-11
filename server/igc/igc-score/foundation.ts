// @ts-nocheck
import * as util from "./util";
export class Point {
  constructor(x, y) {
    if (Array.isArray(x)) {
      this.x = x[y].longitude;
      this.y = x[y].latitude;
      this.r = y;
    } else {
      this.x = x;
      this.y = y;
    }
  }

  distanceEarth(p) {
    return this.distanceEarthFCC(p);
  }

  distanceEarthFCC(p) {
    const df = p.y - this.y;
    const dg = p.x - this.x;
    const fm = util.radians((this.y + p.y) / 2);
    // Speed up cos computation using:
    // - cos(2x) = 2 * cos(x)^2 - 1
    // - cos(a+b) = 2 * cos(a)cos(b) - cos(a-b)
    const cosfm = Math.cos(fm);
    const cos2fm = 2 * cosfm * cosfm - 1;
    const cos3fm = cosfm * (2 * cos2fm - 1);
    const cos4fm = 2 * cos2fm * cos2fm - 1;
    const cos5fm = 2 * cos2fm * cos3fm - cosfm;
    const k1 = 111.13209 - 0.566605 * cos2fm + 0.0012 * cos4fm;
    const k2 = 111.41513 * cosfm - 0.09455 * cos3fm + 0.00012 * cos5fm;
    const d = Math.sqrt(k1 * df * (k1 * df) + k2 * dg * (k2 * dg));
    return d;
  }
}
