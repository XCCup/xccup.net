<template>
  <section class="pb-3">
    <div id="adminSponsorPanel">
      <button
        class="col-2 btn btn-outline-primary btn-sm bi bi-plus-circle mt-3"
        @click="onNew"
      >
        Neuer Sponsor
      </button>
      <div class="table-responsive">
        <h5>Aktive Sponsoren</h5>
        <AdminSponsorsTable
          :sponsors="activeSponsors"
          data-cy="currentSponsorTable"
          @edit-sponsor="onEdit"
          @delete-sponsor="onDelete"
        />
        <h5>Weitere Sponsoren</h5>
        <AdminSponsorsTable
          :sponsors="furtherSponsors"
          data-cy="furtherSponsorTable"
          @edit-sponsor="onEdit"
          @delete-sponsor="onDelete"
        />
      </div>
    </div>
  </section>
  <BaseModal
    modal-title="Sponsoreneintrag löschen?"
    :modal-body="confirmMessage"
    confirm-button-text="Löschen"
    :modal-id="confirmModalId"
    :confirm-action="processConfirmResult"
    :is-dangerous-action="true"
  />
  <ModalAddEditSponsor
    :sponsor-object="selectedSponsor"
    :show-spinner="showSpinner"
    :error-message="errorMessage"
    @save-sponsor="onSave"
  />
</template>

<script setup lang="ts">
import ApiService from "@/services/ApiService";
import { Modal } from "bootstrap";
import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import type { Sponsor } from "@/types/Sponsor";
import AdminSponsorsTable from "./AdminSponsorsTable.vue";
import ModalAddEditSponsor from "./ModalAddEditSponsor.vue";
import { GENERIC_ERROR } from "@/common/Constants";

const sponsors: Ref<Sponsor[]> = ref([]);
const activeSponsors: Ref<Sponsor[]> = ref([]);
const furtherSponsors: Ref<Sponsor[]> = ref([]);

const selectedSponsor: Ref<Sponsor> = ref(createNewSponsorObject());

const confirmMessage = ref("");
const confirmModalId = "modalSponsorConfirm";

const showSpinner = ref(false);
const errorMessage = ref("");

const confirmModal = ref<Modal>();
const addEditSponsorModal = ref<Modal>();
onMounted(() => {
  const addEditModalElement = document.getElementById("addEditSponsorModal");
  if (addEditModalElement)
    addEditSponsorModal.value = new Modal(addEditModalElement);
  const confirmModalElement = document.getElementById(confirmModalId);
  if (confirmModalElement) confirmModal.value = new Modal(confirmModalElement);
});

async function fetchSponsors() {
  try {
    const res = await ApiService.getSponsors(true);
    sponsors.value = res.data;
    splitSponsorsAndSortEntries(sponsors.value);
  } catch (error) {
    console.error(error);
  }
}

fetchSponsors();

function onNew() {
  errorMessage.value = "";
  selectedSponsor.value = createNewSponsorObject();
  addEditSponsorModal.value?.show();
}

function onEdit(sponsor: Sponsor) {
  // Ensure no null value
  sponsor.tagline = sponsor.tagline ?? "";

  errorMessage.value = "";
  selectedSponsor.value = sponsor;
  addEditSponsorModal.value?.show();
}

function onDelete(sponsor: Sponsor) {
  confirmMessage.value = `Willst du den Eintrag ${sponsor.name} wirklich löschen?`;
  selectedSponsor.value = sponsor;
  confirmModal.value?.show();
}

async function processConfirmResult() {
  if (!selectedSponsor.value?.id) return;
  await ApiService.deleteSponsor(selectedSponsor.value.id);
  await fetchSponsors();
  confirmModal.value?.hide();
}

async function onSave(sponsor: Sponsor) {
  try {
    showSpinner.value = true;
    if (sponsor.id) {
      ApiService.editSponsor(sponsor);
    } else {
      ApiService.addSponsor(sponsor);
    }
    await fetchSponsors();
    addEditSponsorModal.value?.hide();
  } catch (error) {
    console.error(error);
    errorMessage.value = GENERIC_ERROR;
  } finally {
    showSpinner.value = false;
  }
}

function createNewSponsorObject() {
  return {
    name: "",
    website: "",
    tagline: "",
    isGoldSponsor: false,
    sponsorInSeasons: [],
    contact: { address: "", email: "", phone: "", phone2: "" },
  };
}

function splitSponsorsAndSortEntries(sponsors: Sponsor[]) {
  sponsors.sort((a, b) => a.name.localeCompare(b.name));
  activeSponsors.value = sponsors
    .filter((s) => s.sponsorInSeasons.includes(new Date().getFullYear()))
    .sort((a, b) => Number(b.isGoldSponsor) - Number(a.isGoldSponsor));
  furtherSponsors.value = sponsors.filter(
    (s) => !s.sponsorInSeasons.includes(new Date().getFullYear())
  );
}
</script>
