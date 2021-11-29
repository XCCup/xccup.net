<template>
  <h3>Login</h3>

  <form @submit.prevent="handleSubmit">
    <div class="mb-3">
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
    <div v-if="errorMessage" id="loginErrorMessage" class="my-2 text-danger">
      {{ errorMessage }}
    </div>
    <button type="submit" class="btn btn-primary">Anmelden</button>
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
import useUser from "@/composables/useUser";
import { useRouter } from "vue-router";
import { ref } from "vue";
const { login } = useUser();
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

const handleSubmit = async () => {
  try {
    const response = await login({
      email: email.value,
      password: password.value,
    });
    // Redirect after login
    // Alternativly redirect in router config
    if (response?.status === 200 && !props.preventRedirect) {
      let searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("redirect")) {
        router.push({ path: `${searchParams.get("redirect")}` });
      } else {
        router.go(-1);
      }
    }
  } catch (error) {
    if (error.response.status === 401) {
      errorMessage.value = "Benutzername/Passwort falsch";
    } else if (error.response.status === 429) {
      errorMessage.value =
        "Zu viele Versuche, bitte versuche es später noch mal.";
    } else {
      errorMessage.value =
        "Da ist was schief gegangen, bitte versuche es später noch mal.";
      console.log(error.response);
    }
  }
};
</script>

<style scoped></style>
