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
    <BaseSpinner v-if="showSpinner && !flightId" />
    <div v-show="flightId">
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
      <div class="col-md-12">
        <div class="row d-flex align-items-end">
          <div class="col-md-8">
            <GliderSelect
              v-model="defaultGlider"
              label="Fluggerät"
              :show-label="true"
              :gliders="listOfGliders"
              :is-disabled="!flightId"
            />
          </div>
          <div class="col-md-4">
            <router-link :to="{ name: 'ProfileHangar' }" class="d-grid gap-2">
              <button type="button" class="btn btn-primary mt-3">
                <!-- TODO: Save inputs in state -->
                Liste bearbeiten
              </button>
            </router-link>
          </div>
        </div>
      </div>
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
      <h4>Bilder hinzufügen</h4>
      <div class="mb-3">
        <input
          id="photo-input"
          type="file"
          accept=".jpg, .jpeg"
          style="display: none"
          multiple
          @change="onPhotoSelected"
        />

        <div v-if="uploadedPhotos" class="row">
          <div
            v-for="photo in uploadedPhotos"
            :key="photo"
            class="col-sm-4 col-6"
          >
            <!-- Uploading -->
            <figure v-if="photo.id === null" class="figure">
              <BaseSpinner />
            </figure>
            <!-- Upload failed -->
            <figure v-if="photo.id === 'failed'" class="figure">
              <!-- TODO: implement retry upload -->
              <i class="bi bi-arrow-clockwise"></i>
            </figure>

            <figure v-else class="figure">
              <!-- TODO: Position the delete icon on photo border -->
              <div class="text-end">
                <i
                  class="bi bi-x-square text-danger clickable"
                  @click="onDeletePhoto(photo.id)"
                ></i>
              </div>

              <a
                :href="baseURL + `media/` + photo.id"
                data-lightbox="photos"
                :data-title="photo.description ? photo.description : ``"
              >
                <img
                  :src="baseURL + `media/` + photo.id"
                  class="figure-img img-fluid img-thumbnail"
                  alt=""
              /></a>
              <div class="p-1">
                <!-- TODO: Add tab index -->
                <input
                  v-model="photo.description"
                  class="form-control form-control-sm"
                  type="text"
                  placeholder="Beschreibung"
                />
              </div>
            </figure>
          </div>
          <!-- Add photo button -->
          <!-- TODO: Position button in center -->
          <div class="col-4">
            <figure class="figure">
              <button
                class="btn btn-outline-primary mt-2"
                :disabled="!addPhotoButtonIsEnabled"
                @click.prevent="onAddPhoto"
              >
                <i class="bi bi-plus-square"></i>
              </button>
            </figure>
          </div>
        </div>
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
    </div>
  </form>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import useUser from "@/composables/useUser";
import { useRouter } from "vue-router";
import { getbaseURL } from "@/helper/baseUrlHelper";
import { ref, computed, onMounted } from "vue";

const baseURL = getbaseURL();
const router = useRouter();
const { getUserId } = useUser();

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

const sendButtonIsDisabled = computed(() => {
  return !rulesAccepted.value;
});

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
    if (response.status != 200) throw "Server error";
    flightId.value = response.data.flightId;
    externalId.value = response.data.externalId;
    takeoff.value = response.data.takeoff;
    landing.value = response.data.landing;
  } catch (error) {
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
    });
    if (response.status != 200) throw response.statusText;

    uploadedPhotos.value.forEach((e) => addPhotoDescription(e.id, e));

    redirectToFlight(externalId.value);
  } catch (error) {
    console.log(error);
  } finally {
    showSpinner.value = false;
  }
};

// Photos

const addPhotoButtonIsEnabled = computed(() => flightId.value != null);

const photoInput = ref(null);
onMounted(() => (photoInput.value = document.getElementById("photo-input")));

const selectedPhotos = ref([]);
const uploadedPhotos = ref([]);

const onAddPhoto = () => photoInput.value.click();

const onDeletePhoto = (id) => {
  const index = uploadedPhotos.value.findIndex((e) => e.id === id);
  if (index > -1) uploadedPhotos.value.splice(index, 1);
};

const onPhotoSelected = (event) => {
  [...event.target.files].forEach((element) => {
    selectedPhotos.value.push(element);
    uploadPhoto(element);
  });
};

const addPhotoDescription = async (id, description) => {
  await ApiService.editPhoto(id, description);
};

const uploadPhoto = async (photo) => {
  const index = uploadedPhotos.value.length;
  const _phototmp = { id: null, description: "" };
  uploadedPhotos.value[index] = _phototmp;

  try {
    const formData = new FormData();
    formData.append("image", photo, photo.name);
    formData.append("flightId", flightId.value);
    formData.append("userId", getUserId);
    console.log(photo.name, flightId.value);
    const res = await ApiService.uploadPhotos(formData);
    if (res.status != 200) throw res.statusText;
    uploadedPhotos.value[index].id = res.data.id;
  } catch (error) {
    console.log(error);
    uploadedPhotos.value[index].id = "failed";
  }
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

<style scoped>
.clickable {
  cursor: pointer;
}
</style>
