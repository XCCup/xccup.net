let demoPilots = [
  { position: "1", name: "Great Pilot 1", points: 1658, club: "Moselfalken" },
  {
    position: "2",
    name: "Great Pilot 2",
    points: 1654,
    club: "D.G.F. Rhein-Mosel-Lahn",
  },
  {
    position: "3",
    name: "Great Pilot 3",
    points: 1520,
    club: "SauerlandAir e.V",
  },
  { position: "4", name: "Great Pilot 4", points: 1592, club: "1. FC Abwind" },
  { position: "5", name: "Great Pilot 5", points: 1738, club: "" },
];

function generateTableHead(table, data) {
  let thead = table.createTHead();
  //   let row = thead.insertRow();
  //   for (let key of data) {
  //     let th = document.createElement("th");
  //     let text = document.createTextNode(key);
  //     th.appendChild(text);
  //     row.appendChild(th);
  //   }
}

function generateTable(table, data) {
  for (let element of data) {
    let row = table.insertRow();
    for (key in element) {
      if (key === "position" || key === "name") {
        let cell = row.insertCell();
        let text = document.createTextNode(element[key]);
        cell.appendChild(text);
      }
    }
  }
}

let table = document.querySelectorAll(".threeDemoPilots");
for (element of table) {
  let data = Object.keys(demoPilots[0]);
  generateTableHead(element, data);
  generateTable(element, demoPilots.slice(0, 3));
}
