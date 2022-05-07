<template>
  <form @submit.prevent="handleSubmit">
    <div class="my-3">
      <label for="email" class="form-label">E-Mail</label>
      <input
        id="email"
        v-model="email"
        type="email"
        class="form-control"
        placeholder="E-Mail"
      />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Passwort</label>
      <input
        id="password"
        v-model="password"
        type="password"
        class="form-control"
        placeholder="Passwort"
      />
    </div>
    <div>
      <BaseError
        id="loginErrorMessage"
        :error-message="errorMessage"
        class="my-2"
      />
    </div>
    <!-- TODO: Enter key should submit -->
    <button type="submit" class="btn btn-primary">
      Anmelden <BaseSpinner v-if="showSpinner" />
    </button>
  </form>

  <div class="my-3">
    <div>
      <router-link :to="{ name: 'PasswordLost' }"
        >Password vergessen?</router-link
      >
    </div>
    <div>
      <router-link :to="{ name: 'Register' }">Registrieren</router-link>
    </div>
  </div>
</template>

<script setup>
import useAuth from "@/composables/useAuth";
import { useRouter } from "vue-router";
import { ref } from "vue";
import BaseSpinner from "./BaseSpinner.vue";
const { login } = useAuth();
const router = useRouter();

const props = defineProps({
  preventRedirect: {
    type: Boolean,
    default: false,
  },
});
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const showSpinner = ref(false);

const handleSubmit = async () => {
  try {
    showSpinner.value = true;
    const response = await login(email.value, password.value);
    // Redirect after login
    // Alternativly redirect in router config
    if (response?.status === 200 && !props.preventRedirect) {
      let searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("redirect")) {
        router.push({ path: `${searchParams.get("redirect")}` });
      } else {
        // TODO:
        // Should the user always be pushed to home?
        // If router.go(-1) is used the UX after password reset is pretty bad
        router.push({ name: "Home" });
      }
    }
  } catch (error) {
    if (error.response?.status === 401) {
      errorMessage.value = "Benutzername/Passwort falsch";
    } else if (error.response?.status === 429) {
      errorMessage.value =
        "Zu viele Versuche, bitte versuche es später noch mal.";
    } else {
      errorMessage.value =
        "Da ist was schief gegangen, bitte versuche es später noch mal.";
      console.log(error.response);
    }
  } finally {
    showSpinner.value = false;
  }
};
</script>

<style scoped>
form {
  max-width: 500px;
}
</style>
