<template>
  <h3>Flug hochladen</h3>
  <form @submit.prevent="sendFlightDetails">
    <div class="mb-3">
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
    <BaseError id="upload-error" :error-message="errorMessage" />

    <div class="text-primary text-center lh-lg">
      <!-- TODO: Put the spinner somewhere else -->
      <BaseSpinner v-if="showSpinner && !flightId" />
    </div>
    <!-- TODO: The overflow… -->
    <div id="details-collapse" class="collapse">
      <div class="row">
        <div class="col-md-6 col-12">
          <BaseInput
            v-model="takeoff"
            label="Startplatz"
            :is-disabled="true"
            :is-required="false"
          />
        </div>
        <div class="col-md-6 col-12">
          <BaseInput
            v-model="landing"
            label="Landeplatz"
            :is-disabled="true"
            :is-required="false"
          />
        </div>
      </div>
      <!-- Glider select -->

      <GliderSelect
        v-model="defaultGlider"
        label="Fluggerät"
        :show-label="true"
        :gliders="listOfGliders"
        :is-disabled="!flightId"
      />

      <!-- Report -->
      <div class="form-floating my-3">
        <textarea
          id="floatingTextarea2"
          v-model="flightReport"
          class="form-control cy-flight-report"
          placeholder="Flugbericht"
          style="height: 100px"
          :disabled="!flightId"
        ></textarea>
        <label for="floatingTextarea2">Flugbericht</label>
      </div>
      <!-- Checkboxes -->
      <div class="form-check mb-3">
        <input
          id="hikeAndFlyCheckbox"
          v-model="hikeAndFly"
          class="form-check-input"
          type="checkbox"
          :disabled="!flightId"
        />
        <label class="form-check-label" for="hikeAndFlyCheckbox">
          Hike & Fly
        </label>
      </div>
      <div class="form-check mb-3">
        <input
          id="logbookCheckbox"
          v-model="onlyLogbook"
          class="form-check-input"
          type="checkbox"
          :disabled="!flightId"
        />
        <label class="form-check-label" for="logbookCheckbox">
          Nur Flugbuch
        </label>
      </div>
      <br />
      <!-- Photos -->
      <h3>Bilder</h3>
      <FlightPhotos
        :edit-mode="true"
        :flight-id="flightId"
        @photos-updated="onPhotosUpdated"
      />
      <!-- Rules & Submit -->
      <div class="form-check mb-3">
        <input
          id="acceptTermsCheckbox"
          v-model="rulesAccepted"
          class="form-check-input"
          type="checkbox"
        />
        <label class="form-check-label" for="flexCheckDefault">
          Die Ausschreibung ist mir bekannt, flugrechtliche Auflagen wurden
          eingehalten.<br />
          Jeder Teilnehmer nimmt auf eigene Gefahr an diesem Wettbewerb teil.
          Ansprüche gegenüber dem Veranstalter, dem Ausrichter, dem Organisator,
          dem Wettbewerbsleiter sowie deren Helfer wegen einfacher
          Fahrlässigkeit sind ausgeschlossen. Mit dem Anklicken des Häckchens
          erkenne ich die
          <!-- TODO: Add links -->
          <a href="#">Ausschreibung</a> und
          <a href="#">Datenschutzbestimmungen</a>
          an.
        </label>
      </div>
      <!-- Submit Button -->
      <button
        type="submit"
        class="btn btn-primary me-1"
        :disabled="sendButtonIsDisabled"
      >
        Streckenmeldung absenden
        <div
          v-if="showSpinner"
          class="spinner-border spinner-border-sm"
          role="status"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
      </button>
    </div>
  </form>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";
import { Collapse } from "bootstrap";
import Constants from "@/common/Constants";
import { asyncForEach } from "../helper/utils";

const router = useRouter();

// Fetch users gliders
const listOfGliders = ref(null);
const defaultGlider = ref(null);
try {
  const { data: initialData } = await ApiService.getGliders();

  listOfGliders.value = initialData.gliders;
  defaultGlider.value = initialData.defaultGlider;
} catch (error) {
  console.log(error);
}

const rulesAccepted = ref(false);
const onlyLogbook = ref(false);
const hikeAndFly = ref(false);

const flightId = ref(null);
const externalId = ref(null);
const takeoff = ref("");
const landing = ref("");
const flightReport = ref(" ");
const showSpinner = ref(false);

