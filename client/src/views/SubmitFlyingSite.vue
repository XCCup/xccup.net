<template>
  <slot-dialog :narrow="true">
    <h3>Fluggebiet vorschlagen</h3>
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
  </slot-dialog>
</template>
<script lang="ts" setup>
import ApiService from "@/services/ApiService";
import { ref, computed, reactive } from "vue";
import type { Ref } from "vue";
import { isCoordinate, isDirection, isInt } from "../helper/utils";
import useSwal from "../composables/useSwal";
import { useRouter } from "vue-router";
import type { BaseClub } from "@/types/Club";

const router = useRouter();
const { showSuccessAlert } = useSwal();

const errorMessage = ref("");
const showSpinner = ref(false);

const newSite = reactive({
  name: "",
  direction: "",
  website: "",
  club: "",
  heightDifference: "0",
  lat: "",
  long: "",
});

const clubs: Ref<String[]> = ref([]);
const clubData: Ref<BaseClub[]> = ref([]);

const latIsValid = computed(() => isCoordinate(newSite.lat));
const longIsValid = computed(() => isCoordinate(newSite.long));
const heightIsInt = computed(() => isInt(newSite.heightDifference));
const directionIsValid = computed(() => isDirection(newSite.direction));

try {
  clubData.value = (await ApiService.getClubNames()).data;
  clubs.value = clubData.value?.map((c) => c.name);
  // Add empty option
  clubs.value.push("Es trifft keine Auswahl zu");
} catch (error) {
  router.push({
    name: "NetworkError",
  });
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

const onAddSite = async () => {
  try {
    showSpinner.value = true;
    await ApiService.addSite({
      ...newSite,
      lat: +newSite.lat,
      long: +newSite.long,
      heightDifference: +newSite.heightDifference,
      direction: newSite.direction.toUpperCase(),
      clubId: findClubId(newSite.club),
    });
    await showSuccessAlert(
      "Dein Vorschlag wurde übermittelt. Die Admins müssen diesen noch prüfen, bevor Du ihn nutzen kannst."
    );
    errorMessage.value = "";

    router.push({ name: "Home" });
  } catch (error) {
    console.error(error);
    errorMessage.value = "Da ist leider was schief gelaufen.";
  } finally {
    showSpinner.value = false;
  }
};

function findClubId(clubName?: string) {
  return clubData.value.find((e) => e.name == clubName)?.id;
}
</script>
