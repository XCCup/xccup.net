<template>
  <div v-if="!errorMessage" class="mb-4">
    Wir haben dir ein neues Passwort per E-Mail geschickt. Falls du dieses nicht
    bekommen haben solltest wende dich bitte an einen <BaseAdmin />
  </div>
  <BaseError
    v-else
    id="loginErrorMessage"
    :error-message="errorMessage"
    class="mb-4"
  />
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import ApiService from "../services/ApiService";

const router = useRoute();
const { userId, token } = router.query;

const errorMessage = ref("");

if (!userId || !token) {
  errorMessage.value = "Dein Link scheint unvollständig zu sein 🤨";
} else {
  try {
    const res = await ApiService.confirmNewPassword(userId, token);
    if (res.status != 200) throw res.statusText;
  } catch (error) {
    errorMessage.value = `Dein Bestätigungslink ist ungültig 🤨`;
  }
}
</script>
