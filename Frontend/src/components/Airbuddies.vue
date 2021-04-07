<template>
  <!-- Airbuddy Checkboxes -->
  <div class="container">
    <div class="airbuddies mt-2">
      <button
        class="btn btn-primary btn-sm dropdown-toggle"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseAirbuddies"
        @click="getFlights"
      >
        Airbuddies
      </button>

      <div class="collapse mt-1" id="collapseAirbuddies">
        <!-- Spinner -->
        <div
          class="spinner-border text-primary m-2"
          v-if="!loaded"
          role="status"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
        <!-- Checkboxes -->
        <div
          class="form-check form-check-inline"
          v-for="(pilot, index) in this.buddyFlights"
          :key="pilot.buddyFlightId"
        >
          <h5 class="ms-2">
            <input
              class="form-check-input"
              type="checkbox"
              :value="pilot.buddyFlightId"
              :id="index"
              v-model="checkedFlights"
            />
            <label class="form-check-label" :for="index">
              <span
                class="badge"
                :style="{ backgroundColor: this.trackColors[index + 1] }"
              >
                {{ pilot.buddyName }}
              </span>
            </label>
          </h5>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import trackColors from "@/assets/js/trackColors";
import FlightService from "@/services/FlightService";

export default {
  name: "Airbuddies",
  data() {
    return {
      checkedFlights: [],
      buddyFlights: null,
      trackColors: trackColors,
      loaded: false,
    };
  },
  props: {
    flight: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async getFlights() {
      try {
        if (!this.buddyFlights && this.flight.airbuddies.length > 0) {
          // await new Promise((resolve) => setTimeout(resolve, 2000));
          let response = await FlightService.getAirbuddies(this.flight._id);
          this.buddyFlights = response.data;
          this.loaded = true;
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
  watch: {
    checkedFlights() {
      let airbuddyTracks = [];
      this.buddyFlights.forEach((element) => {
        airbuddyTracks.push({
          buddyName: element.buddyName,
          buddyFlightId: element.buddyFlightId,
          isActive: this.checkedFlights.includes(element.buddyFlightId),
          fixes: element.fixes,
        });
      });
      this.$emit("updateAirbuddies", airbuddyTracks);
    },
  },
  emits: ["updateAirbuddies"],
};
</script>

>
