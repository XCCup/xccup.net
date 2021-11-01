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
          v-for="(airbuddy, index) in this.buddyFlights"
          :key="airbuddy.id"
        >
          <h5 class="ms-2">
            <input
              class="form-check-input"
              type="checkbox"
              :value="airbuddy.id"
              :id="index"
              v-model="checkedFlights"
            />
            <label class="form-check-label" :for="index">
              <span
                class="badge"
                :style="{ backgroundColor: this.trackColors[index + 1] }"
              >
                {{ airbuddy.User.firstName + " " + airbuddy.User.lastName }}
                <!-- TODO: This will not fetch the API again. 
                Fix this when you have a better understanding of the Composition API -->
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
  name: "Airbuddies",
  data() {
    return {
      checkedFlights: [],
      buddyFlights: [],
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
  watch: {
    checkedFlights() {
      let airbuddyTracks = [];
      this.buddyFlights.forEach((element) => {
        airbuddyTracks.push({
          buddyName: element.User.firstName,
          buddyFlightId: element.id,
          isActive: this.checkedFlights.includes(element.id),
          fixes: element.fixes,
        });
      });
      this.$emit("updateAirbuddies", airbuddyTracks);
    },
  },
  emits: ["updateAirbuddies"],
};
</script>
