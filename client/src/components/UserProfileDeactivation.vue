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
    <button class="btn btn-danger" @click="onDeactivate(true)">Löschen</button>
  </div>
  <BaseModal
    :modal-title="modalTitle"
    :modal-body="modalBody"
    :confirm-button-text="modalTitle"
    modal-id="confirmUserDeactivationModal"
    :confirm-action="onConfirm"
    :is-dangerous-action="true"
    :show-spinner="showSpinner"
    error-message=""
  />
</template>
<script setup lang="ts">
import ApiService from "@/services/ApiService";
import { ref, onMounted } from "vue";
import useSwal from "../composables/useSwal";
import { GENERIC_ERROR } from "@/common/Constants";
import useAuth from "../composables/useAuth";
import { useRouter } from "vue-router";
import { Modal } from "bootstrap";

const { logout } = useAuth();
const { showSuccessToast, showFailedToast } = useSwal();
const router = useRouter();

const modalTitle = ref("");
const modalBody = ref("");
const deleteProfil = ref(false);

// Page state
const showSpinner = ref(false);

// Modals
const confirmModal = ref<Modal>();
onMounted(() => {
  const el = document.getElementById("confirmUserDeactivationModal");
  if (el) confirmModal.value = new Modal(el);
});

const onDeactivate = async (shouldDelete: boolean = false) => {
  deleteProfil.value = shouldDelete;
  if (shouldDelete) {
    modalTitle.value = "Profil löschen";
    modalBody.value =
      "Bist Du dir wirklich sicher dein Profil zu löschen? Deine Daten gehen unwiderruflich verloren.";
  } else {
    modalTitle.value = "Profil deaktivieren";
    modalBody.value =
      "Bist Du dir wirklich sicher dein Profil zu deaktivieren? Dein Profil kann auf Anfrage von den Admins wieder reaktiviert werden.";
  }
  confirmModal.value?.show();
};

const onConfirm = async () => {
  try {
    showSpinner.value = true;

    const call = deleteProfil.value
      ? ApiService.deleteProfil
      : ApiService.deactivateProfil;

    await call();
    router.push({
      name: "Home",
    });
    showSuccessToast("Profil deaktiviert");
    logout();
  } catch (error) {
    console.error(error);
    showFailedToast(GENERIC_ERROR);
  } finally {
    confirmModal.value?.hide();
    showSpinner.value = false;
  }
};
</script>
