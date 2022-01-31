const tileOptions = {
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: "mapbox/outdoors-v11",
  tileSize: 512,
  zoomOffset: -1,
  //preferCanvas: true,
  r: "@2x",
  accessToken: import.meta.env.VITE_MAPBOX_API_KEY,
};

// TODO: Check attribution: https://docs.mapbox.com/help/getting-started/attribution/

const tileOptionsSatellite = {
  attribution:
    'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: "mapbox/satellite-v9",
  tileSize: 512,
  zoomOffset: -1,
  //preferCanvas: true,
  r: "@2x",
  accessToken: import.meta.env.VITE_MAPBOX_API_KEY,
};

export { tileOptions, tileOptionsSatellite };
