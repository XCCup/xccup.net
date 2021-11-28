<template>
  <div class="container mb-3">
    <h3>Nutzerprofilaktivierung</h3>
    <div v-if="state == 'incompleted'">
      Es wurde kein Konto zur Aktivierung gefunden 🤨
    </div>
    <div v-if="state == 'success'">
      <h5>Hallo {{ firstName }}!</h5>
      <div>Deine Aktivierung war erfolgreich 🥳</div>
      <div>Du solltest nun automatisch eingeloggt sein</div>
    </div>
    <div v-if="state == 'fail'">
      <div>Es gab leider ein Problem mit der Aktivierung 😥</div>
      <div>
        Probiere es erneut oder wende Dich bitte an einen
        <router-link to="Imprint">Administrator</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute } from "vue-router";
import ApiService from "../services/ApiService";

const router = useRoute();
const { userId, token } = router.query;

const state = ref("");
const firstName = ref("");

if (!(userId && token)) {
  state.value = "incompleted";
} else {
  try {
    const res = await ApiService.activate(userId, token);
    if (res.status != 200) throw res.statusText;

    state.value = "success";
    firstName.value = res.data.firstName;

    //TODO: Handle token
  } catch (error) {
    state.value = "fail";
    console.error(error);
  }
}
</script>
