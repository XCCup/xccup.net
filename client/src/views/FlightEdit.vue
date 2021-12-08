<template>
  <!-- TODO: Add warning when leaving without saving -->
  <div id="upload" class="container">
    <h3>Flug bearbeiten</h3>
    <!-- Glider select -->
    <div class="col-md-12">
      <div class="row d-flex align-items-end">
        <div class="col-md-9">
          <GliderSelect
            v-model="modifiedFlightData.glider.id"
            label="Fluggerät"
            :show-label="true"
            :gliders="listOfGliders"
            @update:model-value="updateSelectedGlider()"
          />
        </div>
        <div class="col-md-3 mt-3">
          <router-link :to="{ name: 'ProfileHangar' }" class="d-grid gap-2">
            <button type="button" class="btn btn-primary">
              Liste bearbeiten
            </button>
          </router-link>
        </div>
      </div>
      <div class="my-3">
        <div class="form-floating mb-3">
          <textarea
            id="flightReport"
            v-model="modifiedFlightData.report"
            class="form-control"
            placeholder="Flugbericht"
            style="height: 10em"
          ></textarea>
          <label for="flightReport">Flugbericht</label>
        </div>

        <div class="form-check mb-3">
          <input
            id="hikeAndFlyCheckbox"
            v-model="modifiedFlightData.hikeAndFly"
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
            v-model="modifiedFlightData.onlyLogbook"
            class="form-check-input"
            type="checkbox"
          />
          <label class="form-check-label" for="logbookCheckbox">
            Nur Flugbuch
          </label>
        </div>
        <!-- Bulder -->
        <h3>Bilder</h3>
        <FlightPhotos
          :photos="flight.photos"
          :flight-id="flight.id"
          class="mb-4"
          @photos-updated="onPhotosUpdated"
        />
        <div class="d-flex flex-wrap">
          <div>
            <button
              class="btn btn-primary me-2"
              type="submit"
              :disabled="!submitButtonIsEnabled"
              @click.prevent="onSubmit"
            >
              Speichern
              <div
                v-if="showSpinner"
                class="spinner-border spinner-border-sm"
                role="status"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
            </button>
            <button
              class="btn btn-outline-danger me-2"
              @click.prevent="onCancel"
            >
              Abbrechen
            </button>
          </div>

          <button
            class="btn btn-outline-danger ms-auto"
            @click.prevent="deleteFlightModal.show()"
          >
            <i class="bi bi-trash d-inline me-1"></i>
          </button>
        </div>

        <BaseError
          id="saveProfileError"
          :error-message="errorMessage"
          class="mt-3"
        />
      </div>
    </div>
  </div>
  <BaseModal
    modal-title="Flug löschen?"
    confirm-button-text="Löschen"
    modal-id="deleteFlightModal"
    :confirm-action="onDeleteFlight"
    :is-dangerous-action="true"
  />
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import useFlight from "@/composables/useFlight";
import ApiService from "@/services/ApiService";
import { useRoute } from "vue-router";
import { cloneDeep } from "lodash";
import router from "../router";
import { asyncForEach } from "../helper/utils";
import { Modal } from "bootstrap";

const route = useRoute();
const { flight, fetchOne } = useFlight();

const showSpinner = ref(false);
const listOfGliders = ref(null);
const errorMessage = ref("");
const modifiedFlightData = ref({
  glider: {},
  report: "",
  hikeAndFly: false,
  onlyLogbook: false,
  photos: [],
});
const photosToDelete = ref([]);
const photosAdded = ref([]);

// Modal
const deleteFlightModal = ref(null);
onMounted(() => {
  deleteFlightModal.value = new Modal(
    document.getElementById("deleteFlightModal")
  );
});

// Fetch flight data
await fetchOne(route.params.id);
modifiedFlightData.value.glider = flight.value.glider;
modifiedFlightData.value.report = flight.value.report;
modifiedFlightData.value.hikeAndFly = flight.value.hikeAndFly > 0;
modifiedFlightData.value.onlyLogbook = flight.value.flightStatus === "Flugbuch";
modifiedFlightData.value.photos = flight.value.photos;

// Fetch users glider
try {
  const res = await ApiService.getGliders();
  if (res.status != 200) throw res.statusText;
  listOfGliders.value = res.data.gliders;
} catch (error) {
  console.log(error);
}

// Submit changed flight data
const onSubmit = async () => {
  showSpinner.value = true;
  try {
    // Update flight details
    const res = await ApiService.editFlightDetails(
      flight.value.id,
      modifiedFlightData.value
    );
    if (res.status != 200) throw res.statusText;
    // Update photo descriptions
    await asyncForEach(modifiedFlightData.value.photos, async (e) => {
      await ApiService.editPhoto(e.id, e);
    });
    // Delete all photos that the user removed in the photos component
    await asyncForEach(photosToDelete.value, async (e) => {
      await ApiService.deletePhoto(e);
    });

    router.push({
      name: "Flight",
      params: {
        flightId: route.params.id,
      },
    });
  } catch (error) {
    errorMessage.value = error.response;
    showSpinner.value = false;
    console.log({ error });
  }
};

// Fired when user changes something in photos component
const onPhotosUpdated = (photos) => {
  modifiedFlightData.value.photos = photos.all; // Contains all photo data
  photosToDelete.value = photos.removed; // Only photos that were removed
  photosAdded.value = photos.added; // Only photos that were added
};

const onCancel = async () => {
  try {
    // Remove all photos the user added
    await asyncForEach(photosAdded.value, async (e) => {
      await ApiService.deletePhoto(e);
    });

    router.push({
      name: "Flight",
      params: {
        flightId: route.params.id,
      },
    });
  } catch (error) {
    errorMessage.value = error.response;
    showSpinner.value = false;
    console.log({ error });
  }
};

// Check if data has been edited
const unmodifiedFlightData = cloneDeep(modifiedFlightData.value);
const submitButtonIsEnabled = computed(
  () =>
    JSON.stringify(unmodifiedFlightData) !=
    JSON.stringify(modifiedFlightData.value)
);

const updateSelectedGlider = () => {
  const newSelection = listOfGliders.value.find(
    (g) => g.id === modifiedFlightData.value.glider.id
  );
  modifiedFlightData.value.glider = { ...newSelection };
};

// TODO: Should ther be a confirm message?
const onDeleteFlight = async () => {
  showSpinner.value = true;
  try {
    await ApiService.deleteFlight(flight.value.externalId);
    router.push({ name: "Home" });
  } catch (error) {
    errorMessage.value = "Da ist leider was schief gelaufen";
    showSpinner.value = false;
    console.log({ error });
  }
};
</script>

<style scoped></style>
