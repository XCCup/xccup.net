<template>
  <div
    id="flight-subnav"
    class="container-fluid flight-info text-light mb-0 p-1"
  >
    <p class="m-0">
      <a href="#" @click="$router.go(-1)"
        ><i class="bi bi-chevron-left mx-2"></i
      ></a>
      Flug von
      <router-link
        :to="{
          name: 'FlightsAll',
          query: { userId: flight.user.id },
        }"
      >
        {{ flight.user.firstName + " " + flight.user.lastName }}
      </router-link>
      am
      <router-link
        :to="{
          name: 'FlightsAll',
          query: {
            startDate: retrieveDateOnly(flight.takeoffTime),
            endDate: dayAfter(flight.takeoffTime),
          },
        }"
      >
        <BaseDate :timestamp="flight.takeoffTime" />
      </router-link>
    </p>
  </div>
</template>

<script setup>
import useFlight from "@/composables/useFlight";
import { retrieveDateOnly, dayAfter } from "../helper/utils";
const { flight } = useFlight();
</script>

<style scoped></style>
