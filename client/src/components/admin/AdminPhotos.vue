<script setup lang="ts">
import { getbaseURL } from "@/helper/baseUrlHelper";
import ApiService from "@/services/ApiService";
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const year = ref(new Date().getFullYear());
const showSpinner = ref(false);
const archivPath = ref("");

const onCreate = async () => {
  try {
    showSpinner.value = true;
    const response = await ApiService.createPhotoArchivOfYear(year.value);
    archivPath.value = response.data;
  } catch (error) {
    console.log(error);
    router.push({
      name: "NetworkError",
    });
  } finally {
    showSpinner.value = false;
  }
};

const yearValidationResult = computed(
  () => year.value.toString().match(/^\d{4}$/) == null
);

// Reset archive path and therefore enable create button again
watch(year, () => {
  archivPath.value = "";
});

const archivDownloadUrl = computed(() => {
  const baseURL = getbaseURL();
  const escapedPath = archivPath.value.replaceAll("/", "%2F");
  return baseURL + "flights/photos/download/" + escapedPath;
});
</script>

<template>
  <div id="adminPhotoDownloadPanel" class="py-3">
    <button
      class="col-2 btn btn-outline-primary btn-sm bi bi-caret-right me-3"
      :disabled="showSpinner || archivPath.length > 0 || yearValidationResult"
      @click="onCreate"
    >
      Erstelle Archiv
      <div
        v-if="showSpinner"
        class="spinner-border spinner-border-sm"
        role="status"
      >
        <span class="visually-hidden">Loading...</span>
      </div>
    </button>
    <BaseInput
      v-model="year"
      class="mt-3"
      label="Jahr"
      :external-validation-result="yearValidationResult"
      validation-text="Es muss eine vierstellige Jahreszahl eingegeben werden"
    />
    <a v-if="archivPath" :href="archivDownloadUrl"
      ><button type="button" class="btn btn-sm btn-outline-primary me-2 mt-1">
        <i class="bi bi-cloud-download"></i> Archiv herunterladen
      </button></a
    >
  </div>
</template>
