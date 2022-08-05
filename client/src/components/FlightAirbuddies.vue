<script setup lang="ts">
import { TRACK_COLORS } from "@/common/Constants";
import useFlight from "@/composables/useFlight";
import useAirbuddy from "@/composables/useAirbuddies";

import { ref, watchEffect } from "vue";

const { flight } = useFlight();
const { fetchAll, airbuddiesFlightData, updateCheckedAirbuddies } =
  useAirbuddy();

const checkedFlights = ref<string[]>([]);
const loaded = ref(false);

const trackColors = TRACK_COLORS;

watchEffect(() => updateCheckedAirbuddies(checkedFlights.value));

const onShowAirbuddies = async () => {
  try {
    if (!flight.value?.airbuddies) return;
    // @ts-ignore TODO: readonly refs…
    await fetchAll(flight.value.airbuddies);
    loaded.value = true;
  } catch (error) {
    console.log(error);
  }
};

// @ts-ignore
function calculatePercentage(airbuddy) {
  if (!airbuddy?.percentage || typeof airbuddy.percentage != "number")
    return "";

  return Math.round(airbuddy.percentage) + "%";
}
</script>

<template>
  <!-- Airbuddy Checkboxes -->
  <div id="flight-airbuddies" class="container">
    <div class="airbuddies mt-2">
      <button
        class="btn btn-primary btn-sm dropdown-toggle"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseAirbuddies"
        @click="onShowAirbuddies"
      >
        Airbuddies
      </button>

      <div id="collapseAirbuddies" class="collapse mt-1">
        <!-- Spinner -->
        <div
          v-if="!loaded"
          class="spinner-border text-primary m-2"
          role="status"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
        <!-- Checkboxes -->
        <div
          v-for="(airbuddy, index) in airbuddiesFlightData"
          :key="airbuddy.id"
          class="form-check form-check-inline"
        >
          <h5 class="ms-2">
            <input
              :id="index.toString()"
              v-model="checkedFlights"
              class="form-check-input"
              type="checkbox"
              :value="airbuddy.id"
            />
            <label class="form-check-label" :for="index.toString()">
              <span
                class="badge"
                :style="{ backgroundColor: trackColors[index + 1] }"
              >
                {{ airbuddy.user.fullName }}
                {{ calculatePercentage(airbuddy) }}
                <router-link
                  :to="{
                    name: 'Flight',
                    params: { flightId: airbuddy.externalId },
                  }"
                >
                  <i class="bi bi-box-arrow-in-right text-light"></i>
                </router-link>
              </span>
            </label>
          </h5>
        </div>
      </div>
    </div>
  </div>
</template>
