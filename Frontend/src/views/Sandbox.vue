<template>
  <div class="container">
    <h3>Sandbox</h3>
    {{ flight }}
  </div>
</template>

<script>
// !!! Note to my future self !!!
// The connection between Airbuddies, Barogramm and Map needs refactoring.
// It's to ineffective and you can do better now.

import { ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import FlightService from "@/services/FlightService.js";
import MapV2 from "@/components/MapV2";
import Airbuddies from "@/components/Airbuddies";
import Barogramm from "@/components/Barogramm.vue";
import trackColors from "@/assets/js/trackColors";
import InlineAlert from "@/components/InlineAlert";
import FlightDetails from "@/components/FlightDetails";
import Comments from "@/components/Comments";
import FlightDescription from "@/components/FlightDescription";

export default {
  name: "FlightView",
  components: {},
  async setup(props) {
    const flight = ref(null);
    const router = useRouter();
    const route = useRoute();
    // const loading = ref(false)

    // To simulate longer loading times
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Is this try/catch smart?
    try {
      // Hardcoded flight for development
      let demoFlightId = "60699294a7c2069af1246316";
      const response = await FlightService.getFlight(
        // demoFlightId
        route.params.flightId
        // props.flightId
      );
      flight.value = response.data;
    } catch (error) {
      console.log(error);
      if (error.response && error.response.status == 404) {
        router.push({
          name: "404Resource",
          params: { resource: "Flug" },
        });
      } else {
        router.push({ name: "NetworkError" });
      }
    }
    return {
      flight,
    };
  },
  props: {
    flightId: { type: String },
  },
  data() {
    return {
      buddyTracks: null,
      baroDataUpdated: 0,
      pilot: { club: "Good Club", team: "Die sympathischen Speeditöre" },
    };
  },
  methods: {},
  watch: {},
};
</script>
