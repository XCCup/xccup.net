<template>
  <div id="userListView" class="container">
    <h3>Teams {{ route.params.year }}</h3>
    <div v-if="loggedIn">
      <div class="row"></div>
      <button
        type="button"
        class="btn btn-outline-primary btn-sm mb-3"
        @click="onNewTeam"
      >
        Melde ein neues Team
      </button>
    </div>
    <BaseError :error-message="errorMessage" />
    <div v-for="team in teams" :key="team.id" class="card mb-3">
      <TeamCard :team="team" />
    </div>
  </div>
  <!-- <ModalAddTeam /> -->
</template>

<script setup>
import { onMounted, ref } from "vue";
import { setWindowName } from "../helper/utils";
// import { Modal } from "bootstrap";
import { useRoute } from "vue-router";
import BaseError from "../components/BaseError.vue";
import ApiService from "../services/ApiService";
import useUser from "@/composables/useUser";

const { loggedIn } = useUser();
const route = useRoute();

const errorMessage = ref("");
const isLoading = ref(false);
const teams = ref([]);

setWindowName(`Teams ${route.params.year}`);

// let newTeamModal;
onMounted(() => {
  // newTeamModal = new Modal(document.getElementById("newTeamModal"));
});

try {
  isLoading.value = true;
  const res = await ApiService.getTeams({
    year: route.params.year,
    includeStats: true,
  });
  if (res.status != 200) throw res.status.text;

  teams.value = res.data;
  errorMessage.value = "";
} catch (error) {
  console.error(error);
  errorMessage.value =
    "Beim laden der Daten ist ein Fehler aufgetreten. Bitte lade die Seite erneut.";
} finally {
  isLoading.value = false;
}

const onNewTeam = () => {
  //   newTeamModal.show();
  alert("Tut uns leid diese Funktion ist noch nicht implementiert");
};
</script>
