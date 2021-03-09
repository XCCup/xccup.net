let demoPilots = [
  {
    position: "1",
    name: "Great Pilot 1",
    points: 1658,
    takeoff: "Take Off",
    club: "Moselfalken",
  },
  {
    position: "2",
    name: "Great Pilot 2",
    points: 1654,
    takeoff: "Take Off",
    club: "D.G.F. Rhein-Mosel-Lahn",
  },
  {
    position: "3",
    name: "Great Pilot 3",
    points: 1520,
    takeoff: "Take Off",
    club: "SauerlandAir e.V",
  },
  {
    position: "4",
    name: "Great Pilot 4",
    points: 1592,
    takeoff: "Take Off",
    club: "1. FC Abwind",
  },
  {
    position: "5",
    name: "Great Pilot 5",
    points: 1738,
    takeoff: "Take Off",
    club: "",
  },
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

let tenPilots = document.querySelectorAll(".tenDemoPilots");
for (element of tenPilots) {
  element.innerHTML = `
  <thead>
  <tr>
  </tr>
  </thead>
  <tbody>
  <tr>
    <th scope="row">1</th>
    <td>1.1.2021</td>
    <td>Great Pilot 1</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">2</th>
    <td>1.1.2021</td>
    <td>Great Pilot 2</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">3</th>
    <td>1.1.2021</td>
    <td>Great Pilot 3</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">4</th>
    <td>1.1.2021</td>
    <td>Great Pilot 4</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">5</th>
    <td>1.1.2021</td>
    <td>Great Pilot 1</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">6</th>
    <td>1.1.2021</td>
    <td>Great Pilot 2</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">7</th>
    <td>1.1.2021</td>
    <td>Great Pilot 3</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">8</th>
    <td>1.1.2021</td>
    <td>Great Pilot 4</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>  
  <tr>
    <th scope="row">7</th>
    <td>1.1.2021</td>
    <td>Great Pilot 3</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">8</th>
    <td>1.1.2021</td>
    <td>Great Pilot 4</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
  <th scope="row">9</th>
  <td>1.1.2021</td>
  <td>Great Pilot 3</td>
  <td>Jojo</td>
<td>Take Off</td>
  <td>250 km</td>
  <td>300 P</td>
</tr>
<tr>
  <th scope="row">10</th>
  <td>1.1.2021</td>
  <td>Great Pilot 4</td>
  <td>Jojo</td>
<td>Take Off</td>
  <td>250 km</td>
  <td>300 P</td>
</tr>
  </tbody>`;
}

let fivePilots = document.querySelectorAll(".fiveDemoPilots");
for (element of fivePilots) {
  element.innerHTML = `
  <thead>
  <tr>
  </tr>
  </thead>
  <tbody>
  <tr>
    <th scope="row">1</th>
    <td>1.1.2021</td>
    <td>Great Pilot 1</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">2</th>
    <td>1.1.2021</td>
    <td>Great Pilot 2</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">3</th>
    <td>1.1.2021</td>
    <td>Great Pilot 3</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">4</th>
    <td>1.1.2021</td>
    <td>Great Pilot 4</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  <tr>
    <th scope="row">5</th>
    <td>1.1.2021</td>
    <td>Great Pilot 1</td>
    <td>Jojo</td>
<td>Take Off</td>
    <td>250 km</td>
    <td>300 P</td>
  </tr>
  </tbody>`;
}
