<template>
  <slot-dialog>
    <!-- TODO: Prevent short display of the heading before redirecting -->
    <div class="container mb-3">
      <h3>Nutzerprofilaktivierung</h3>
      <div v-if="state == 'success'" data-cy="user-reg-success-indicator">
        Dein Konto wurde aktiviert.
      </div>
      <div
        v-if="state == 'incompleted'"
        data-cy="user-reg-incomplete-indicator"
      >
        Es wurde kein Konto zur Aktivierung gefunden.
      </div>
      <div v-if="state == 'fail'" data-cy="user-reg-fail-indicator">
        <p>
          Es gab leider ein Problem mit der Aktivierung. <br />
          Probiere es erneut oder wende Dich bitte an einen <BaseAdmin />
        </p>
      </div>
      <div
        v-if="state == 'already_activated'"
        data-cy="user-reg-activated-indicator"
      >
        <p>
          Dein Konto wurde bereits aktiviert.<br />
          Versuche dich bitte mit deinen Zugangsdaten einzuloggen.<br />
          Falls dies nicht möglich ist wende Dich bitte an einen <BaseAdmin />
        </p>
      </div>
    </div>
  </slot-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ApiService from "../services/ApiService";
import useAuth from "@/composables/useAuth";
const { saveTokenData } = useAuth();

const route = useRoute();
const router = useRouter();

const { userId, token } = route.query;

const state = ref(null);

if (!(userId && token)) {
  state.value = "incompleted";
} else {
  try {
    const res = await ApiService.activate(userId, token);
    state.value = "success";
    saveTokenData(res.data);
    router.push({ name: "Profile" });
  } catch (error) {
    if (
      error?.response?.status == 400 &&
      error.response.data.includes("User already activated")
    ) {
      state.value = "already_activated";
    }
    if (error?.response?.status == 404) {
      state.value = "fail";
    }
    console.error(error);
  }
}
</script>
