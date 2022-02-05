<template>
  <div>
    <!-- TODO: Refine this -->
    <h3>Ausschreibung XCCup 2022</h3>
    <ol>
      <li class="mb-3">
        <strong>Art der Wertung</strong><br />
        Streckenflugwettbewerb mit Einzelwertung und Teamwertung,
        Vereinswertung, Sonderwertung, Rheinland-Pfalz Pokal
      </li>
      <li class="mb-3">
        <strong>Teilnehmer</strong><br />
        Alle Mitglieder der teilnehmenden Vereine. Die Teilnehmer müssen im
        Besitz einer in Deutschland anerkannten und gültigen Berechtigung zum
        Überlandflug sein.
      </li>
      <li class="mb-3">
        <strong>Fluggeräte</strong><br />
        Hängegleiter, Starrflügler und Gleitschirme.
      </li>
      <li class="mb-3">
        <strong>Gewertete Flüge</strong><br />
        <p class="mb-3">
          Flüge mit Start im XCCup Gebiet.<br />
          F-Schlepp: Schlepphöhe darf 1000m und 5km Radius vom Flugfeld nicht
          überschreiten.
        </p>

        <!-- TODO: Karte des XCCup Gebietes !  -->
        <p class="mb-3">
          <strong>Koordinaten</strong> <br />
          NO: N51°29'19.70" E010° 18' 13"<br />
          NW: N51° 29' 19.70" E006° 02' 32.9"<br />
          SW: N48° 56' 19.5" E006° 02' 32.9"<br />
          SO: N48° 56' 19.5" E010° 18' 13“<br />
        </p>
        <strong>Mindestpunktzahl</strong> <br />
        Ein Flug muss eine Punktzahl von mindestens 60 erreichen, um als
        Wertungsflug zu zählen. <br />
        Piloten die mindestens 2 Wertungsflüge erzielen, qualifizierten sich für
        ein XCCup T-Shirt.
      </li>
      <li class="mb-3">
        <strong>Zeitraum</strong><br />
        15.02.2022 bis 15.10.2022
      </li>
      <li class="mb-3">
        <!-- TODO: Tabelle oder Link einfügen "hier" -->
        <strong>Faktoren</strong><br />
        Details zu den Faktoren der Geräteklassen sind hier zusammengefasst.
        <router-link
          to="/ausschreibung#factorPanel"
          @click.capture="anchorHashCheck('factorPanel')"
        >
          <i class="bi bi-box-arrow-in-right"></i>
        </router-link>
      </li>
      <li class="mb-3">
        <strong>Einzelwertung</strong><br />
        Wertung der besten 3 eingereichten Flüge eines Piloten.
      </li>
      <li class="mb-3">
        <strong>Gerätewertung</strong><br />

        <p class="mb-3">
          Für folgende Klassen erfolgt eine Wertung. Dabei umfassen
          Wertungsklassen ggfs. verschiedene Geräteklassen.
        </p>

        <ul>
          <li class="mb-3">
            <strong>Sportklasse</strong> (EN A + EN B, Tandem)
            <ul>
              <li>
                Sport Low: Schirme EN A+B mit einer maximalen Streckung &lt;5,2
              </li>
              <li>Sport High: Schirme EN A+B mit einer Streckung >=5,2</li>
            </ul>
          </li>
          <li class="mb-3">
            <strong> Intermediate Klasse</strong> (EN C)
            <ul>
              <li>
                Intermediate Low: Schirme EN C mit einer maximalen Streckung
                &lt;6,4
              </li>
              <li>
                Intermediate High: Schirme EN C mit einer Streckung von >6,4
              </li>
            </ul>
          </li>
          <li class="mb-3">
            <strong>Performance Klasse</strong> (EN D + CC mit AR 7,0 und höher)
            <ul>
              <li>
                Performance: Schirme mit EN-D und einer maximalen Streckung von
                6,99
              </li>
              <li>
                Competition: Schirme mit EN-D oder CCC und einer Streckung von
                7,0 und mehr
              </li>
            </ul>
          </li>
          <li class="mb-3">
            <strong>Gleitschirm Tandem</strong><br />
            (ab 5 Teilnehmern mit Wertungsflügen, sonst Sportklasse)
          </li>
          <li class="mb-3">
            <strong>Flexdrachen</strong><br />
            <ul>
              <li>Turmdrachen</li>
              <li>Drachen turmlos</li>
            </ul>
          </li>
          <li class="mb-3">
            <strong>Starrflüger</strong><br />
            <ul>
              <li>Drachen starre</li>
            </ul>
          </li>
        </ul>
        Alle Gleitschirmklassen werden mit ihrer ausgelegter Streckung (gem.
        Herstellerangaben) gekoppelt berechnet. Siehe Faktoren Tabelle.
      </li>
      <li class="mb-3">
        <strong>Seniorenwertung</strong><br />
        Piloten welche in der laufenden Saison ein Alter von 60 Jahren
        überschreiten, bzw. dies schon getan haben, sind berichtigt an der
        "Seniorenwertung" teilzunehmen. Der jeweilge Pilot erhält in der
        Seniorenwertung einen Bonus auf seinen Flug. Der Bonus berechnet sich
        wie folgt: 2% Aufschlag auf die Punkte des jeweiligen Fluges, für jedes
        weitere Lebensjahr über 60 Jahre. D.h. ein Pilot mit 61 Jahren bekommt
        anstatt 100 Punkte 102 Punkte. Ein Pilot mit 70 Jahren respektiv 20%
        mehr. Es zählen jeweils die drei Flüge mit den meisten Punkten.
      </li>
      <li class="mb-3">
        <strong>Newcomerwertung</strong><br />
        Piloten welche noch keinen Wertungsflug in einer vorherigen Saison des
        XCCup eingereicht haben, sind berichtigt an der "Newcomerwertung"
        teilzunehmen. Die Wertung kommt ab einer Mindestteilnehmerzahl von 5
        Personen zustande. Gewertet werden dabei nur Flüge, welche mit einem
        Gerät bis zur Klassifizerung "Sportklasse high" (vgl. 7. Einzelwertung)
        eingereicht wurden. Es zählen jeweils die drei Flüge mit den meisten
        Punkten.
      </li>
      <li class="mb-3">
        <strong>Teamwertung</strong><br />
        Piloten können sich freiwillig zu Teams zusammenschließen und an einer
        seperaten Teamwertung teilnehmen. Ein Team besteht dabei immer aus genau
        5 Piloten. Für die Wertung werden die jeweils 3 besten Flüge aller
        Teammitglider gewertet. Die 3 Flüge mit der geringsten Punktzahl
        innerhalb des Teams werden anschließend gestrichen und zählen nicht zur
        Gesamtwertung des Teams. Teams können auch während der aktiven Saison
        geformt werden. Falls ein Teammitglied bereits vor seiner aktiven
        Teilnahme an einem Team einen Flug eingereicht hat, so zählt dieser Flug
        nicht in der Teamwertung.
      </li>
      <li class="mb-3">
        <strong>Vereinswertung</strong><br />
        Alle teilnehmenden Vereine der aktiven XCCup Saison nehmen automatisch
        an der Vereinswertung teil. In die Gesamtwertung des Vereins, gehen
        jeweils die 3 besten Flüge jedes Vereinsmitgliedes ein. Es gilt die
        Vereinszugehörigkeit zum Zeitpunkt der Einreichung eines Fluges.
      </li>
      <li class="mb-3">
        <strong>Rheinland-Pfalz Pokal</strong><br />
        Gewertet werden die 3 besten Flüge die von in Rheinland-Pfalz gemeldeten
        Piloten von rheinland-pfälzischen Startplätzen aus geflogen wurden. Es
        zählt dabei die Einstellung des Bundeslandes im Profil des Piloten zum
        Zeitpunkt der Einreichung des jeweiligen Fluges.
      </li>
      <li class="mb-3">
        <strong>Preisgeld</strong><br />
        Das Gesamtpreisgeld "Gpg" wird nach folgendem Schlüssel ermittelt:
        Festbetrag pro Verein: 1,50 EURO für jedes Mitglied, welches dem DHV zum
        Stichtag 01.01. gemeldet wurde (wird von den Vereinen im Voraus bezahlt)
        vom Gpg werden die Werbungskosten (T-Shirts, Datenbank, Preisgelder
        etc.) bestritten
      </li>
      <li class="mb-3">
        <strong>Preise</strong><br />
        <ul>
          <li>
            75% vom verbleibenden Gpg (nach Abzug der Werbungskosten) an die
            Einzelwertungssieger der jeweiligen Klassen
          </li>
          <li>25% vom verbleibenden Gpg an die Sieger der Teamwertung</li>
          <li>
            Es werden Sachpreise, soweit vorhanden, an die jeweils Zweit- und
            Drittplazierten der Wertungen nach Geräteklassen vergeben
          </li>
        </ul>
      </li>
      <li class="mb-3">
        <strong>Meldungen/ Einreichung der Flüge</strong><br />
        Direkt in die Online Datenbank des XCCup.
      </li>
      <li class="mb-3">
        <strong>Dokumentation</strong><br />
        Innerhalb 2 Wochen nach Flugdatum.
      </li>
      <li class="mb-3">
        <strong>Wertung</strong><br />
        <p class="mb-3">
          Die Auswertung erfolgt automatisch nach Einreichen des Fluges und wird
          nicht nachbearbeitet. Dabei werden die Flüge in die drei Kategorien
          "Freie Strecke", "Flaches Dreieck" und "FAI Dreieck" mit jeweiligen
          Punkte-Faktoren unterteilt.
          <router-link to="/ausschreibung#factorPanel">
            <i class="bi bi-box-arrow-in-right"></i>
          </router-link>
        </p>
        <ul>
          <li class="mb-3">
            <strong> Freie Strecke: </strong>Optimierung der Strecke von
            Startplatz zu Landeplatz über 3 Wendepunkte.
          </li>
          <li class="mb-3">
            <strong>Flaches Dreieck:</strong> Ein Flug kann als Dreiecksflug
            gewertet werden, wenn die Entfernung zwischen Startplatz und
            Landeplatz weniger als 20% der durch die 3 Wendepunkte definierten
            Dreiecksstrecke beträgt. Als Wertungsstrecke gilt dann die
            Dreiecksstrecke um die drei Wendepunkte reduziert um den Abstand
            zwischen Startplatz und Landeplatz.
          </li>
          <li class="mb-3">
            <strong> FAI-Dreieck: </strong>Es gelten die Regeln eines
            Dreiecksflugs, zusätzlich muss es sich um ein FAI-Dreieck nach der
            Definition handeln, dass der kürzeste Schenkel mindestens 28% der
            Gesamtstrecke beträgt.
          </li>
        </ul>
      </li>
      <li class="mb-3">
        <strong>Sonderwertungen</strong><br />
        <p class="mb-3">
          Es werden 2 Sonderwertungen in der Saison geflogen und gewertet.
        </p>
        <ol>
          <li class="mb-3">
            <strong>Early Bird: </strong>Die ersten 20 gewerteten Flüge der
            Saison
          </li>
          <li>
            <strong>Letzte Flüge: </strong>Die letzen 20 gewerteten Flüge der
            Saison
          </li>
        </ol>
      </li>
      <li class="mb-3">
        <strong>Luftrechtliche Bestimmungen</strong><br />
        <p>
          Alle Flüge mit GPS Track werden bei der Einreichung automatisch auf
          Luftraumverletzungen (LRV) geprüft und der einreichende Pilot auf
          mögliche LRV hingewiesen. Ebenfalls wird eindringlich auf mögliche
          rechtliche Konsequenzen hingewiesen, sowie an einen sportlich fairen
          Wettkampf erinnert.
        </p>
        <p>
          Umfang der Prüfung: Flüge werden sowohl horizontal als auch vertikal
          auf mögliche LRV geprüft. Aus organisatorischen Gründen werden nur
          Flüge innerhalb Deutschlands und Luxemburg geprüft.
        </p>
        <p>
          Im Fall einer (evtl.) Luftraumverletzung hat der Pilot die Möglichkeit
          entsprechende Informationen in der Flugbeschreibung einzugeben um die
          Situation zu klären. Des weiteren wird der Pilot per E-Mail
          aufgefordert eine Stellungnahme zur möglichen LRV abzugegeben. Ein
          Flug mit möglichen LRV geht NICHT in die Wertung ein und bleibt bis
          auf Weiteres unsichtbar. Hat der Pilot die Einhaltung aller Auflagen
          bestätigt und eine schlüssige Erklärung geliefert, wird der Flug ohne
          weitere Prüfung in die Wertung übernommen. Flüge werden nach einem
          regelgerechten Einspruch überprüft und ggf. aus der Wertung genommen.
          Der XCCup behält sich vor, Flüge die eine Luftraumverletzung
          beinhalten, nicht in die Wertung zu nehmen.
        </p>
      </li>
      <li class="mb-3">
        <strong>Haftungsausschluss</strong><br />
        Jeder Teilnehmer nimmt auf eigene Gefahr an diesem Wettbewerb teil.
        Ansprüche gegenüber dem Veranstalter, dem Ausrichter, dem Organisator,
        dem Wettbewerbsleiter sowie deren Helfer wegen einfacher Fahrlässigkeit
        sind ausgeschlossen.
      </li>
    </ol>
    <p>Das XCCup Komitee 01.01.2022</p>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();

function anchorHashCheck(element) {
  console.log("Anchor hash check");

  const newLocal = route.hash.slice(1);
  console.log("FUC HASH: ", newLocal);
  console.log("FUC element: ", element);
  // if (window.location.hash === route.hash) {
  const el = document.getElementById(element);

  console.log("FUC EL: ", el);

  if (el) {
    console.log("FUC EL TOP: ", el.offsetTop);
    window.scroll(0, el.offsetTop);
  }
  // }
}
</script>
