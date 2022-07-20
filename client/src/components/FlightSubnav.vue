<template>
  <div id="flight-subnav" class="container-fluid custom text-light mb-0 p-1">
    <p class="m-0">
      <a href="#" class="link-light" @click.prevent="$router.go(-1)"
        ><i class="bi bi-chevron-left mx-2"></i
      ></a>
      Flug von
      <router-link
        :to="{
          name: 'FlightsAll',
          query: { userId: flight?.user?.id },
        }"
        class="link-light"
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
        class="link-light"
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

<style lang="scss" scoped>
.custom {
  background-color: darken($primary, 5%);
}
</style>
