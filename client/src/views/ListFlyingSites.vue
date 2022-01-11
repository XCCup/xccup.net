<template>
  <div v-if="sites" class="container-lg">
    <h3>Fluggebietsübersicht</h3>
    <p>
      Du vermisst ein Gelände? Dann mache uns
      <router-link
        :to="{
          name: 'SubmitFlyingSite',
        }"
      >
        Hier </router-link
      >einen Vorschlag.
    </p>
    <FlyingSiteMap :sites="sites" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";

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
