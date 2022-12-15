<template>
  <div v-if="sites" class="container-lg">
    <h3>Fluggebietsübersicht</h3>
    <p>
      Der XCCup ist ein mitteldeutscher Flachland Wettbewerb. Flüge können dabei
      nur von registrierten Startplätzen eingereicht werden.
    </p>
    <p>
      Startplätze können von allen im XCCup gemeldeten Personen vorgeschlagen
      werden. Diese müssen dabei in einem örtlichen Zusammenhang zum bereits
      bestehendem XCCup Gebiet stehen.
    </p>
    <p>
      Die Vorschläge werden durch die Organisatoren des XCCup bewertet und ggfs.
      freigeschaltet.
    </p>
    <router-link
      :to="{
        name: 'SubmitFlyingSite',
      }"
      class="btn btn-primary btn-sm me-1 mb-3"
    >
      Neues Fluggebiet vorschlagen <i class="bi bi-send-plus"></i
    ></router-link>
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
