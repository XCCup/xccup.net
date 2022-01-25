const users = require("../convertToUserModel.json");
const fs = require("fs");
const { v4: uuidv4, v5: uuidv5 } = require("uuid");

const userUuidNamespace = "630eb68f-e0fa-5ecc-887a-7c7a62614681";

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
    case "1":
      return "Drachenflugclub Saar";
    case "3":
      return "Die Moselfalken";
    case "6":
      return "DFC Vulkaneifel";
    case "7":
      return "D.G.F. Rhein-Mosel-Lahn";
    case "8":
      return "Ostwindfreunde e.V.";
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
      return { key: "AB_low", shortDescription: "GS Sport low" };
    case "GSSPORTH":
      return { key: "AB_high", shortDescription: "GS Sport high" };
    case "GSINTERMEDIATEL":
      return { key: "C_low", shortDescription: "GS Intermediate low" };
    case "GSINTERMEDIATEH":
      return { key: "C_high", shortDescription: "GS Intermediate high" };
    case "GSPERFORMANCE":
      return { key: "D_low", shortDescription: "GS Performance low" };
    case "GSCOMP":
      return { key: "D_high", shortDescription: "GS Competition high" };
    case "GSTANDEM":
      return { key: "Tandem", shortDescription: "GS Tandem" };
    case "HGFAI1":
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

const emails = [];
const duplicatedUsers = [];

const convertedUsers = users.map((user) => {
  const gliderId = uuidv4();

  if (!user.Vorname) {
    console.log("User without name");
    return;
  }

  const clubId = findClub(user.VereinID);
  const transformedUser = {
    id: uuidv5(user.PilotID, userUuidNamespace),
    password: uuidv4(),
    oldId: user.PilotID,
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
      user.EMail1 == "" || !user.EMail1
        ? uuidv4().substring(0, 6) + "@no-mail.import"
        : user.EMail1,
    clubId,
  };
  // if (!clubId) {
  //   console.log("User without club: ", user.PilotID);
  //   return;
  // }

  if (emails.includes(user.EMail1)) {
    console.log("User duplicated: ", user.PilotID);
    transformedUser.email =
      "duplicated_" + Math.ceil(Math.random() * 4711) + transformedUser.email;
    // return duplicatedUsers.push(transformedUser);
  }

  if (!user.EMail1 == "") emails.push(user.EMail1);

  return transformedUser;
});

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
