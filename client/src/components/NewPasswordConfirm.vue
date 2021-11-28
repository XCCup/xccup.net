<template>
  <div v-if="!errorMessage" class="mb-4">
    Das Rücksetzen Deines Passwortes wurde bestätigt. Wird senden Dir in kürze
    ein neues Passwort zu 📯
  </div>
  <div v-else class="mb-4">{{ errorMessage }}</div>
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
