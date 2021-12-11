<template>
  <div v-if="false" class="row">
    <p>
      Das Passwort muss aus mindestens 8 Zeichen bestehen und mindestens eine
      Zahl, Sonderzeichen und Großbuchstaben enthalten.
    </p>
    <div class="col-md-6 mb-3">
      <BaseInput
        id="password"
        v-model="password"
        label="Passwort"
        :is-password="true"
      />
    </div>
    <div class="col-md-6 mb-3">
      <BaseInput
        id="passwordConfirm"
        v-model="password"
        label="Passwort wiederholen"
        :is-password="true"
        :external-validation-result="!passwordMatches"
      />
    </div>
  </div>
  <p>Kommt hier mal hin</p>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, computed } from "vue";
import useUserProfile from "@/composables/useUserProfile";
import BaseSpinner from "./BaseSpinner.vue";

const { modifiedUserData, updateProfile, profileDataHasChanged } =
  useUserProfile();

const password = ref("");
// Page state
const showSpinner = ref(false);
const showSuccessInidcator = ref(false);
const errorMessage = ref(null);

const inidcateSuccess = () => {
  showSpinner.value = false;
  showSuccessInidcator.value = true;
  errorMessage.value = null;
  setTimeout(() => (showSuccessInidcator.value = false), 2000);
};

const onSave = async () => {
  try {
    showSpinner.value = true;
    await updateProfile();
    inidcateSuccess();
  } catch (error) {
    showSpinner.value = false;
    console.error(error);

    if (error.response?.data.errors[0].param === "email")
      return (errorMessage.value = "Dies ist keine gültige E-Mail Adresse");

    errorMessage.value = "Hoppla, da ist leider was schief gelaufen…";
  }
};

// Validation
const passwordMatches = computed(() => {
  return password.value === password.value;
});
</script>

<style scoped></style>
