<template>
  <div class="container-fluid flight-info text-light mb-0 p-1">
    <p class="m-0">
      <a href="#" @click="$router.go(-1)"
        ><i class="bi bi-chevron-left mx-2"></i
      ></a>
      Flug von
      <a href="#">{{ flight.user.firstName + " " + flight.user.lastName }}</a>
      am
      <a href="#"><BaseDate :timestamp="flight.takeoffTime" /></a>
    </p>
  </div>
</template>

<script setup>
import useFlight from "@/composables/useFlight";
const { flight } = useFlight();
</script>

<style></style>
