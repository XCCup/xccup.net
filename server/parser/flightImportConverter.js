const flights = require("../convertToFlightModel.json");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

function findBrand(value) {
  const brands = require("../test/testdatasets/brands.json");
  const brandNames = brands.map((b) => b.name);

  const found = brandNames.find((b) => b.toUpperCase() == value);

  if (found) return found;

  switch (value) {
    case "NOVAP":
      return "Nova";
    case "AIRCROSS":
      return "Air Cross";
    case "FLOW_PARAGLIDERS":
      return "Flow";
    case "AIR":
      return "A-I-R";
    case "AIRDESIGN":
      return "AirDesign";
    case "WILLSWING":
      return "Wills Wings";
    case "UTURN":
      return "U-Turn";
    case "MACPARA":
      return "Mac Para";
    case "PAPILLON_PARAGLIDERS":
      return "Papillon Paragliders";
    case "SKY":
      return "Sky Paragliders";
    case "LITTLE_CLOUD":
      return "Little Cloud";
  }

  if (!value || value == "NULL") return undefined;

  console.log("No brand found for ", value);

  return value;
}

function findClubName(value, clubNames) {
  const found = clubNames.find((b) => b.toUpperCase() == value);

  if (found) return found;

  switch (value) {
    case "GVNAHEGLAN":
      return "";
    case "PC_WERRATAL_ESCHWEGE_EICHSFELD":
      return "";
    case "1":
      return "Drachenflugclub Saar";
    case "3":
      return "Die Moselfalken";
    case "6":
      return "DFC Vulkaneifel";
    case "7":
      return "D.G.F. Rhein-Mosel-Lahn";
    case "8":
      return "Ostwindfreunde";
    case "11":
      return "DGF Hellertal";
    case "16":
      return "Delta-Club Rheinland";
    case "30":
      return "DGLC Frankfurt-Rhein-Main";
    case "2":
      return "Drachenflieger-Club Trier";
    case "4":
      return "1. Pfälzer DGFC";
    case "12":
      return "Südpfälzer GFC";
    case "ASS":
      return "Asslarer Gleitschirmflieger";
    case "5":
      return "Gleitschirmfreunde Hochwald";
    case "10":
      return "DGC Nahetal";
    default:
      console.log("No club found for ", value);
  }
}

function findClub(value) {
  const clubs = require("../test/testdatasets/clubs.json");
  const name = findClubName(
    value,
    clubs.map((c) => c.shortName)
  );

  return clubs.find((c) => c.name == name || c.shortName == name)?.id;
}

const missingTakeoff = {};

