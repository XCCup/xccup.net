<template>
  <!-- TODO: Add warning when leaving without saving -->
  <div id="flightEdit" class="container-md">
    <div class="d-flex flex-wrap">
      <!-- TODO: Align this nicely -->
      <h3 class="mt-3">Flug bearbeiten</h3>
      <div
        id="cyFlightDeleteButton"
        class="ms-auto mt-3 text-danger clickable"
        @click.prevent="deleteFlightModal.show()"
      >
        <i class="bi bi-trash d-inline me-1"></i> Flug löschen
      </div>
    </div>
    <!-- TODO: Admin edit shows wrong gliders -->
    <GliderSelect
      v-model="modifiedFlightData.glider.id"
      :show-label="true"
      :gliders="listOfGliders"
      @update:model-value="updateSelectedGlider()"
      @gliders-changed="fetchGliders()"
    />
    <!-- Airspace comment -->
    <div class="form-floating my-3">
      <textarea
        id="airspaceComment"
        v-model="modifiedFlightData.airspaceComment"
        class="form-control"
        placeholder="Flugbericht"
        style="height: 80px"
        data-cy="airspace-comment-textarea"
      ></textarea>
      <label for="airspaceComment">Luftraumkommentar</label>
    </div>
    <div class="my-3">
      <div class="form-floating mb-3">
        <textarea
          v-model="modifiedFlightData.report"
          class="form-control"
          placeholder="Flugbericht"
          style="height: 12em"
          data-cy="flight-report-textarea"
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
      <h3>Bilder</h3>
      <!-- TODO: Include photos in state? -->
      <FlightPhotos
        :photos="flight.photos"
        :flight-id="flight.id"
        class="mb-4"
        @photos-updated="onPhotosUpdated"
      />
      <div>
        <button
          class="btn btn-primary me-2"
          type="submit"
          :disabled="!submitButtonIsEnabled"
          data-cy="save-flight-edit"
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
        <button class="btn btn-outline-danger me-2" @click.prevent="onCancel">
          Abbrechen
        </button>
      </div>

      <BaseError
        id="saveProfileError"
        :error-message="errorMessage"
        class="mt-3"
      />
    </div>
  </div>

  <BaseModal
    modal-title="Flug löschen?"
    modal-body="Dies kann nicht rückgängig gemacht werden"
    confirm-button-text="Löschen"
    modal-id="deleteFlightModal"
    :confirm-action="onDeleteFlight"
    :is-dangerous-action="true"
  />
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import useFlight from "@/composables/useFlight";
import useFlightEdit from "@/composables/useFlightEdit";
import ApiService from "@/services/ApiService";
import { useRoute } from "vue-router";
import { cloneDeep } from "lodash-es";
import router from "../router";
import { asyncForEach } from "../helper/utils";
import { Modal } from "bootstrap";

const route = useRoute();
const { flight, fetchOne } = useFlight();
const { modifiedFlightData, unmodifiedFlightData, resetState } =
  useFlightEdit();

const showSpinner = ref(false);
const listOfGliders = ref(null);
const errorMessage = ref("");

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
if (modifiedFlightData.value.externalId != route.params.id) {
  await fetchOne(route.params.id);
  modifiedFlightData.value.externalId = route.params.id;
  modifiedFlightData.value.glider = flight.value.glider;
  modifiedFlightData.value.report = flight.value.report;
  modifiedFlightData.value.airspaceComment = flight.value.airspaceComment;
  modifiedFlightData.value.hikeAndFly = flight.value.hikeAndFly > 0;
  modifiedFlightData.value.onlyLogbook =
    flight.value.flightStatus === "Flugbuch";
  modifiedFlightData.value.photos = flight.value.photos;
  unmodifiedFlightData.value = cloneDeep(modifiedFlightData.value);
}

// Fetch users gliders

const fetchGliders = async () => {
  try {
    const res = await ApiService.getGliders();
    if (res.status != 200) throw res.statusText;
    listOfGliders.value = res.data.gliders;
  } catch (error) {
    // TODO: Do something!
    console.log(error);
  }
};
await fetchGliders();

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
    resetState();
    router.push({
      name: "Flight",
      params: {
        flightId: route.params.id,
      },
    });
  } catch (error) {
    errorMessage.value = "Da ist leider was schief gelaufen";
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
    resetState();

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
const submitButtonIsEnabled = computed(
  () =>
    JSON.stringify(unmodifiedFlightData.value) !=
    JSON.stringify(modifiedFlightData.value)
);

const updateSelectedGlider = () => {
  const newSelection = listOfGliders.value.find(
    (g) => g.id === modifiedFlightData.value.glider.id
  );
  modifiedFlightData.value.glider = { ...newSelection };
};

// TODO: Add confirm message
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
  deleteFlightModal.value.hide();
};
</script>

<style scoped></style>
