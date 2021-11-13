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
          v-for="(airbuddy, index) in buddyFlights"
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

<script>
import trackColors from "@/assets/js/trackColors";
import ApiService from "@/services/ApiService";

export default {
  name: "FlightAirbuddies",
  props: {
    flight: {
      type: Object,
      required: true,
    },
  },
  emits: ["updateAirbuddies"],
  data() {
    return {
      checkedFlights: [],
      buddyFlights: [],
      trackColors: trackColors,
      loaded: false,
    };
  },
  watch: {
    checkedFlights() {
      let airbuddyTracks = [];
      this.buddyFlights.forEach((element) => {
        airbuddyTracks.push({
          buddyName: element.user.firstName,
          buddyFlightId: element.id,
          isActive: this.checkedFlights.includes(element.id),
          fixes: element.fixes,
        });
      });
      this.$emit("updateAirbuddies", airbuddyTracks);
    },
  },
  methods: {
    async getFlights() {
      try {
        if (
          this.buddyFlights.length === 0 &&
          this.flight.airbuddies.length > 0
        ) {
          this.flight.airbuddies.forEach(async (buddy) => {
            let response = await ApiService.getFlight(buddy.externalId);
            this.buddyFlights.push(response.data);
          });
          // await new Promise((resolve) => setTimeout(resolve, 2000));
          // let response = await ApiService.getAirbuddies(this.flight._id);
          // this.buddyFlights = response.data;
          this.loaded = true;
        }
      } catch (error) {
        console.log(error);
      }
    },
    routeToFlight(flightId) {
      this.$router.push({
        name: "Flight",
        params: {
          flightId: flightId,
        },
      });
    },
  },
};
</script>
