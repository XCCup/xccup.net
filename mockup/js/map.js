// Create Map
var mymap = L.map("map", {
  dragging: !L.Browser.mobile,
  tap: !L.Browser.mobile,
});

let latLongDataPilot = [];
let latLongDataBuddy1 = [];

var tracklog;
var tracklogBuddy1;

//Setup Map options
L.tileLayer(
  "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}{r}?access_token={accessToken}",
  {
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "mapbox/outdoors-v11",
    tileSize: 512,
    zoomOffset: -1,
    //preferCanvas: true,
    r: "@2x",
    accessToken:
      "pk.eyJ1IjoiYmx1ZW9yYyIsImEiOiJja205bm12ajIxNGV0MndsYWVqeDc4enE3In0.38AVZ2_Gjy_ST_4LxcgahA",
  }
).addTo(mymap);

//mymap.setView([51.505, -0.09], 9);

// Setup pilot markers
var markerPilot = L.circleMarker([51.508, -0.11], {
  color: "#fff",
  fillColor: "DarkRed",
  fillOpacity: 0.8,
  radius: 8,
  weight: 2,
  stroke: true,
}).addTo(mymap);

var markerBuddy1 = L.circleMarker([51.508, -0.11], {
  color: "#fff",
  fillColor: "DarkSlateBlue",
  fillOpacity: 0.8,
  radius: 8,
  weight: 2,
  stroke: true,
});

function updateMap() {
  // Draw track on map
  mymap.setView(latLongDataPilot[0], 12);
  tracklog = L.polyline(latLongDataPilot, { color: "DarkRed" }).addTo(mymap);
  tracklogBuddy1 = L.polyline(latLongDataBuddy1, {
    color: "DarkSlateBlue",
  });

  // zoom the map to the polyline
  mymap.fitBounds(tracklog.getBounds());
}
