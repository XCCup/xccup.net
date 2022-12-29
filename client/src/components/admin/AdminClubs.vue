<template>
  <section class="pb-3">
    <div id="adminClubPanel">
      <button
        class="col-2 btn btn-outline-primary btn-sm bi bi-plus-circle mt-3"
        @click="onNew"
      >
        Neuer Verein
      </button>
      <div class="table-responsive">
        <h5>Aktive Vereine</h5>
        <AdminClubsTable
          :clubs="activeClubs"
          data-cy="currentClubTable"
          @edit-club="onEdit"
          @delete-club="onDelete"
        />
        <h5>Weitere Vereine</h5>
        <AdminClubsTable
          :clubs="furtherClubs"
          data-cy="furtherClubTable"
          @edit-club="onEdit"
          @delete-club="onDelete"
        />
      </div>
    </div>
  </section>
  <BaseModal
    modal-title="Verein löschen?"
    :modal-body="confirmMessage"
    confirm-button-text="Löschen"
    :modal-id="confirmModalId"
    :confirm-action="processConfirmResult"
    :is-dangerous-action="true"
  />
  <ModalAddEditClub
    :club-object="selectedClub"
    :show-spinner="showSpinner"
    :error-message="errorMessage"
    @save-club="onSave"
  />
</template>

<script setup lang="ts">
import ApiService from "@/services/ApiService";
import { Modal } from "bootstrap";
import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import type { NewClub, Club } from "@/types/Club";
import AdminClubsTable from "./AdminClubsTable.vue";
import ModalAddEditClub from "./ModalAddEditClub.vue";
import { GENERIC_ERROR } from "@/common/Constants";

const clubs: Ref<Club[]> = ref([]);
const activeClubs: Ref<Club[]> = ref([]);
const furtherClubs: Ref<Club[]> = ref([]);

const selectedClub: Ref<Club> = ref(createNewClubObject());

const confirmMessage = ref("");
const confirmModalId = "modalClubConfirm";

const showSpinner = ref(false);
const errorMessage = ref("");

const confirmModal = ref<Modal>();
const addEditClubModal = ref<Modal>();
onMounted(() => {
  const addEditModalElement = document.getElementById("addEditClubModal");
  if (addEditModalElement)
    addEditClubModal.value = new Modal(addEditModalElement);
  const confirmModalElement = document.getElementById(confirmModalId);
  if (confirmModalElement) confirmModal.value = new Modal(confirmModalElement);
});

async function fetchClubs() {
  try {
    const res = await ApiService.getClubs(true);
    clubs.value = res.data;
    splitClubsAndSortEntries(clubs.value);
  } catch (error) {
    console.error(error);
  }
}

fetchClubs();

function onNew() {
  errorMessage.value = "";
  selectedClub.value = createNewClubObject();
  addEditClubModal.value?.show();
}

function onEdit(club: Club) {
  // Ensure no null value
  errorMessage.value = "";
  selectedClub.value = club;
  addEditClubModal.value?.show();
}

function onDelete(club: Club) {
  confirmMessage.value = `Willst du den Eintrag ${club.name} wirklich löschen?`;
  selectedClub.value = club;
  confirmModal.value?.show();
}

async function processConfirmResult() {
  if (!selectedClub.value?.id) return;
  await ApiService.deleteClub(selectedClub.value.id);
  await fetchClubs();
  confirmModal.value?.hide();
}

async function onSave(club: Club) {
  try {
    showSpinner.value = true;
    if (club.id) {
      ApiService.editClub(club);
    } else {
      ApiService.addClub(club);
    }
    await fetchClubs();
    addEditClubModal.value?.hide();
  } catch (error) {
    console.error(error);
    errorMessage.value = GENERIC_ERROR;
  } finally {
    showSpinner.value = false;
  }
}

function createNewClubObject(): NewClub {
  return {
    name: "",
    website: "",
    contact: [{ address: "", email: "", phone: "", phone2: "" }],
  };
}

function splitClubsAndSortEntries(clubs: Club[]) {
  clubs.sort((a, b) => a.name.localeCompare(b.name));
  activeClubs.value = clubs.filter((s) =>
    s.participantInSeasons?.includes(new Date().getFullYear())
  );
  furtherClubs.value = clubs.filter(
    (s) => !s.participantInSeasons?.includes(new Date().getFullYear())
  );
}
</script>
