<template>
  <section class="pb-3">
    <div class="container-fluid">
      <h3>Flugebietsrekorde</h3>
      <div v-if="results.length > 0" class="table-responsive">
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Startplatz</th>
            <th>Freie Strecke</th>
            <th>Flaches Dreieck</th>
            <th>FAI Dreieck</th>
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
import { setWindowName } from "../helper/utils";

// TODO: Error handling
const responseData = (await ApiService.getResults("siteRecords")).data;

setWindowName("Fluggebietsrekorde");

const results = ref(responseData);
</script>
