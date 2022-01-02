<template>
  <div class="row">
    <div class="col-md-8 mb-3">
      <BaseInput
        id="email"
        v-model="modifiedUserData.email"
        :is-email="true"
        label="E-Mail"
        :is-disabled="emailFieldIsDisabled"
      />
    </div>
  </div>
  <div class="col-md-6">
    <button
      class="btn btn-primary"
      :disabled="!saveButtonIsEnabled"
      data-cy="email-change-btn"
      @click="onSave"
    >
      Email ändern
      <BaseSpinner v-if="showSpinner" />
    </button>
    <BaseError :error-message="errorMessage" class="my-2" />
  </div>
</template>
<script setup>
// TODO: How to test this?

import ApiService from "@/services/ApiService.js";
import { ref, computed } from "vue";
import BaseSpinner from "./BaseSpinner.vue";
import BaseError from "./BaseError.vue";
import Swal from "sweetalert2";
import { isEmail } from "../helper/utils";
import useUserProfile from "@/composables/useUserProfile";

const { modifiedUserData, emailHasChanged } = useUserProfile();

// Page state
const showSpinner = ref(false);
const errorMessage = ref(null);
const emailFieldIsDisabled = ref(false);

const inidcateSuccess = () => {
  Swal.fire({
    icon: "success",
    // TODO: Set color globally
    confirmButtonColor: "#08556d",
    text: "Um die Änderung deiner E-Mail-Addresse zu bestätigen öffne bitte den Link den wir dir gerade per Email geschickt haben.",
  });
};
const onSave = async () => {
  try {
    showSpinner.value = true;
    await ApiService.changeEmail({ email: modifiedUserData.value.email });
    inidcateSuccess();
    emailFieldIsDisabled.value = true;
  } catch (error) {
    if (error.response?.data?.errors[0].param === "email")
      return (errorMessage.value = "Dies ist keine gültige E-Mail Adresse");

    console.error(error);
    errorMessage.value = "Hoppla, da ist leider was schief gelaufen…";
  } finally {
    showSpinner.value = false;
  }
};

// Validation
const saveButtonIsEnabled = computed(
  () =>
    isEmail(modifiedUserData.value.email) &&
    !emailFieldIsDisabled.value &&
    emailHasChanged.value
);
</script>

<style scoped></style>
