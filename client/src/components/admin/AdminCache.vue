<template>
  <div id="adminCachePanel" class="container py-3">
    <div class="col-6 col">
      <div>
        <h5>Cache bereinigen</h5>
        <BaseInput
          v-model="keyValue"
          class="mt-3"
          label="Keyfragment"
          @focus="keyValue = ''"
        />
        <button
          class="btn btn-outline-danger btn-sm bi bi-trash"
          :disabled="!keyValue.length || keyValue == promptText"
          @click="onClear"
        >
          Cache leeren
        </button>
      </div>
      <hr />
      <div>
        <h5>Cache Statistik</h5>
        <button
          class="btn btn-outline-primary btn-sm bi bi-list-columns mb-3"
          @click="onGetStats"
        >
          Statistik anfordern
        </button>
        <div v-if="Object.entries(stats).length">
          <p>Generelle Daten</p>
          <ul class="list-group list-group-flush mb-3">
            <li v-for="(v, k) in stats" :key="k" class="list-group-item">
              {{ k }} {{ v }}
            </li>
          </ul>
        </div>
        <div v-if="listedKeys.length">
          <p>Vorhandene Keys</p>
          <ul class="list-group list-group-flush">
            <li v-for="(v, k) in listedKeys" :key="k" class="list-group-item">
              {{ v }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import useSwal from "../../composables/useSwal";
import ApiService from "../../services/ApiService";

const { showSuccessAlert, showFailedToast } = useSwal();

const promptText = 'z.B. "home" oder "all" für den gesamten Cache';
const keyValue = ref(promptText);
const stats = ref({});
const listedKeys = ref([]);

const onClear = async () => {
  try {
    const res = await ApiService.deleteCache(keyValue.value);
    const numberOfDeleteKeys = res.data;
    keyValue.value = promptText;
    showSuccessAlert(`Es wurden ${numberOfDeleteKeys} Keys gelöscht`);
  } catch (error) {
    console.error(error);
    showFailedToast("Da ist leider was schief gelaufen");
  }
};

const onGetStats = async () => {
  try {
    const res = await ApiService.getCacheStats();
    stats.value = res.data.stats;
    listedKeys.value = res.data.keys;
  } catch (error) {
    console.error(error);
  }
};
</script>