const errorMessage = ref(null);

let detailsCollapse = null;

const sendButtonIsDisabled = computed(() => {
  return !rulesAccepted.value;
});

// IGC
const igc = ref({ filename: "", body: null });

const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (res) => {
      resolve(res.target.result);
    };
    reader.onerror = (err) => reject(err);
    reader.readAsText(file);
  });
};

const sendIgc = async () => {
  if (igc.value.body == null) return;
  return await ApiService.uploadIgc({ igc: igc.value });
};

const igcSelected = async (file) => {
  flightId.value = null;
  showSpinner.value = true;
  try {
    if (!file.target.files[0]) return;
    igc.value.body = await readFile(file.target.files[0]);
    igc.value.name = file.target.files[0].name;
    const response = await sendIgc();
    if (response.status != 200) throw response.statusText;
    errorMessage.value = null;
    flightId.value = response.data.flightId;
    externalId.value = response.data.externalId;
    takeoff.value = response.data.takeoff;
    landing.value = response.data.landing;
    detailsCollapse.show();
  } catch (error) {
    detailsCollapse.hide();
    console.log(error.response);
    if (
      error.response.status === 400 &&
      error.response.data == "Invalid G-Record"
    )
      return (errorMessage.value = `Dieser Flug resultiert gem. FAI in einem negativen G-Check (http://vali.fai-civl.org/validation.html). Bitte prüfe ob die Datei unverändert ist. Wenn du denkst dass dies ein Fehler ist wende dich bitte an ${Constants.ADMIN_EMAIL}`);
    if (
      error.response.status === 403 &&
      error.response.data.includes("already present")
    )
      return (errorMessage.value = `Dieser Flug ist bereits vorhanden. Wenn du denkst dass dies ein Fehler ist wende dich bitte an ${Constants.ADMIN_EMAIL}`);
    if (
      error.response.status === 403 &&
      error.response.data.includes("not possible to change")
    )
      return (errorMessage.value = `Dieser Flug ist älter als ${Constants.DAYS_FLIGHT_CHANGEABLE} Tage. Ein Upload ist nicht mehr möglich. Wenn du denkst dass dies ein Fehler ist wende dich bitte an ${Constants.ADMIN_EMAIL}`);

    if (
      error.response.status === 403 &&
      error.response.data.includes("Found no takeoff")
    )
      // TODO: Find a way to make the email clickable without using v-html
      return (errorMessage.value = `Dieser Flug liegt ausserhalb des XCCup Gebiets. Wenn du denkst dass dies ein Fehler ist wende dich bitte an ${Constants.ADMIN_EMAIL}`);

    errorMessage.value = "Da ist leider was schief gelaufen";
    console.log(error);
  } finally {
    showSpinner.value = false;
  }
};

const sendFlightDetails = async () => {
  showSpinner.value = true;
  try {
    const response = await ApiService.editFlightDetails(flightId.value, {
      glider: listOfGliders.value.find(
        (glider) => glider.id === defaultGlider.value
      ),
      report: flightReport.value,
      hikeAndFly: hikeAndFly.value,
      onlyLogbook: onlyLogbook.value,
    });
    if (response.status != 200) throw response.statusText;

    await asyncForEach(uploadedPhotos.value, async (e) => {
      await ApiService.editPhoto(e.id, e);
    });

    // Delete all photos that the user removed in the photos component
    await asyncForEach(photosToDelete.value, async (e) => {
      await ApiService.deletePhoto(e);
    });

    redirectToFlight(externalId.value);
  } catch (error) {
    console.log(error);
  } finally {
    showSpinner.value = false;
  }
};

// Photos
const uploadedPhotos = ref([]);
const photosToDelete = ref([]);

const onPhotosUpdated = (photos) => {
  uploadedPhotos.value = photos.all;
  photosToDelete.value = photos.removed;
};

const photoInput = ref(null);
onMounted(() => {
  photoInput.value = document.getElementById("photo-input");
  let myCollapse = document.getElementById("details-collapse");
  detailsCollapse = new Collapse(myCollapse, {
    toggle: false,
  });
});

const redirectToFlight = (id) => {
  router.push({
    name: "Flight",
    params: {
      flightId: id,
    },
  });
};
</script>

<style scoped></style>
