<script setup lang="ts">
import ApiService from "@/services/ApiService";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";

const route = useRoute();
const results = ref<any>(null);
const remark = ref<string | null>(null);

setWindowName("Teamwertung");

try {
  const res = await ApiService.getResultsTeams({ ...route.params });
  if (res.status != 200) throw res.status;
  results.value = res.data;
  // @ts-ignore
  remark.value = results?.value?.constants?.REMARKS;
} catch (error: any) {
  if (error?.response?.status === 422) {
    // TODO: Is there a smarter way?
    results.value = { values: [], noDataFlag: true };
  }
}
</script>

<!-- Neceessary for <keep-alive> -->
<script lang="ts">
export default {
  name: "ResultsTeams",
  inheritAttrs: false,
  customOptions: {},
};
</script>

<template>
  <div class="container-lg">
    <div v-if="results">
      <h3 v-once>Teamwertung {{ route.params.year }}</h3>
      <p v-if="remark">Hinweis: {{ remark }}</p>
      <div class="my-2"><SelectSeason /></div>
      <ResultsTableTeams :results="results" />
    </div>
    <GenericError v-else />
  </div>
</template>
