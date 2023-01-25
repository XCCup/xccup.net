<template>
  <div class="p-3">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="text-right">Profil deaktivieren</h4>
    </div>
    <div>
      <p>Nachfolgend hast Du die Möglichkeit dein Profil zu deaktivieren.</p>
      <p>
        D.h. du erhältst keinerlei Benachrichtigung mehr von dieser Plattform.
        Du kannst dich auch nicht mehr einloggen.
      </p>
      <p>
        Deine Flüge, Kommentare, Fotos oder sonstigen öffentlichen Beiträge auf
        dieser Plattform bleiben erhalten.
      </p>
      <p>
        Wenn du uns eine Nachricht schreibst, können wir dein Profil wieder
        reaktivieren.
      </p>
    </div>
    <button class="btn btn-danger" @click="onDeactivate(false)">
      Deaktivieren
      <BaseSpinner v-if="showSpinner" />
      <i v-if="showSuccessIndicator" class="bi bi-check-circle"></i>
    </button>
    <hr />
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="text-right">Profil löschen</h4>
    </div>
    <div>
      <p>Nachfolgend hast Du die Möglichkeit dein Profil zu löschen.</p>
      <p>
        Kommentare, Fotos oder IGC-Dateien werden unwiederbringlich gelöscht.
      </p>
      <p>
        Zur Wahrung der vergangenen Rankings bleiben deine Flüge erhalten. Dein
        Name wird auf die Initialen gekürzt. Flüge aus der laufenden Saison
        werden gelöscht.
      </p>
      <p>Eine Wiederherstellung deines Profils ist nicht mehr möglich.</p>
    </div>
    <button class="btn btn-danger" @click="onDeactivate(true)">
      Löschen
      <BaseSpinner v-if="showSpinner" />
      <i v-if="showSuccessIndicator" class="bi bi-check-circle"></i>
    </button>
  </div>
</template>
<script setup lang="ts">
import ApiService from "@/services/ApiService";
import { ref } from "vue";
import BaseSpinner from "./BaseSpinner.vue";
import useSwal from "../composables/useSwal";
import { GENERIC_ERROR } from "@/common/Constants";
import useAuth from "../composables/useAuth";
import { useRouter } from "vue-router";

const { logout } = useAuth();
const { showSuccessToast, showFailedToast } = useSwal();
const router = useRouter();

// Page state
const showSpinner = ref(false);
const showSuccessIndicator = ref(false);

const onDeactivate = async (deleteProfil: boolean = false) => {
  try {
    showSpinner.value = true;

    const call = deleteProfil
      ? ApiService.deleteProfil
      : ApiService.deactivateProfil;

    call();

    router.push({
      name: "Home",
    });
    showSuccessToast("Profil deaktiviert");
    logout();
  } catch (error) {
    console.error(error);
    showFailedToast(GENERIC_ERROR);
  } finally {
    showSpinner.value = false;
  }
};
</script>
