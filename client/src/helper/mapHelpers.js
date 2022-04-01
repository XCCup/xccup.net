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
  const upperLimit = addRepresentationInMeters(airspace.ceiling);
  const lowerLimit = addRepresentationInMeters(airspace.floor);
  const content = `Name: ${airspace.name}<br>Class: ${airspace.class}<br>Ceiling: ${airspace.ceiling}${upperLimit}<br>Floor: ${airspace.floor}${lowerLimit}`;
  return content;
}

function addRepresentationInMeters(value) {
  const valueInMeters = convertVerticalLimitToMeterMSL(value);
  return valueInMeters ? ` / ${valueInMeters} m` : "";
}

function convertVerticalLimitToMeterMSL(value) {
  const FACTOR_FT_TO_M = 0.3048;

  // TODO: "0" ist actually not correct. The elevation of the fix would be the correct altitiude.
  if (value == "GND") return 0;

  // TODO: On server side we convert FL to meters MSL in a pretty uncorrect way.
  // How to explain this to the user here? For now we just give him the FL
  if (value.includes("FL")) return value;
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