function findSite(value, takeoff) {
  const sites = require("../test/testdatasets/flyingSites.json");

  takeoff = takeoff.trim();

  let found = sites.find(
    (s) =>
      value.includes(s.shortName) ||
      takeoff.toUpperCase().includes(s.name.toUpperCase()) ||
      s.name.toUpperCase().includes(takeoff.toUpperCase()) ||
      s.shortName.toUpperCase().includes(takeoff) ||
      takeoff.toUpperCase().includes(s.shortName)
  );

  switch (takeoff) {
    case "Schwabhausen":
    case "Schwabhausen Winde":
    case "Schwabhausen (Schlepp)":
    case "Boxberg - DE[~5,44km]":
      found = sites.find((s) => s.shortName == "BOXBERG");
      break;
    case "Nassau":
      found = sites.find((s) => s.shortName == "NASSAU");
      break;
    case "Duedinghausen":
      found = sites.find((s) => s.shortName == "DUEDINGHAUSEN");
      break;
    case "Bruchhausen":
    case "bruchhausen":
      found = sites.find((s) => s.shortName == "BRUCHHAUSER_STEINE_S");
      break;
    case "Neef":
      found = sites.find((s) => s.shortName == "PETERSBERG");
      break;
    case "Maring SO":
    case "Maring":
      found = sites.find((s) => s.shortName == "MARING_SO");
      break;
    case "Rachtig":
      found = sites.find((s) => s.shortName == "ZELTINGEN");
      break;
    case "St. Katharinen - Auf dem unteren Mergesfeld - Schlepp (SO, NW)":
    case "St. Katharinen - Mergesfeld Süd - Schlepp (N, S)":
    case "St. Katharinen":
      found = sites.find(
        (s) => s.shortName == "KATHARINEN_AUF_UNTEREM_MERGESFELD_SCHLEPP"
      );
      break;
    case "Battenberg - DE[~1,79km]":
    case "Battenberg - DE[~1,77km]":
    case "Eisenberg":
      found = sites.find((s) => s.shortName == "EISENBERG");
      break;
    case "Nannhausen - DE[~0,54km]":
    case "Nannhausen Schlepp":
    case "Nannhausen Flugplatz":
      found = sites.find((s) => s.shortName == "NANNHAUSEN");
      break;
    case "Bausenberg":
    case "Bausenberg, Niederzissen":
      found = sites.find((s) => s.shortName == "BAUSENBERG");
      break;
    case "Wirmighausen":
    case "wirmighausen":
    case "Wirmighausen - NW":
    case "Wirmighausen-Papillon Schulgelände":
      found = sites.find((s) => s.shortName == "WIRMINGHAUSEN");
      break;
    case "Segelflugplatz Hirzenhain":
    case "Hirzenhain Schleppgelände":
    case "Eschenburg-Hirzenhain":
      found = sites.find((s) => s.shortName == "HIRZENHAIN");
      break;
    case "Pohlheim":
    case "Segelflugplatz Pohlheim":
    case "Pohlheim - DE[~2,61km]":
    case "Flugplatz Pohlheim":
      found = sites.find((s) => s.shortName == "POHLHEIM");
      break;
    case "Elpe Steinmarkskopf":
    case "Steinmarkskopf Elpe":
    case "elpe":
      found = sites.find((s) => s.shortName == "ELPE");
      break;
    case "Dreis":
    case "Dreis/Brück":
    case "Dreis-Brück":
      found = sites.find((s) => s.shortName == "DREISERWEIHER");
      break;
    case "Aschaffenburg-Nilkheim (Windenschlepp)":
    case "Aschaffenburg nilkheim":
    case "Aschaffenburg Winde":
    case "Aschaffenburg Nilkheim":
    case "Nilkheim":
    case "Aschaffenburg - DE[~2,99km]":
    case "Aschaffenburg":
      found = sites.find((s) => s.shortName == "NILKHEIM");
      break;
    case "Zellhausen":
    case "Zellhausen Flugplatz":
    case "Windenstart Zellhausen":
    case "Mainhausen - DE[~0,64km]":
      found = sites.find((s) => s.shortName == "ZELLHAUSEN");
      break;
    case "Hasloch SO":
      found = sites.find((s) => s.shortName == "HECKENKOPF");
      break;
    case "Bergstein":
    case "Bergstein-Segelflugplatz":
      found = sites.find((s) => s.shortName == "BERGSTEIN");
      break;
    case "Winde Hockenheim":
    case "Hockenheim Winde":
    case "Flugplatz Hockenheim - Winde":
      found = sites.find((s) => s.shortName == "HOCKENHEIM");
      break;
    case "Asslar":
    case "Aßlar":
    case "Aßlar - DE[~2,49km]":
    case "Aßlar - DE[~2,47km]":
    case "Aßlar - DE[~2,5km]":
    case "Aßlar - DE[~1,79km]":
    case "Flugplatz Asslar":
    case "Flugplatz Aßlar (Windenschlepp)":
      found = sites.find((s) => s.shortName == "ASSLAR");
      break;
    case "Winde Oberacker":
      found = sites.find((s) => s.shortName == "OBERACKER_WINDE");
      break;
    case "Bad Wildungen Schaufel":
    case "Bad Wildungen":
    case "Schaufel Winde":
    case "Schaufel Schlepp":
    case "Bad Wildungen - DE[~3,58km]":
    case "Bad Wildungen - DE[~3,57km]":
    case "Bad Wildungen - DE[~3,56km]":
    case "Bad Wildungen Flugplatz":
      found = sites.find((s) => s.shortName == "SCHAUFEL");
      break;
    default:
      break;
  }

  if (found) return found?.id;

  console.log("No site found for id: " + value + " Name: " + takeoff);
  if (missingTakeoff[takeoff])
    missingTakeoff[takeoff] = missingTakeoff[takeoff] + 1;
  missingTakeoff[takeoff] = 1;
}

function findUser(value) {
  const users = require("../test/testdatasets/usersImport.json");

  const found = users.find((u) => u.oldId == value);

  if (found) return found?.id;

  console.log("No user found for: ", value);
}

