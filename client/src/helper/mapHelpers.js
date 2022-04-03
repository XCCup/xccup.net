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
  const upperLimitInMeters = tryToConvertToMeters(airspace.ceiling);
  const lowerLimitInMeters = tryToConvertToMeters(airspace.floor);
  return `Name: ${airspace.name}<br>Class: ${airspace.class}<br>Ceiling: ${airspace.ceiling}${upperLimitInMeters}<br>Floor: ${airspace.floor}${lowerLimitInMeters}`;
}

function tryToConvertToMeters(value) {
  const FACTOR_FT_TO_M = 0.3048;

  if (value == "GND") return "";

  if (value.includes("FL")) return "";

  if (value.includes("ft")) {
    const meters = Math.round(parseInt(value.substring(0, 5)) * FACTOR_FT_TO_M);
    return ` / ${meters} m`;
  }

  return "";
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
