<template>
  <div v-if="sites" class="container-lg">
    <h3>Fluggebietsübersicht</h3>
    <p>
      Du vermisst ein Gelände? Dann mache uns einen Vorschlag mit einem
      offiziellen Quellenverweis.
    </p>
    <button type="button" class="col btn btn-primary btn-sm me-1 mb-3">
      Fluggebiet vorschlagen
      <i class="bi bi-binoculars"></i>
    </button>
    <FlyingSiteMap :sites="sites" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";
import FlyingSiteMap from "../components/FlyingSiteMap.vue";

const sites = ref([]);

setWindowName("Fluggebietsübersicht");

try {
  const res = await ApiService.getSites();
  if (res.status != 200) throw res.status.text;
  sites.value = res.data;
} catch (error) {
  console.error(error);
}
</script>
