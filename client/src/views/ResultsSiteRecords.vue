<template>
  <div v-if="results" class="container-lg">
    <h3>Flugebietsrekorde</h3>
    <div class="table-responsive">
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
  </div>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";

const results = ref(null);

setWindowName("Fluggebietsrekorde");

try {
  const res = await ApiService.getResultsSiteRecords();
  if (res.status != 200) throw res.status.text;
  results.value = res.data;
} catch (error) {
  console.log(error);
}
</script>
