<template>
  <form class="px-4 py-3" @submit.prevent="handleSubmit">
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
    <!-- Stay logged in not realy useful with JWT auth -->
    <!-- <div class="mb-3">
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="dropdownCheck" />
        <label class="form-check-label" for="dropdownCheck">
          Angemeldet bleiben
        </label>
      </div>
    </div> -->
    <button type="submit" class="btn btn-primary">Anmelden</button>
  </form>
  <!-- TODO: Dynamic classes depending on where this component is used? -->
  <div class="dropdown-divider"></div>
  <a class="dropdown-item" href="#">Registrieren</a>
  <a class="dropdown-item" href="#">Password vergessen?</a>
</template>

<script setup>
import useUser from "@/composables/useUser";
import { useRouter } from "vue-router";
import { ref } from "vue";
const { login } = useUser();
const router = useRouter();

defineProps({
  redirectAfterLogin: {
    type: Boolean,
    default: true,
  },
});
const email = ref("");
const password = ref("");

const handleSubmit = async () => {
  try {
    const response = await login({
      email: email.value,
      password: password.value,
    });
    // Redirect after login
    // Alternativly redirect in router config
    if (response.status === 200) {
      let searchParams = new URLSearchParams(window.location.search);
      if (searchParams.has("redirect")) {
        router.push({ path: `${searchParams.get("redirect")}` });
      }
    }
  } catch (error) {
    // TODO: Display error message
    console.log(error);
  }
};
</script>

<style scoped></style>
