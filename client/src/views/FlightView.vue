<template>
  <div v-if="flight">
    <FlightSubnav />
    <FlightMap />
    <FlightBarogramm />
    <FlightAirbuddies v-if="flight.airbuddies?.length" />
    <FlightDetails />
    <FlightReport />
    <FlightPhotos :photos="flight.photos" />
    <Comments />
  </div>
</template>

<script setup lang="ts">
// TODO: Note to my future self:
// The connection between Airbuddies, FlightBarogramm and Map needs refactoring.
// It's to ineffective and you can do better now.

import { ref, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { getXccupTimezone, setWindowName } from "../helper/utils";
import useFlight from "@/composables/useFlight";
import useAirbuddies from "@/composables/useAirbuddies";
import { formatFlightDuration } from "@/helper/formatFlightDuration";
import { formatInTimeZone } from "date-fns-tz";
import { addMetaTag } from "@/helper/addHtmlMetaTag";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const { fetchOne, flight } = useFlight();

try {
  // @ts-ignore
  // TODO: Evaluate array issue
  await fetchOne(route.params.flightId);
  setWindowName(
    "Flug von " +
      flight.value?.user?.firstName +
      " " +
      flight.value?.user?.lastName
  );
  // Set meta tags
  addMetaTag(
    "og:description",
    `📍 ${flight.value?.takeoff?.name} ⏱ ${formatFlightDuration(
      flight.value?.airtime
    )} 🌪 ø ${flight.value?.flightStats.taskSpeed} km/h`
  );

  const formattedDate = formatInTimeZone(
    flight.value?.takeoffTime ?? "",
    getXccupTimezone(),
    "dd.MM.yyyy"
  );

  addMetaTag(
    "og:title",
    `${flight.value?.user.firstName} ${
      flight.value?.user.lastName
    } • ${formattedDate} • ${flightTypeToString(flight.value?.flightType)}${
      flight.value?.flightDistance
    } km`
  );
} catch (error) {
  if (axios.isAxiosError(error) && error.response?.status == 404) {
    router.push({
      name: "404Resource",
      params: { resource: "Dieser Flug existiert nicht." },
    });
  } else {
    router.push({ name: "NetworkError" });
  }
}

function flightTypeToString(flightType: string | undefined) {
  if (flightType === "FAI") return "△ ";
  if (flightType === "FLAT") return "▻ ";
  if (flightType === "FREE") return "⎯ ";
  return "";
}

// TODO: This is a workaround to trigger a re-render of the barogramm.
// One day i will find out how to do this from the baro component itself…
const { checkedAirbuddyFlightIds } = useAirbuddies();
const baroDataUpdated = ref(0);
watch(checkedAirbuddyFlightIds, () => baroDataUpdated.value++);
</script>
