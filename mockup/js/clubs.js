const clubs = [
  {
    name: "Kurpfälzer Gleitschirmflieger",
    website: "http://www.kurpfaelzer-gleitschirmflieger.de",
  },
  {
    name: "Gleitschirmverein Nahe Glan",
    website: "http://www.gleitschirmverein-nahe-glan.de",
  },
  {
    name: "Die Moselfalken",
    website: "http://www.moselfalken.de",
  },
  {
    name: "Asslarer Gleitschirmflieger",
    website: "http://www.asslarergleitschirmflieger.de",
  },
  {
    name: "Drachenflieger-Club Trier",
    website: "http://www.dfc-trier.com",
  },
  {
    name: "D.G.F. Rhein-Mosel-Lahn",
    website: "http://www.thermik4u.de",
  },
  {
    name: "DGLC Frankfurt-Rhein-Main",
    website: "http://dglc-rhein-main.de/",
  },
  {
    name: "Pfälzer Gleitschirmclub",
    website: "http://www.pfaelzergleitschirmclub.info",
  },
  {
    name: "SauerlandAir e.V.",
    website: "http://www.sauerlandair.de/",
  },
  {
    name: "Gleitzeit e.V.",
    website: "http://www.gleitzeit-ev.de",
  },
  {
    name: "PC Werratal-Eschwege-Eichsfeld e.V.",
    website: null,
  },
  {
    name: "GSC Neckar-Odenwald",
    website: "http://www.para-now.de",
  },
  {
    name: "Südpfälzer GFC",
    website: "http://www.duddefliecher.de",
  },
  {
    name: "DFC Vulkaneifel",
    website: "http://www.dfc-vulkaneifel.de",
  },
  {
    name: "Ourewäller Iwwefliejer",
    website: "http://www.oif.de",
  },
  {
    name: "Ostwindfreunde e.V.",
    website: "http://www.ostwindfreunde.de",
  },
  {
    name: "Cumulux Paragliding Club",
    website: "http://cumulux.lu",
  },
  {
    name: "RDG Poppenhausen e.V.",
    website: "http://www.rdg-ev.de",
  },
  {
    name: "Aero-Club Altena",
    website: "http://www.air-hegenscheid.de",
  },
];

let selectClub = document.getElementById("list-clubs");
var select = document.createElement("select");
select.appendChild(selectClub.lastElementChild);
for (var i = 0; i < clubs.length; ++i) {
  var option = document.createElement("option");
  option.value = i;
  option.innerHTML = clubs[i].name; // Use innerHTML to set the text
  select.appendChild(option);
}

selectClub.innerHTML = select.innerHTML;
