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
      E-mail ändern
      <BaseSpinner v-if="showSpinner" />
    </button>
    <BaseError :error-message="errorMessage" class="my-2" />
  </div>
</template>
<script setup>
// TODO: How to test this?

import ApiService from "@/services/ApiService";
import { ref, computed } from "vue";
import BaseSpinner from "./BaseSpinner.vue";
import BaseError from "./BaseError.vue";
import { isEmail } from "../helper/utils";
import useUserProfile from "@/composables/useUserProfile";
import useSwal from "../composables/useSwal";
import { GENERIC_ERROR } from "@/common/Constants";

const { showSuccessAlert } = useSwal();
const { modifiedUserData, emailHasChanged } = useUserProfile();

// Page state
const showSpinner = ref(false);
const errorMessage = ref(null);
const emailFieldIsDisabled = ref(false);

const onSave = async () => {
  try {
    showSpinner.value = true;
    await ApiService.changeEmail(modifiedUserData.value.email);
    showSuccessAlert(
      "Um die Änderung deiner E-Mail-Addresse zu bestätigen öffne bitte den Link den wir dir gerade per Email geschickt haben."
    );
    emailFieldIsDisabled.value = true;
  } catch (error) {
    if (error.response?.data?.errors[0].param === "email")
      return (errorMessage.value = "Dies ist keine gültige E-Mail Adresse");

    console.error(error);
    errorMessage.value = GENERIC_ERROR;
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
