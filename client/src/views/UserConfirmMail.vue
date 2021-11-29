<template>
  <section class="bg-light">
    <!-- Todo this is reused a few times. Maybe but it in a component with slots -->
    <div class="container py-5 h-100">
      <div class="row justify-content-center align-items-center h-100">
        <div class="col-12 col-lg-9 col-xl-7">
          <div class="card shadow-2-strong" style="border-radius: 15px">
            <div class="card-body p-4 p-md-5">
              <h3 class="mb-4">E-Mail Bestätigung</h3>
              <div v-if="!errorMessage" class="mb-4">
                <h5>Hallo {{ resfirstName }}!</h5>
                Die Änderung deiner E-Mail-Adresse auf {{ resEmail }} wurde
                erfolgreich durchgeführt 🥳
              </div>
              <div v-else class="mb-4">{{ errorMessage }}</div>
              <p>
                Falls Du Probleme feststellst wende Dich bitte an einen
                <router-link :to="{ name: 'Imprint' }"
                  >Administrator</router-link
                >
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
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
