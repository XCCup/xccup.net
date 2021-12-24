const users = require("../convertTo.json");
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
  }

  console.log("No brand found for ", value);
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

function findCountry(value) {
  switch (value) {
    case "D":
      return "Deutschland";
    case "L":
      return "Luxemburg";
    case "NL":
      return "Niederlande";
    case "F":
      return "Frankreich";
    case "B":
      return "Belgien";
    case "NULL":
      return "";

    default:
      console.log("Couldn't match glider class " + value);
      return "";
  }
}

function findGliderClass(value) {
  switch (value) {
    case "GSSPORTL":
      return "AB_low";
    case "GSSPORTH":
      return "AB_high";
    case "GSINTERMEDIATEL":
      return "C_low";
    case "GSINTERMEDIATEH":
      return "C_high";
    case "GSPERFORMANCE":
      return "D_low";
    case "GSCOMP":
      return "D_high";
    case "GSTANDEM":
      return "Tandem";
    case "HGFAI1":
      return "HG_1_Turm";
    case "HGFAI1TL":
      return "HG_1_Turmlos";
    case "HGFAI5":
      return "HG_5_starr";
    default:
      console.log("Couldn't match glider class " + value);
      break;
  }
}

const emails = [];
const duplicatedUsers = [];

const convertedUsers = users.map((user) => {
  const gliderId = uuidv4();

  if (!user.Vorname) {
    console.log("User without name");
    return;
  }

  if (emails.includes(user.EMail1)) {
    console.log("User duplicated: ", user.PilotID);
    return duplicatedUsers.push(user);
  }

  if (!user.EMail1 == "") emails.push(user.EMail1);

  const clubId = findClub(user.VereinID);
  if (!clubId) {
    console.log("User without club");
    return;
  }

  return {
    id: uuidv4(),
    firstName: user.Vorname,
    lastName: user.Name,
    birthday: user.BirthDate == "NULL" ? undefined : user.BirthDate,
    role: "Keine",
    gender: user.Geschlecht,
    tshirtSize: user.TShirtGroesse,
    gliders:
      user.HerstellerID == "NULL"
        ? []
        : [
            {
              id: gliderId,
              brand: findBrand(user.HerstellerID),
              model: user.Fluggeraet,
              gliderClass: findGliderClass(user.GeraeteklasseID),
            },
          ],
    defaultGlider: gliderId,
    address: {
      country: findCountry(user.Land),
    },
    emailInformIfComment: user.KommentarEmail == "1" ? true : false,
    emailNewsletter: user.NewsletterEnabled == "1" ? true : false,
    email:
      user.EMail1 == ""
        ? uuidv4().substring(0, 6) + "@no-mail.import"
        : user.EMail1,
    clubId: findClub(user.VereinID),
    // teamId:
  };
});

convertedUsers.filter((u) => !u);

console.log("Duplicated users: ");
duplicatedUsers.forEach((u) =>
  console.log(`ID: ${u.PilotID} Mail: ${u.EMail1}`)
);

fs.writeFile(
  "usersImport.json",
  JSON.stringify(
    convertedUsers.filter((u) => !!u),
    null,
    2
  ),
  "utf8",
  (err) => {
    console.log(err);
  }
);
