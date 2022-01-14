<template>
  <slot-dialog>
    <div>
      <div v-if="!errorMessage" class="mb-4">
        <h5>Hallo {{ resfirstName }}!</h5>
        Die Änderung deiner E-Mail-Adresse auf {{ resEmail }} wurde erfolgreich
        durchgeführt.
      </div>
      <BaseError v-else :error-message="errorMessage" class="mb-4" />
      <p>
        Falls Du Probleme feststellst wende Dich bitte an einen <BaseAdmin />
      </p>
    </div>
  </slot-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import ApiService from "../services/ApiService";

const router = useRoute();
const { userId, token, email } = router.query;

const errorMessage = ref("");
const resfirstName = ref("");
const resEmail = ref("");

if (!userId || !token || !email) {
  errorMessage.value = "Dein Link scheint unvollständig zu sein 🤨";
} else {
  try {
    const res = await ApiService.confirmMailChange(userId, token, email);
    if (res.status != 200) throw res.statusText;
    resfirstName.value = res.data.firstName;
    resEmail.value = res.data.email;
  } catch (error) {
    errorMessage.value = `Dein Bestätigungslink ist ungültig 🤨`;
  }
}
</script>
