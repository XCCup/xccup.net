<template>
  <section class="pb-3">
    <div class="container-fluid">
      <div v-if="results.length > 0" class="table-responsive">
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Startplatz</th>
            <th>
              Freiestrecke
              <FlightTypeIcon flight-type="FREE" />
            </th>
            <th>
              <!-- TODO: Why is this not rendering -->
              Flaches Dreieck
              <FlightTypeIcon flight-type="FLAT" />
            </th>
            <th>
              FAI Dreieck
              <FlightTypeIcon flight-type="FAI" />
            </th>
          </thead>
          <tbody>
            <tr v-for="result in results" :key="result.takeoff.id">
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
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";

// TODO: Error handling
const responseData = (await ApiService.getResults("siteRecords")).data;

const results = ref(responseData);
</script>
