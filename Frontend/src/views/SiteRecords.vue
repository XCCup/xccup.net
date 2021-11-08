<template>
  <section class="pb-3">
    <div class="container-fluid">
      <h3>Flugebietsrekorde</h3>
      <div v-if="results.length > 0" class="table-responsive">
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Startplatz</th>
            <th>
              Freiestrecke
              <FlightTypeIcon :flightType="'FREE'" />
            </th>
            <th>
              Flaches Dreieck
              <FlightTypeIcon :flightType="'FLAT'" />
            </th>
            <th>
              FAI Dreieck
              <FlightTypeIcon :flightType="'FAI'" />
            </th>
          </thead>
          <tbody>
            <tr v-for="(result, index) in results" v-bind:key="result.takeoff.id">
              <td>{{ result.takeoff.name }}</td>
              <td>
                <SiteRecord :record="result.free" />
              </td>
              <td>
                <SiteRecord :record="result.flat" />
              </td>
              <td>
                <SiteRecord :record="result.fai" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- TODO: Handle this more elegant -->
      <div v-if="!results">Fehler beim laden 🤯</div>
      <div v-if="results?.length === 0">Keine Flüge gemeldet in diesem Jahr</div>
    </div>
  </section>
</template>

<script setup>

import { ref } from "vue";
import ApiService from "@/services/ApiService";

const responseData = (await ApiService.getResults("siteRecords")).data;
const results = ref(responseData)

</script>
<style scoped>
</style>
