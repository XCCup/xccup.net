import logger from "../config/logger";
import { XccupHttpError } from "./ErrorHandler";
import { INTERNAL_SERVER_ERROR } from "../constants/http-status-constants";

const FEET_IN_METER = 0.3048;

/**
 * Converts a vertical airspace limit (GND/MSL/AGL/FL) to MSL (in meter)
 * @param {string} verticalLimit
 * @param {number} elevation
 * @returns
 */
export function convertVerticalLimitToMeterMSL(
  verticalLimit: string,
  elevation: number
) {
  if (verticalLimit.includes("GND")) {
    return elevation ?? 0;
  }

  const heightValue = extractHeightValueFromText(verticalLimit);

  if (verticalLimit.includes("AGL")) {
    return convertFeetToMeter(heightValue) + elevation ?? 0;
  }

  if (verticalLimit.includes("MSL")) {
    return convertFeetToMeter(heightValue);
  }

  /**
   * This is actually not the correct way to convert a FL to a MSL altitude. On high pressure
   * days the result will to low. But it's the only practical way for the moment because not
   * every flightlog includes the pressure altitude…
   */
  if (verticalLimit.includes("FL")) {
    return convertFeetToMeter(heightValue * 100);
  }
  logger.warn("AS: No parsable height value found: " + verticalLimit);
}

function convertFeetToMeter(feet: number) {
  return feet * FEET_IN_METER;
}

function extractHeightValueFromText(textValue: string): number {
  const result = textValue.replace(/[^0-9]/g, "");

  if (!result) {
    const message =
      "Couldn't convert airspace height information of " + textValue;
    throw new XccupHttpError(INTERNAL_SERVER_ERROR, message, message);
  }

  return +result;
}
