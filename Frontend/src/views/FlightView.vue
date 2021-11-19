<template>
  <div v-if="flight">
    <FlightSubnav />
    <FlightMap />
    <FlightBarogramm :key="baroDataUpdated" />
    <FlightAirbuddies v-if="flight.airbuddies.length > 0" />
    <FlightDetails />
    <FlightReport />
    <Comments />
  </div>
</template>

<script setup>
// TODO: Note to my future self:
// The connection between Airbuddies, FlightBarogramm and Map needs refactoring.
// It's to ineffective and you can do better now.

import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { setWindowName } from "../helper/utils";
import useFlight from "@/composables/useFlight";

const route = useRoute();
const router = useRouter();
const { fetchOne, flight } = useFlight();

try {
  await fetchOne(route.params.flightId);
  setWindowName(
    "Flug von " + flight.value.user.firstName + " " + flight.value.user.lastName
  );
} catch (error) {
  if (error.response?.status == 404) {
    router.push({
      name: "404Resource",
      params: { resource: "Dieser Flug existiert nicht." },
    });
  } else {
    router.push({ name: "NetworkError" });
  }
}

// TODO: This is a workaround to trigger a re-render of the barogramm.
// One day i will find out how to do this from the baro component itself…
import useAirbuddies from "@/composables/useAirbuddies";
const { checkedAirbuddFlightIds } = useAirbuddies();
const baroDataUpdated = ref(0);
watch(checkedAirbuddFlightIds, () => baroDataUpdated.value++);
</script>
