<template>
  <div v-if="listOfGliders">
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
      <div class="text-center lh-lg">
        <p v-if="showSpinner && !flightId">
          Prüfe G-Record, rufe Höhendaten ab, prüfe Luftraumverletzungen...<br />
          Dieser Vorgang kann einige Sekunden dauern
        </p>
      </div>
      <div ref="collapse" class="collapse">
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
          @gliders-changed="fetchGliders"
        />

        <!-- Report -->
        <TextEditor
          v-model="flightReport"
          style="height: 120px"
          placeholder="Flugbericht"
        />
        <!-- Airspace comment -->
        <p v-if="airspaceViolation" class="text-danger">
          Dieser Flug enthält eine Luftraumverletzung. Du musst zwingend einen
          Luftraumkommentar dazu abgeben.
        </p>
        <AirspaceViolationMap
          v-if="airspaceViolation"
          :airspace-violation="airspaceViolation"
        />
        <div class="form-check mb-3">
          <input
            id="airspaceCommentCheckbox"
            v-model="leaveAirspaceComment"
            class="form-check-input"
            type="checkbox"
            data-bs-toggle="collapse"
            data-bs-target="#airspace-collapse"
            :data-bs-show="airspaceViolation != null"
            data-cy="airspace-comment-checkbox"
          />
          <label class="form-check-label" for="airspaceCommentCheckbox">
            Luftraumkommentar hinterlassen
          </label>
        </div>
        <div id="airspace-collapse" class="collapse">
          <div class="form-floating mb-3">
            <textarea
              id="airspaceComment"
              v-model="airspaceComment"
              class="form-control"
              placeholder="Flugbericht"
              style="height: 80px"
              data-cy="airspace-comment-textarea"
            ></textarea>
            <label for="airspaceComment">Luftraumkommentar</label>
          </div>
        </div>

        <!-- Checkboxes -->
        <div class="form-check mb-3">
          <input
            id="hikeAndFlyCheckbox"
            v-model="hikeAndFly"
            class="form-check-input"
            type="checkbox"
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
          />
          <label class="form-check-label" for="logbookCheckbox">
            Nur Flugbuch
          </label>
        </div>
        <br />
        <!-- Photos -->
        <h3>Bilder</h3>
        <FlightPhotos :flight-id="flightId" @photos-updated="onPhotosUpdated" />
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
            Ansprüche gegenüber dem Veranstalter, dem Ausrichter, dem
            Organisator, dem Wettbewerbsleiter sowie deren Helfer wegen
            einfacher Fahrlässigkeit sind ausgeschlossen. Mit dem Anklicken des
            Häckchens erkenne ich die
            <a href="#" @click.prevent="compRulesModal.show()">Ausschreibung</a>
            und
            <a href="#" @click.prevent="privacyPolicyModal.show()"
              >Datenschutzbestimmungen
            </a>
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
  </div>
  <BaseSlotModal modal-id="privacy-policy-modal" :scrollable="true">
    <PrivacyPolicy />
  </BaseSlotModal>
  <BaseSlotModal modal-id="comp-rules-modal" :scrollable="true">
    <CompRules />
  </BaseSlotModal>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { useRouter } from "vue-router";
import { ref, computed, onMounted } from "vue";
import { Collapse } from "bootstrap";
import { DAYS_FLIGHT_CHANGEABLE, ADMIN_EMAIL } from "@/common/Constants";
import { asyncForEach, setWindowName } from "../helper/utils";
import { Modal } from "bootstrap";

const router = useRouter();

setWindowName("Flug hochladen");

const collapse = ref(null);
const airspaceCollapse = ref(null);
let detailsCollapse = null;

onMounted(() => {
  if (collapse.value)
    detailsCollapse = new Collapse(collapse.value, {
      toggle: false,
    });
});

