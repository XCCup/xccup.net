<template>
  <div id="adminNewsletterPanel" class="pb-3">
    <div class="mb-3">
      <h5>Flug Upload</h5>
      <p>
        Über dieses Tool ist der Upload von IGC-Dateien für andere Nutzer
        möglich. Dabei können auch ältere Flüge ohne Einschränkung hochgeladen
        werden. Zur Berechnung der Punkte, wird dabei das Gerät verwendet,
        welches der Nutzer in seinem Profil als Standard definiert hat.
      </p>
      <label for="select-pilot" class="form-label"> Pilot auswählen </label>
      <input
        id="select-pilot"
        v-model="selectedUserName"
        class="form-control mb-3"
        list="datalistOptions"
        placeholder="Pilot suchen..."
        data-cy="select-pilot"
      />
      <datalist id="datalistOptions">
        <option v-for="user in userNames" :key="user" :data-value="user">
          {{ user }}
        </option>
      </datalist>
      <label for="igcUploadForm" class="form-label">
        Flug auswählen (.igc)
      </label>
      <input
        id="igcUploadForm"
        class="form-control"
        type="file"
        accept=".igc"
        @change="igcSelected"
      />
    </div>
    <button
      type="button"
      class="btn btn-outline-primary"
      :disabled="!properUserSet || !fileLoaded"
      @click="onSubmit"
    >
      Flug absenden <BaseSpinner v-if="showSpinner" />
    </button>
    <BaseError id="upload-error" :error-message="errorMessage" />
  </div>
</template>

<script setup lang="ts">
import ApiService from "@/services/ApiService";
import { computed, ref, watch, watchEffect } from "vue";
import { useRouter } from "vue-router";
import type { NameUserData } from "@/types/UserData";
import type { Ref } from "vue";
import useSwal from "@/composables/useSwal";

const router = useRouter();
const { showSuccessToast } = useSwal();

const userNames: Ref<string[]> = ref([]);
const users: Ref<NameUserData[]> = ref([]);
const selectedUserName = ref("");
const errorMessage = ref("");
const showSpinner = ref(false);
const fileLoaded = ref(false);
const properUserSet = ref(false);

let formData: FormData | null = null;
let selectedUserObject: NameUserData;

watch(
  () => selectedUserName.value,
  () => {
    const result = users.value.find(
      (u) => selectedUserName.value == createFullname(u)
    );
    if (result) {
      selectedUserObject = result;
      properUserSet.value = true;
    }
  }
);

fetchNames();

async function fetchNames() {
  try {
    users.value = (await ApiService.getUserNames()).data;
    userNames.value = users.value.map((u) => createFullname(u));
  } catch (error) {
    console.error(error);
  }
}

async function onSubmit() {
  try {
    showSpinner.value = true;
    if (formData) {
      const userId = formData.append("userId", selectedUserObject.id);
      await ApiService.uploadIgcAdmin(formData);
      showSuccessToast("Flug Upload erfolgreich");
    }
  } catch (error) {
    console.log(error);
  } finally {
    showSpinner.value = false;
  }
}

// // IGC
// async function sendIgc(file) {
//   const formData = new FormData();
//   formData.append("igcFile", file.target.files[0], file.target.files[0].name);
//   const response = await ApiService.uploadIgc(formData);
//   return response;
// }

const igcSelected = async (file: any) => {
  try {
    if (!file.target.files[0]) return;

    formData = new FormData();
    formData.append("igcFile", file.target.files[0], file.target.files[0].name);
    fileLoaded.value = true;
  } catch (error) {
    console.log(error);
  }
};

function createFullname(u: NameUserData) {
  return u.firstName + " " + u.lastName;
}
</script>
