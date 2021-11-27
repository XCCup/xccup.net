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
              :id="index"
              v-model="checkedFlights"
              class="form-check-input"
              type="checkbox"
              :value="airbuddy.id"
            />
            <label class="form-check-label" :for="index">
              <span
                class="badge"
                :style="{ backgroundColor: trackColors[index + 1] }"
              >
                {{ airbuddy.user.firstName + " " + airbuddy.user.lastName }}
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

<script setup>
import trackColors from "@/assets/js/trackColors";
import useFlight from "@/composables/useFlight";
import useAirbuddy from "@/composables/useAirbuddies";

import { ref, watchEffect } from "vue";

const { flight } = useFlight();
const { fetchAll, airbuddiesFlightData, updateCheckedAirbuddies } =
  useAirbuddy();

const checkedFlights = ref([]);
const loaded = ref(false);

watchEffect(() => updateCheckedAirbuddies(checkedFlights.value));

// watch: {
//   checkedFlights() {
//     let airbuddyTracks = [];
//     this.buddyFlights.forEach((element) => {
//       airbuddyTracks.push({
//         buddyName: element.user.firstName,
//         buddyFlightId: element.id,
//         isActive: this.checkedFlights.includes(element.id),
//         fixes: element.fixes,
//       });
//     });
//     this.$emit("updateAirbuddies", airbuddyTracks);
//   },
// },
// methods: {
const onShowAirbuddies = async () => {
  try {
    await fetchAll(flight.value.airbuddies);
    loaded.value = true;
  } catch (error) {
    console.log(error);
  }
};
//   },
//   routeToFlight(flightId) {
//     this.$router.push({
//       name: "Flight",
//       params: {
//         flightId: flightId,
//       },
//     });
//   },
// },
</script>