// Modal
const privacyPolicyModal = ref(null);
const compRulesModal = ref(null);
onMounted(async () => {
  privacyPolicyModal.value = new Modal(
    document.getElementById("privacy-policy-modal")
  );
  compRulesModal.value = new Modal(document.getElementById("comp-rules-modal"));

  airspaceCollapse.value = new Collapse(
    document.getElementById("airspace-collapse")
  );
});

// Fetch users gliders
const listOfGliders = ref(null);
const defaultGlider = ref(null);

const fetchGliders = async () => {
  try {
    const { data: initialData } = await ApiService.getGliders();
    listOfGliders.value = initialData.gliders;
    defaultGlider.value = initialData.defaultGlider;
  } catch (error) {
    console.log(error);
    router.push({
      name: "NetworkError",
    });
  }
};

await fetchGliders();
const rulesAccepted = ref(false);
const leaveAirspaceComment = ref(false);
const onlyLogbook = ref(false);
const hikeAndFly = ref(false);
const airspaceComment = ref("");

const flightId = ref(null);
const externalId = ref(null);
const airspaceViolation = ref(null);
const takeoff = ref("");
const landing = ref("");
const flightReport = ref("");
const showSpinner = ref(false);

const errorMessage = ref(null);

const sendButtonIsDisabled = computed(() => {
  return (
    !(rulesAccepted.value && flightId.value) ||
    !(
      !airspaceViolation.value ||
      (airspaceViolation.value && airspaceComment.value.length >= 10)
    )
  );
});

// IGC
async function sendIgc(file) {
  const formData = new FormData();
  formData.append("igcFile", file.target.files[0], file.target.files[0].name);
  const response = await ApiService.uploadIgc(formData);
  return response;
}

const igcSelected = async (file) => {
  flightId.value = null;
  showSpinner.value = true;
  try {
    if (!file.target.files[0]) return;
    const response = await sendIgc(file);

    if (response.status != 200) throw response.statusText;
    errorMessage.value = null;
    flightId.value = response.data.flightId;
    externalId.value = response.data.externalId;
    takeoff.value = response.data.takeoff;
    landing.value = response.data.landing;
    airspaceViolation.value = response.data.airspaceViolation;
    if (airspaceViolation.value) {
      leaveAirspaceComment.value = true;
      airspaceCollapse.value.show();
    }
    detailsCollapse.show();
  } catch (error) {
    detailsCollapse.hide();
    console.log(error.response);
    if (
      error?.response?.status === 400 &&
      error.response.data == "Invalid G-Record"
    )
      return (errorMessage.value = `Dieser Flug resultiert gem. FAI in einem negativen G-Check (http://vali.fai-civl.org/validation.html). Bitte prüfe ob die Datei unverändert ist. Wenn du denkst, dass  dies ein Fehler ist wende dich bitte an ${ADMIN_EMAIL}`);
    if (
      error?.response?.status === 403 &&
      error.response.data.includes("already present")
    )
      return (errorMessage.value = `Dieser Flug ist bereits vorhanden. Wenn du denkst, dass  dies ein Fehler ist wende dich bitte an ${ADMIN_EMAIL}`);
    if (
      error?.response?.status === 403 &&
      error.response.data.includes("not possible to change")
    )
      return (errorMessage.value = `Dieser Flug ist älter als ${DAYS_FLIGHT_CHANGEABLE} Tage. Ein Upload ist nicht mehr möglich. Wenn du denkst, dass  dies ein Fehler ist wende dich bitte an ${ADMIN_EMAIL}`);

    if (
      error?.response?.status === 403 &&
      error.response.data.includes("Found no takeoff")
    )
      // TODO: Find a way to make the email clickable without using v-html
      return (errorMessage.value = `Dieser Flug liegt ausserhalb des XCCup Gebiets. Wenn du denkst, dass  dies ein Fehler ist wende dich bitte an ${ADMIN_EMAIL}`);

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
      airspaceComment: leaveAirspaceComment.value ? airspaceComment.value : "",
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
    errorMessage.value = "Da ist leider was schief gelaufen";
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
