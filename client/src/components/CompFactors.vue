<template>
  <h4>Faktoren</h4>
  <div class="table-responsive">
    <table class="table">
      <thead>
        <tr>
          <th rowspan="2">Geräteklasse</th>
          <th colspan="2">Freie Strecke</th>
          <th colspan="2">Flaches Dreieck</th>
          <th colspan="2">FAI Dreieck</th>
        </tr>
        <tr>
          <th>Faktor</th>
          <th>min. km</th>
          <th>Faktor</th>
          <th>min. km</th>
          <th>Faktor</th>
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
          <td>
            {{
              round(
                value.scoringMultiplicator?.BASE *
                  value.scoringMultiplicator?.FREE,
                2
              )
            }}
          </td>
          <td>
            {{
              minDistance(
                value.scoringMultiplicator?.BASE,
                value.scoringMultiplicator?.FREE
              )
            }}
          </td>
          <td>
            {{
              round(
                value.scoringMultiplicator?.BASE *
                  value.scoringMultiplicator?.FLAT,
                2
              )
            }}
          </td>
          <td>
            {{
              minDistance(
                value.scoringMultiplicator?.BASE,
                value.scoringMultiplicator?.FLAT
              )
            }}
          </td>
          <td>
            {{
              round(
                value.scoringMultiplicator?.BASE *
                  value.scoringMultiplicator?.FAI,
                2
              )
            }}
          </td>
          <td>
            {{
              minDistance(
                value.scoringMultiplicator?.BASE,
                value.scoringMultiplicator?.FAI
              )
            }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
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
