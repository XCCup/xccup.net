// Create Map
var mymap = L.map("map", {
  dragging: !L.Browser.mobile,
  tap: !L.Browser.mobile,
});
// Initial View
mymap.setView([50.143, 7.146], 8);

const trackColors = ["DarkRed", "DarkSlateBlue"];

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

const createTrackLines = (tracklogs) => {
  let trackLogObjects = [];
  tracklogs.forEach((track, index) => {
    trackLogObjects.push(
      L.polyline(track, { color: trackColors[index] }) //.addTo(mymap)
    );
    // Activate first tracklog
    if (index === 0) {
      trackLogObjects[index].addTo(mymap);
    }
  });
  return trackLogObjects;
};

// Pilot markers
const createMarkers = (tracklogs) => {
  let markers = [];
  tracklogs.forEach((track, index) => {
    markers.push(
      L.circleMarker([51.508, -0.11], {
        color: "#fff",
        fillColor: track.options.color,
        fillOpacity: 0.8,
        radius: 8,
        weight: 2,
        stroke: true,
      })
    );
    // Activate first marker
    if (index === 0) {
      markers[index].addTo(mymap);
    }
  });
  return markers;
};

const centerMapOn = (coordinates) => {
  mymap.setView(coordinates[0], 12);
};

const fitMap = (track) => {
  mymap.fitBounds(track.getBounds());
};
