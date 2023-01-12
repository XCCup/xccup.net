<template>
  <div
    id="flight-subnav"
    class="container-fluid bg-flight-subnav text-light mb-0 p-1"
  >
    <p class="m-0">
      <a href="#" @click.prevent="$router.go(-1)"
        ><i class="bi bi-chevron-left mx-2 link-secondary"></i
      ></a>
      Flug von
      <router-link
        :to="{
          name: 'FlightsAll',
          query: { userId: flight?.user?.id },
        }"
        class="link-secondary"
      >
        {{ flight?.user?.fullName }}
      </router-link>
      am
      <router-link
        :to="{
          name: 'FlightsAll',
          query: {
            startDate: retrieveDateOnly(flight?.takeoffTime),
            endDate: dayAfter(flight?.takeoffTime),
          },
        }"
        class="link-secondary"
      >
        <BaseDate :timestamp="flight?.takeoffTime" />
      </router-link>
    </p>
  </div>
</template>

<script setup lang="ts">
import useFlight from "@/composables/useFlight";
import { retrieveDateOnly, dayAfter } from "../helper/utils";
const { flight } = useFlight();
</script>
