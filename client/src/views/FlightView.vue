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
import { useRouter, useRoute } from "vue-router";
import { getXccupTimezone, setWindowName } from "../helper/utils";
import useFlight from "@/composables/useFlight";
import useFlightCursor from "@/composables/useFlightCursor";
import { formatFlightDuration } from "@/helper/formatFlightDuration";
import { formatInTimeZone } from "date-fns-tz";
import { addMetaTag } from "@/helper/addHtmlMetaTag";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const { fetchOne, flight } = useFlight();
const { resetCursor } = useFlightCursor();

resetCursor();

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

</script>
