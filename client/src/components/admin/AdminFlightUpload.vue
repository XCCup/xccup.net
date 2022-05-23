<template>
  <div id="adminFlightUploadPanel" class="pb-3">
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
    <div class="form-check form-switch mb-3">
      <input
        id="flexSwitchCheckChecked"
        v-model="skipGCheck"
        class="form-check-input"
        type="checkbox"
        role="switch"
      />
      <label class="form-check-label" for="flexSwitchCheckChecked"
        >Alle Checks ignorieren</label
      >
    </div>

    <button
      type="button"
      class="btn btn-outline-primary mb-2"
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
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import type { UserDataEssential } from "@/types/UserData";
import type { Ref } from "vue";

const router = useRouter();

const userNames: Ref<string[]> = ref([]);
const users: Ref<UserDataEssential[]> = ref([]);
const selectedUserName = ref("");
const errorMessage = ref("");
const showSpinner = ref(false);
const fileLoaded = ref(false);
const properUserSet = ref(false);
const skipGCheck = ref(false);

let formData: FormData | null = null;
let selectedUserObject: UserDataEssential;

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
      formData.append("userId", selectedUserObject.id);
      if (skipGCheck.value)
        formData.append("skipGCheck", skipGCheck.value.toString());

      const data = (await ApiService.uploadIgcAdmin(formData)).data;
      errorMessage.value = "";
      redirectToFlight(data.externalId);
    }
  } catch (error: any) {
    console.log(error.response);
    formData?.delete("skipGCheck");
    formData?.delete("userId");
    if (
      error?.response?.status === 400 &&
      error.response.data == "Invalid G-Record"
    )
      return (errorMessage.value = `Dieser Flug resultiert gem. FAI in einem negativen G-Check (http://vali.fai-civl.org/validation.html).`);
    if (
      error?.response?.status === 400 &&
      error.response.data == "No default glider configured in profile"
    )
      return (errorMessage.value = `Der Nutzer hat kein Standard-Gerät in seinem Profil definiert.`);
    if (
      error?.response?.status === 403 &&
      error.response.data.includes("already present")
    )
      return (errorMessage.value = `Dieser Flug ist bereits vorhanden.`);
    if (
      error?.response?.status === 403 &&
      error.response.data.includes("Found no takeoff")
    )
      return (errorMessage.value = `Dieser Flug liegt ausserhalb des XCCup Gebiets.`);

    errorMessage.value = "Da ist leider was schief gelaufen.";
    console.log(error);
  } finally {
    showSpinner.value = false;
  }
}

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

function createFullname(u: UserDataEssential) {
  return u.firstName + " " + u.lastName;
}

function redirectToFlight(id: number) {
  router.push({
    name: "Flight",
    params: {
      flightId: id,
    },
  });
}
</script>
