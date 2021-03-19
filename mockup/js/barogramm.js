// Set defaults
Chart.defaults.elements.line.borderWidth = 2;
Chart.defaults.elements.line.tension = 1;

Chart.defaults.elements.point.pointBorderWidth = 0;
Chart.defaults.elements.point.pointRadius = 0;
//Chart.defaults.elements.point.pointHitRadius = 0;
Chart.defaults.elements.point.pointHoverRadius = 0;

// Chart.defaults.plugins.decimation.enabled = true;
// console.log(Chart.defaults.plugins.decimation);

// Barogramm setup
var ctx = document.getElementById("barogramm");
var barogramm = new Chart(ctx, {
  type: "line",
  data: {
    datasets: [
      {
        label: "Stephan",
        data: [],
        backgroundColor: "rgb(139, 0, 0)",
        borderColor: "rgb(139, 0, 0)",
      },
      {
        hidden: true,
        label: "Kai",
        data: [],
        backgroundColor: "rgb(72, 61, 139)",
        borderColor: "rgb(72, 61, 139)",
      },
      {
        label: "GND",
        backgroundColor: "rgb(139, 69, 19)",
        borderColor: "rgb(139, 69, 19)",
        data: [],
        fill: true,
        // lineTension: 0,
        // borderWidth: 2,
      },
    ],
  },
  options: {
    parsing: true,
    locale: "de-DE",
    maintainAspectRatio: false,

    //responsive: true,
    // onHover: (e, el, elz, b) => {
    //   console.log("*****");

    //   const canvasPosition = Chart.helpers.getRelativePosition(e, barogramm);

    //   // Substitute the appropriate scale IDs
    //   const dataX = barogramm.scales.x.getValueForPixel(canvasPosition.x);
    // console.log(barogramm.scales.x);
    // },
    plugins: {
      // decimation: {
      //   enabled: false,
      //   algorithm: "lttb",
      //   samples: 20,
      // },
      title: {
        display: false,
        text: "Barogramm",
      },
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
        mode: "x",
        intersect: false,
        animation: {
          duration: 5,
        },
        // filter: function (tooltipItem, data, third, four,) {
        //   // if (third)
        //   console.log(tooltipItem);
        //   return true;
        // },
        external: function (tooltipModel) {
          // console.log(tooltipModel);
          // if (tooltipModel.tooltip.dataPoints.length > 1) {
          //   const dataPointIdexes = [];
          //   const result = [];
          //   const result1 = [];
          //   tooltipModel.tooltip.dataPoints.forEach((dp, index) => {
          //     if (!dataPointIdexes.includes(dp.datasetIndex)) {
          //       result.push(dp);
          //       dataPointIdexes.push(dp.datasetIndex);
          //       result1.push(tooltipModel.tooltip.body[index]);
          //     }
          //   });
          //   tooltipModel.tooltip.dataPoints = result;
          //   tooltipModel.tooltip.body = result1;
          //   tooltipModel.tooltip.height = 322;
          //   tooltipHeaderHeight +
          //   tooltipItemHeight * tooltipModel.tooltip.body.length;
          // }
        },
        callbacks: {
          label: function (context, two, three, four) {
            if (context.dataset.label == "GND") {
              return;
            }
            var label = context.dataset.label || "";
            if (label) {
              label += ": ";
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y + "m";
            }
            // Update position on map
            updateMapPosition(context);
            return label;
          },
        },
      },
    },
    hover: {
      //mode: "nearest",
      intersect: true,
      // animationDuration: 0,
    },
    scales: {
      x: {
        type: "time",
        //distribution: "linear",
        time: {
          //parser: "HH:mm:ss",
          round: "second",
          displayFormats: {
            minute: "HH:mm",
            hour: "HH:mm",
          },
          tooltipFormat: "HH:mm:ss",
          minUnit: "hour",
        },
        ticks: {},
        title: {
          display: false,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "GPS Höhe",
        },
        beginAtZero: true,
        ticks: {
          callback: function (value, index, values) {
            return value + "m";
          },
        },
      },
    },
  },
});
// Disable all animations
// barogramm.options.animation = false;

async function getDemoFlight(chart) {
  let response = await fetch("demoData/flight.json");
  flightData = await response.json();

  let response2 = await fetch("demoData/flightBuddy1.json");
  flightDataBuddy1 = await response2.json();

  let response3 = await fetch("demoData/elevationData.json");
  let elevationData = await response3.json();

  let pilot = [];
  let buddy1 = [];
  // Reduce tracklog points. Lesser points = faster GUI
  let shrinkBy = 10;
  // Only for debugging
  let maxLength = 300000;

  for (var i = 0; i < flightData.fixes.length; i++) {
    //Skip every xth point for drawing
    if (i % shrinkBy === 0 && i < maxLength) {
      pilot.push({
        x: flightData.fixes[i].timestamp,
        // x: dateFns.format(flightData.fixes[i].timestamp, "HH:mm:ss"),
        y: flightData.fixes[i].gpsAltitude,
      });
      latLongDataPilot.push([
        flightData.fixes[i].latitude,
        flightData.fixes[i].longitude,
      ]);
    }
  }
  for (var i = 0; i < flightDataBuddy1.fixes.length; i++) {
    // Skip every xth point for drawing
    if (i % shrinkBy === 0 && i < maxLength) {
      buddy1.push({
        x: flightDataBuddy1.fixes[i].timestamp,
        y: flightDataBuddy1.fixes[i].gpsAltitude,
      });
      latLongDataBuddy1.push([
        flightDataBuddy1.fixes[i].latitude,
        flightDataBuddy1.fixes[i].longitude,
      ]);
    }
  }

  for (var i = 0; i < elevationData.length; i++) {
    // Skip every xth point for drawing
    if (i % shrinkBy === 0 && i < maxLength / 10) {
      elevation.push({
        x: elevationData[i].timestamp,
        y: elevationData[i].elevation,
      });
    }
  }

  // Update barogram
  barogramm.data.datasets[0].data = pilot;
  barogramm.data.datasets[1].data = buddy1;
  barogramm.data.datasets[2].data = elevation;
  barogramm.update();

  // Update map
  tracksOnMap = createTrackLines([latLongDataPilot, latLongDataBuddy1]);
  centerMapOn(latLongDataPilot);
  fitMap(tracksOnMap[0]);

  // Create markers
  markers = createMarkers(tracksOnMap);
}

const updateMapPosition = (context) => {
  if (context.datasetIndex === 0) {
    if (latLongDataPilot[context.dataIndex]) {
      markers[0].setLatLng(latLongDataPilot[context.dataIndex]);
      //  Center map on main flight
      mymap.setView(latLongDataPilot[context.dataIndex]);
    }
  }

  if (context.datasetIndex === 1) {
    if (latLongDataBuddy1[context.dataIndex]) {
      markers[1].setLatLng(latLongDataBuddy1[context.dataIndex]);
    }
  }
};

const checkbox = (context) => {
  if (context.checked) {
    barogramm.setDatasetVisibility(1, true);
    barogramm.setDatasetVisibility(2, false);
    barogramm.update();
    tracksOnMap[1].addTo(mymap);
    markers[1].addTo(mymap);
  } else {
    barogramm.setDatasetVisibility(1, false);
    barogramm.setDatasetVisibility(2, true);
    barogramm.update();
    tracksOnMap[1].remove();
    markers[1].remove();
  }
};
