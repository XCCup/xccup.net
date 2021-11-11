export function convertMapBoundsToQueryString(data) {
  if (!data) return "";
  let tmp = [];
  tmp.push(data.getBounds().getSouthWest());
  tmp.push(data.getBounds().getNorthEast());
  tmp.push(data.getBounds().getNorthWest());
  tmp.push(data.getBounds().getSouthEast());
  return tmp.map((x) => [x.lng, x.lat]).join("|");
}
