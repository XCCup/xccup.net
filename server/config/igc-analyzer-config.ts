/**
 * The resolution in seconds with which fixes are stored to the db
 */
export const IGC_FIXES_RESOLUTION = 5;
/**
 * The factor by which the fixes within a igcFile will be parsed for the first iteration of the olc algorithm
 * Starting with:
 * * 1h = RESOLUTION_FACTOR
 * * 2h = 2 x RESOLUTION_FACTOR
 * * nh = n x RESOLUTION_FACTOR
 */
export const RESOLUTION_FACTOR = 4;
/**
 * The amount of fixes around a turnpoint which will be considered for the second iteration of the olc algorithm
 */
export const FIXES_AROUND_TURNPOINT = 20;
