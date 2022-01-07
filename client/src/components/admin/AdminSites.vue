<template>
  <section class="pb-3">
    <div id="adminSitesPanel" class="container-fluid">
      <div v-if="proposedSitesPresent" class="table-responsive">
        <h5>Ausstehende Fluggebietsprüfungen</h5>
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Name</th>
            <th>Startrichtung</th>
            <th>Website</th>
            <th>Verein</th>
            <th>Lat</th>
            <th>Long</th>
            <th>Hochgeladen am</th>
            <th>Nachricht an Pilot</th>
            <th>Akzeptieren</th>
            <th>Gebiet löschen</th>
          </thead>
          <tbody>
            <tr v-for="site in sites" :key="site.id" :item="site">
              <td>{{ site.name }}</td>
              <td>{{ site.direction }}</td>
              <td>{{ site.website }}</td>
              <td>{{ site.club?.name }}</td>
              <td>{{ site.point?.coordinates[0] }}</td>
              <td>{{ site.point?.coordinates[1] }}</td>
              <td>
                <BaseDate :timestamp="site.createdAt" />
              </td>
              <td>
                <button
                  class="btn btn-outline-primary btn-sm"
                  @click="onMessageSubmitter(site)"
                >
                  <i class="bi bi-envelope"></i>
                </button>
              </td>
              <td>
                <button
                  class="btn btn-outline-primary btn-sm"
                  @click="onAccept(site)"
                >
                  <i class="bi bi-check2-circle"></i>
                </button>
              </td>
              <td>
                <button
                  class="btn btn-outline-danger btn-sm"
                  @click="onDelete(site)"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <BaseModal
    :modal-title="confirmModalTitle"
    :modal-body="confirmMessage"
    :confirm-button-text="confirmModalButtonText"
    :modal-id="confirmModalId"
    :confirm-action="processConfirmResult"
    :is-dangerous-action="true"
  />
  <ModalSendMail :modal-id="mailModalId" :user="selectedUser" />
</template>

<script setup>
import ApiService from "@/services/ApiService.js";
import BaseDate from "../BaseDate.vue";
import { Modal } from "bootstrap";
import { computed, onMounted, ref } from "vue";

const KEY_DELETE = "DELETE";
const KEY_ACCEPT = "ACCEPT";

const sites = ref([]);
const confirmModal = ref(null);
const confirmMessage = ref("");
const confirmType = ref("");
const confirmModalId = ref("modalSiteConfirm");
const confirmModalTitle = ref("");
const confirmModalButtonText = ref("");
const mailModal = ref(null);
const mailModalId = ref("adminSiteMailModal");
const selectedSite = ref(null);
const selectedUser = ref(null);

const proposedSitesPresent = computed(() => sites.value.length > 0);

onMounted(() => {
  confirmModal.value = new Modal(document.getElementById(confirmModalId.value));
  mailModal.value = new Modal(document.getElementById(mailModalId.value));
});

await fetchProposedSites();

async function fetchProposedSites() {
  try {
    const res = await ApiService.getSitesProposed();
    sites.value = res.data;
  } catch (error) {
    console.error(error);
  }
}

async function processConfirmResult() {
  if (confirmType.value === KEY_DELETE) {
    await ApiService.deleteSite(selectedSite.value.id);
  }
  if (confirmType.value === KEY_ACCEPT) {
    await ApiService.acceptSite(selectedSite.value.id);
  }
  await fetchProposedSites();
  confirmModal.value.hide();
}

function onDelete(site) {
  confirmType.value = KEY_DELETE;
  confirmModalTitle.value = " Vorgeschlagenes Fluggebiet löschen?";
  confirmMessage.value = "Willst du diesen Eintrag wirklich löschen?";
  confirmModalButtonText.value = "Löschen";
  selectedSite.value = site;
  confirmModal.value.show();
}

function onAccept(site) {
  confirmType.value = KEY_ACCEPT;
  confirmModalTitle.value = "Fluggebiet akzeptieren?";
  confirmMessage.value = "Willst du diesen Eintrag wirklich akzeptieren?";
  confirmModalButtonText.value = "Akzeptieren";
  selectedSite.value = site;
  confirmModal.value.show();
}

function onMessageSubmitter(site) {
  console.log("SUBMITTER: ", site.submitter);
  selectedUser.value = site.submitter;
  mailModal.value.show();
}
</script>

<style scoped></style>
