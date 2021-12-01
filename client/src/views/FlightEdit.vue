<template>
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
            id="floatingTextarea2"
            v-model="modifiedFlightData.report"
            class="form-control"
            placeholder="Flugbericht"
            style="height: 10em"
          ></textarea>
          <label for="floatingTextarea2">Flugbericht</label>
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
        <button
          class="btn btn-primary btn"
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
        <p v-if="errorMessage" class="text-danger mt-2">
          Da ist leider was schief gelaufen…
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import useFlight from "@/composables/useFlight";
import ApiService from "@/services/ApiService";
import { useRoute } from "vue-router";
import { cloneDeep } from "lodash";
import router from "../router";

const route = useRoute();
const { flight, fetchOne } = useFlight();
let listOfGliders = ref(null);

const errorMessage = ref("");
const modifiedFlightData = ref({
  glider: {},
  report: "",
  hikeAndFly: false,
  onlyLogbook: false,
});

// Fetch flight data
await fetchOne(route.params.id);
modifiedFlightData.value.glider = flight.value.glider;
modifiedFlightData.value.report = flight.value.report;
modifiedFlightData.value.hikeAndFly = flight.value.hikeAndFly > 0;
modifiedFlightData.value.onlyLogbook = flight.value.flightStatus === "Flugbuch";

// Fetch users glider
try {
  const res = await ApiService.getGliders();
  if (res.status != 200) throw res.statusText;
  listOfGliders.value = res.data.gliders;
} catch (error) {
  console.log(error);
}
// Submit changed flight data
const showSpinner = ref(false);

const onSubmit = async () => {
  showSpinner.value = true;

  updateModifiedGlider();

  try {
    const res = await ApiService.editFlightDetails(
      flight.value.id,
      modifiedFlightData.value
    );
    if (res.status != 200) throw res.statusText;
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

function updateModifiedGlider() {
  modifiedFlightData.value.glider = listOfGliders.value.find(
    (g) => g.id == modifiedFlightData.value.glider.id
  );
}
</script>

<style scoped></style>