function findStatus(value) {
  switch (value) {
    case -1:
      return "Nicht in Wertung";
    case 0:
      return "Zielflug";
    case 1:
    case 2: //LRV In Wertung
      return "In Wertung";
    case 3:
      return "Flugbuch";

    default:
      break;
  }
}
function findLVR(value) {
  return value == 2;
}

function findType(value) {
  switch (value) {
    case "JOJO":
    case "ZF": //Zielflug
      return "FREE";
    case "D":
      return "FLAT";
    case "FAI-D":
      return "FAI";

    default:
      console.log("No type found for ", value);
  }
}

function createGlider(HerstellerID, Fluggeraet, GeraeteklasseID) {
  return {
    brand: findBrand(HerstellerID),
    model: Fluggeraet,
    gliderClass: findGliderClass(GeraeteklasseID),
  };
}

function findGliderClass(value) {
  switch (value) {
    case "GSSPORTL":
    case "GSSPORTA":
      return { key: "AB_low", shortDescription: "GS Sport low" };
    case "GSSPORTH":
    case "GSSPORTB":
    case "GSSPORT":
      return { key: "AB_high", shortDescription: "GS Sport high" };
    case "GSINTERMEDIATEL":
    case "GSINTERMEDIATEA":
      return { key: "C_low", shortDescription: "GS Intermediate low" };
    case "GSINTERMEDIATEH":
    case "GSINTERMEDIATEB":
    case "GSADV":
      return { key: "C_high", shortDescription: "GS Intermediate high" };
    case "GSPERFORMANCE":
    case "GSPERFORMANCEA":
      return { key: "D_low", shortDescription: "GS Performance low" };
    case "GSCOMP":
    case "GSPERFORMANCEB":
    case "GSPERF":
    case "GSOFFEN":
      return { key: "D_high", shortDescription: "GS Competition high" };
    case "GSTANDEM":
      return { key: "Tandem", shortDescription: "GS Tandem" };
    case "HGFAI1":
    case "HGFAI1TX":
      return { key: "HG_1_Turm", shortDescription: "Turmdrachen" };
    case "HGFAI1TL":
      return { key: "HG_1_Turmlos", shortDescription: "Drachen turmlos" };
    case "HGFAI5":
      return { key: "HG_5_starr", shortDescription: "Drachen Starre" };
    default:
      console.log("Couldn't match glider class " + value);
      break;
  }
}

function createReport(report, flightId) {
  const prefix = `Dieser Flug wurde aus der alten Datenbank importiert. Für die Vollständigkeit kann keine Garantie gegeben werden. Du findest den Flug in der Originalversion unter https://archiv.xccup.netFlugDetails/${flightId}`;

  // if (!report) return;

  // let newReport = report;

  // const regexTags = /<.*>/gi;
  // try {
  //   newReport = newReport.replace(regexTags, " ");
  //   return prefix + "\n" + newReport;
  // } catch (error) {
  //   console.log(error);
  // }

  return prefix;
}

const convertedFlights = flights.map((flight) => {
  return {
    id: uuidv4(),
    oldPilotId: flight.PilotID,
    externalId: flight.FlugID,
    clubId: findClub(flight.VereinID),
    siteId: findSite(flight.StartplatzWPID, flight.Startplatz),
    userId: findUser(flight.PilotID),
    landing: flight.Landeplatz,
    report: createReport(flight.Flugbericht, flight.FlugID),
    airspaceComment: null,
    flightPoints: flight.Punkte,
    flightDistance: flight.Strecke,
    flightDistanceFree: 0,
    flightDistanceFlat: 0,
    flightDistanceFAI: 0,
    flightType: findType(flight.FlugaufgabeID),
    flightStatus: findStatus(flight.FlugStatus),
    flightTurnpoints: {},
    airtime: 0,
    takeoffTime: 0,
    landingTime: 0,
    igcPath: flight.IGCFile,
    glider: createGlider(
      flight.HerstellerID,
      flight.Fluggeraet,
      flight.GeraeteklasseID
    ),
    airspaceViolation: findLVR(flight.FlugStatus),
    uncheckedGRecord: false,
    violationAccepted: findLVR(flight.FlugStatus),
    hikeAndFly: 0,
    isWeekend: false,
    region: "",
    ageOfUser: 0,
    homeStateOfUser: "",
    flightStats: {},
  };
});

console.log("Missing Takeoffs: ", missingTakeoff);

fs.writeFile(
  "flightsImport.json",
  JSON.stringify(convertedFlights, null, 2),
  "utf8",
  (err) => {
    console.log(err);
  }
);