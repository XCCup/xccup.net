export function convertMapBoundsToQueryString(data) {
  if (!data) return null;
  let bounds = [];
  bounds.push(data.getBounds().getNorthEast());
  bounds.push(data.getBounds().getNorthWest());
  bounds.push(data.getBounds().getSouthWest());
  bounds.push(data.getBounds().getSouthEast());
  // TODO: Expand the boundary to show nearby airspaces
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

export function processTracklogs(flight, buddyTracks) {
  const tracklogs = [];
  const tracklog = [];
  for (var i = 0; i < flight.fixes.length; i++) {
    tracklog.push([flight.fixes[i].latitude, flight.fixes[i].longitude]);
  }
  tracklogs.push(tracklog);

  if (buddyTracks) {
    buddyTracks.forEach((element) => {
      const track = [];
      // Check if this track is activated
      if (element.isActive) {
        for (var i = 0; i < element.fixes.length; i++) {
          track.push([element.fixes[i].latitude, element.fixes[i].longitude]);
        }
      }
      tracklogs.push(track);
    });
  }
  return tracklogs;
}
