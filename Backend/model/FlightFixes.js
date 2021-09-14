module.exports = (sequelize, DataTypes) => {
  const FlightFixes = sequelize.define("FlightFixes", {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    geom: {
      type: DataTypes.GEOMETRY("LINESTRING"),
      //Stores the lat/long information of the track
      allowNull: false,
    },
    timeAndHeights: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      //Stores the height information (elevation, pressureAltitude, gpsAltitude) and time/timestamp of the track
      allowNull: false,
    },
    /**
     * lineString and heights data must correspond over indexes
     */
  });

  FlightFixes.createGeometry = function (fixes) {
    const coordinates = [];
    fixes.forEach((fix) => {
      coordinates.push([fix.longitude, fix.latitude]);
    });
    return {
      type: "LineString",
      coordinates,
    };
  };

  FlightFixes.extractTimeAndHeights = function (fixes) {
    const times = [];
    fixes.forEach((fix) => {
      times.push({
        timestamp: fix.timestamp,
        time: fix.time,
        pressureAltitude: fix.pressureAltitude,
        gpsAltitude: fix.gpsAltitude,
        elevation: fix.elevation,
      });
    });
    return times;
  };

  FlightFixes.mergeCoordinatesAndOtherData = function (fixes) {
    const coordinates = fixes.geom.coordinates;
    const other = fixes.timeAndHeights;
    const newOb = [...other];
    for (let i = 0; i < other.length; i++) {
      newOb[i].longitude = coordinates[i][0];
      newOb[i].latitude = coordinates[i][1];
    }
    return newOb;
  };

  return FlightFixes;
};
