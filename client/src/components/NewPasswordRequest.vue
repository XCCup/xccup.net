<template>
  <form v-if="!mailSent">
    <p>
      Bitte gebe Deine E-Mail Adresse ein und wir senden Dir eine
      Bestätigungsmail zu
    </p>
    <div class="row">
      <div>
        <BaseInput v-model="email" label="E-Mail" :is-email="true" />
      </div>
    </div>
    <div>
      <button
        class="btn btn-primary btn"
        type="submit"
        :disabled="!buttonIsEnabled"
        @click.prevent="onSubmit"
      >
        Neues Passwort anfordern
        <div
          v-if="showSpinner"
          class="spinner-border spinner-border-sm"
          role="status"
        >
          <span class="visually-hidden">Loading...</span>
        </div>
      </button>
      <!-- Error message -->
      <p v-if="errorMessage" class="text-danger mt-4">
        {{ errorMessage }}
      </p>
    </div>
  </form>
  <div v-else>
    <p>Die E-Mail wurde versendet 📯</p>
    <p>
      Falls Du keine Mail erhältst wende Dich bitte an einen
      <router-link :to="{ name: 'Imprint' }">Administrator</router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { isEmail } from "../helper/utils";
import ApiService from "../services/ApiService";

const email = ref("");
const showSpinner = ref(false);
const errorMessage = ref(false);
const mailSent = ref(false);

const buttonIsEnabled = computed(() => isEmail(email.value));

const onSubmit = async () => {
  showSpinner.value = true;
  try {
    const res = await ApiService.requestNewPassword({ email: email.value });
    mailSent.value = true;
    // TODO: Anscheinend fliegt der Fehler schon vorher und die nachfolgende Zeile wird garnicht erreicht
    if (res.status != 200 && res.status != 404) throw res.statusText;
  } catch (error) {
    if (error.response.status == 404) {
      errorMessage.value = `Es wurde kein Konto zur E-Mail ${email.value} gefunden 🤨`;
    }
    console.error(error);
  } finally {
    showSpinner.value = false;
  }
};
</script>
