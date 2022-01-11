export function convertMapBoundsToQueryString(data) {
  if (!data) return null;
  let bounds = [];
  // Expand boundary by pad factor
  const pad = 0.4;
  const area = data.getBounds().pad(pad);
  bounds.push(area.getNorthEast());
  bounds.push(area.getNorthWest());
  bounds.push(area.getSouthWest());
  bounds.push(area.getSouthEast());
  return bounds.map((x) => [x.lng, x.lat]).join("|");
}

export function createAirspacePopupContent(airspace) {
  const ceilingInMeters = addRepresentationInMeters(airspace.ceiling);
  const floorInMeters = addRepresentationInMeters(airspace.floor);
  const content = `Name: ${airspace.name}<br>Class: ${airspace.class}<br>Ceiling: ${airspace.ceiling}${ceilingInMeters}<br>Floor: ${airspace.floor}${floorInMeters}`;
  return content;
}

function addRepresentationInMeters(value) {
  const valueInMeters = convertHeightStringToMetersValue(value);
  return valueInMeters ? ` / ${valueInMeters} m` : "";
}

function convertHeightStringToMetersValue(value) {
  const FACTOR_FT_TO_M = 0.3048;

  if (value == "GND") return 0;
  //FL is calculated in relation to a local pressure value we don't know. Therefore we will return undefined.
  if (value.includes("FL")) return undefined;
  // if (value.includes("FL")) return Math.round(parseInt(value.substring(2, value.length)) * FACTOR_FT_TO_M * 100);
  if (value.includes("ft"))
    return Math.round(parseInt(value.substring(0, 5)) * FACTOR_FT_TO_M);
}

function createTrackLog(flight) {
  return flight.fixes.map(({ latitude, longitude, timestamp }) => [
    latitude,
    longitude,
    timestamp,
  ]);
}

export function processTracklogs(flight, buddyTracks) {
  const tracklogs = [];
  tracklogs.push(createTrackLog(flight));

  if (buddyTracks) {
    buddyTracks.forEach((buddyTrack) => {
      // Check if this track is activated
      tracklogs.push(buddyTrack.isActive ? createTrackLog(buddyTrack) : []);
    });
  }
  return tracklogs;
}
