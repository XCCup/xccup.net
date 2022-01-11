<!-- TODO: It may be possible to replace this modal with BaseModal and slots -->
<template>
  <div
    id="addFlyingSiteModal"
    ref="_modal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="addFlyingSiteModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="addFlyingSiteModal" class="modal-title">
            Fluggebiet vorschlagen
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <BaseInput id="site-name" v-model="newSite.name" label="Name" />
          <BaseInput
            id="site-direction"
            v-model="newSite.direction"
            label="Startrichtung (z.B. NW-NO)"
            :external-validation-result="!directionIsValid"
          />
          <BaseInput
            id="site-website"
            v-model="newSite.website"
            label="Link zu einer Website (z.B. DHV Datenbank)"
          />
          <BaseSelect
            id="club-select"
            v-model="newSite.club"
            :options="clubs"
            label="Verein"
            :show-label="true"
          />
          <BaseInput
            id="site-height"
            v-model="newSite.heightDifference"
            label="Höhenunterschied (in Meter)"
            :external-validation-result="!heightIsInt"
          />
          <!-- <BaseSelect
            id="region-select"
            v-model="newSite.region"
            :options="regions"
            label="Region"
            :show-label="true"
          /> -->
          <p>Koordinaten</p>
          <BaseInput
            id="site-lat"
            v-model="newSite.lat"
            label="Latitude (z.B. 50.941736)"
            :external-validation-result="!latIsValid"
          />
          <BaseInput
            id="site-long"
            v-model="newSite.long"
            label="Longitude (z.B. 6.958366)"
            :external-validation-result="!longIsValid"
          />
        </div>
        <div class="modal-footer">
          <BaseError id="saveErrorMessage" :error-message="errorMessage" />

          <button
            type="button"
            class="btn btn-primary"
            :disabled="!saveButtonIsEnabled"
            data-cy="save-new-site-button"
            @click="onAddSite"
          >
            Vorschlagen
            <BaseSpinner v-if="showSpinner" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, computed, reactive, onMounted } from "vue";
import { Modal } from "bootstrap";
import { isCoordinate, isDirection, isInt } from "../helper/utils";
import Swal from "sweetalert2";

const _modal = ref(null);
const modal = ref(null);
onMounted(() => {
  modal.value = new Modal(_modal.value);
});
const errorMessage = ref(null);
const showSpinner = ref(false);

const show = () => modal.value.show();
const hide = () => modal.value.hide();

defineExpose({ show });

const newSite = reactive({
  name: "",
  direction: "",
  website: "",
  club: "",
  heightDifference: "0",
  lat: "",
  long: "",
  regions: "",
});

const clubs = ref(null);
const clubData = ref(null);

const latIsValid = computed(() => (isCoordinate(newSite.lat) ? true : false));
const longIsValid = computed(() => (isCoordinate(newSite.long) ? true : false));
const heightIsInt = computed(() => isInt(newSite.heightDifference));
const directionIsValid = computed(() =>
  isDirection(newSite.direction) ? true : false
);

try {
  clubData.value = (await ApiService.getClubNames()).data;
  clubs.value = clubData.value.map((c) => c.name);
  // Add empty option
  clubs.value.push("");
} catch (error) {
  errorMessage.value =
    "Es gab Probleme beim Laden der Daten. Bitte lade den Dialog erneut oder wende dich an einen Administrator.";
  console.log(error);
}

const saveButtonIsEnabled = computed(() => {
  return (
    newSite.name &&
    directionIsValid.value &&
    latIsValid.value &&
    heightIsInt.value &&
    longIsValid.value
  );
});

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
});

const addSiteSuccess = () => {
  Toast.fire({
    icon: "success",
    title: "Dein Vorschlag wurde übermittelt",
  });
};

const onAddSite = async () => {
  try {
    showSpinner.value = true;
    await ApiService.addSite({
      ...newSite,
      direction: newSite.direction.toUpperCase(),
      clubId: clubData.value.find((e) => e.name == newSite.club).id,
    });
    hide();
    addSiteSuccess();
  } catch (error) {
    console.error(error);
    errorMessage.value =
      "Das speichern war nicht erfolgreich. Bitte prüfe noch einmal deine Angaben oder wende dich an einen Administrator.";
  } finally {
    showSpinner.value = false;
  }
};
</script>
