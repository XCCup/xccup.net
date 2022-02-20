0
<template>
  <div class="container">
    <div
      v-if="flight.airspaceComment"
      class="row mt-4"
      data-cy="airspace-comment"
    >
      <h4>Luftraumkommentar</h4>
      <p class="allow-white-spaces">
        {{ flight.airspaceComment }}
      </p>
    </div>
    <div v-if="flight.report" class="row mt-4" data-cy="flight-report">
      <h3>Flugbericht</h3>
      <!-- eslint-disable-next-line vue/no-v-html -> Will be sanitzed in function activateHtmlLinks -->
      <p class="allow-white-spaces" v-html="reportWithLinks"></p>
    </div>
  </div>
</template>

<script setup>
import useFlight from "@/composables/useFlight";
import { computed } from "vue";
import { activateHtmlLinks } from "../helper/utils";
const { flight } = useFlight();
const reportWithLinks = computed(() => activateHtmlLinks(flight.value.report));
</script>

<style scoped></style>
