<template>
  <h4>Faktoren</h4>
  <!-- {{ Object.entries(seasonDetails.gliderClasses) }} -->

  <table class="table">
    <thead>
      <tr>
        <th></th>
        <th>Faktoren</th>
        <th colspan="3">Zielflug/JOJO</th>
        <th colspan="3">Dreieck</th>
        <th colspan="3">FAI-Dreieck</th>
      </tr>
      <tr>
        <th></th>
        <th></th>
        <th></th>
        <th>Gesamt</th>
        <th>min. km</th>
        <th></th>
        <th>Gesamt</th>
        <th>min. km</th>
        <th></th>
        <th>Gesamt</th>
        <th>min. km</th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="[key, value] in Object.entries(gliderClasses)" :key="key">
        <td>
          <RankingClass
            :ranking-class="{ ...value, key }"
            :show-description="true"
          />
        </td>
        <td>{{ value.scoringMultiplicator }}</td>
        <td>{{ flightTypeFactors.FREE }}</td>
        <td>
          {{ round(value.scoringMultiplicator * flightTypeFactors?.FREE, 2) }}
        </td>
        <td>
          {{ minDistance(value.scoringMultiplicator, flightTypeFactors?.FREE) }}
        </td>
        <td>{{ flightTypeFactors.FLAT }}</td>
        <td>
          {{ round(value.scoringMultiplicator * flightTypeFactors?.FLAT, 2) }}
        </td>
        <td>
          {{ minDistance(value.scoringMultiplicator, flightTypeFactors?.FLAT) }}
        </td>
        <td>{{ flightTypeFactors.FAI }}</td>
        <td>
          {{ round(value.scoringMultiplicator * flightTypeFactors?.FAI, 2) }}
        </td>
        <td>
          {{ minDistance(value.scoringMultiplicator, flightTypeFactors?.FAI) }}
        </td>
      </tr>
    </tbody>

    <tfoot>
      <tr>
        <td colspan="2">Mindestpunkte: {{ pointThresholdForFlight }}</td>
      </tr>
    </tfoot>
  </table>

  <b><u>Faktoren Aufgaben:</u></b>

  <br /><br />
  <table>
    <tbody>
      <tr>
        <td></td>
        <td><b>Freie Strecke (Zielflug)</b></td>
      </tr>
      <tr>
        <td></td>
        <td>
          OHNE GPS-Track wird nur die einfache Entfernung zwischen angegebenem
          Start und Landeplatz gewertet, keine Wegpunkte (online Einreichung per
          Formular).
        </td>
      </tr>

      <tr>
        <td colspan="2"></td>
      </tr>

      <tr>
        <td></td>
        <td><b>Freie Strecke (JOJO)</b></td>
      </tr>
      <tr>
        <td></td>
        <td>
          MIT GPS-Track wird die Auswertung unter Berücksichtigung von
          Wegpunkten optimiert (JOJO Wertung) - Die Auswertung erfolgt
          automatisch nach Einreichen des Fluges und wird nicht nachbearbeitet.
        </td>
      </tr>

      <tr>
        <td colspan="2"></td>
      </tr>

      <tr>
        <td></td>
        <td><b>Geschlossenes Dreieck</b></td>
      </tr>
      <tr>
        <td></td>
        <td>
          Ein Flug kann als Dreiecksflug gewertet werden, wenn die Entfernung
          zwischen Abflugpunkt und Endpunkt weniger als 20 % der durch die drei
          Wegpunkte definierten Dreiecksstrecke beträgt. Als Wertungsstrecke
          gilt dann die Dreiecksstrecke um die drei Wegpunkte reduziert um den
          Abstand zwischen Abflugpunkt und Endpunkt.
        </td>
      </tr>

      <tr>
        <td colspan="2"></td>
      </tr>

      <tr>
        <td></td>
        <td><b>FAI-Dreieck</b></td>
      </tr>
      <tr>
        <td></td>
        <td>
          Es gelten die Regeln eines Dreiecksflugs, zusätzlich muss es sich um
          ein FAI-Dreieck nach der Definition handeln, dass der kürzeste
          Schenkel mindestens 28 % der Gesamtstrecke beträgt.
        </td>
      </tr>

      <tr>
        <td colspan="2"></td>
      </tr>

      <tr>
        <td colspan="2">
          <b><u>Mindestpunktzahl:</u></b>
        </td>
      </tr>
      <tr>
        <td></td>
        <td>
          Die Mindestpunktzahl wird für 2021 auf
          <b>60 Punkte</b> gesetzt.
        </td>
      </tr>

      <tr>
        <td colspan="2"></td>
      </tr>

      <tr>
        <td colspan="2">
          <b><u>Hinweise:</u></b>
        </td>
      </tr>
      <tr>
        <td></td>
        <td>
          F-Schlepp: Schlepphöhe darf 1000m und 5km Radius vom Flugfeld nicht
          überschreiten.
        </td>
      </tr>
    </tbody>
  </table>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { round } from "lodash-es";
const router = useRouter();
const gliderClasses = ref(null);
const flightTypeFactors = ref(null);
const pointThresholdForFlight = ref(null);

try {
  gliderClasses;
  const { data: initialData } = await ApiService.getInitialData();
  gliderClasses.value = initialData.seasonDetails.gliderClasses;
  flightTypeFactors.value = initialData.seasonDetails.flightTypeFactors;
  pointThresholdForFlight.value =
    initialData.seasonDetails.pointThresholdForFlight;
} catch (error) {
  console.log(error);
  router.push({
    name: "NetworkError",
  });
}

const minDistance = (multiplicator, factor) => {
  if (!multiplicator || !factor) return;
  return round(pointThresholdForFlight.value / (multiplicator * factor), 2);
};
</script>
