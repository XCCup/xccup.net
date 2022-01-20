<template>
  <div v-if="users" id="userListView" class="container">
    <h3>Registrierte Piloten</h3>
    <div class="row">
      <div class="col-6">
        <FilterPanel :user-options="true" :disable-season-select="true" />
      </div>
      <div class="col-6">
        <PaginationPanel entry-name="Piloten" />
      </div>
    </div>
    <BaseError :error-message="errorMessage" />
    <div v-for="user in users" :key="user.id" class="card mb-3">
      <UserCard :user="user" @open-message-dialog="messageUser" />
    </div>
    <!-- TODO: Pilotinnen? -->
    <div v-if="users.length < 1">Keine Piloten gefunden</div>
  </div>
  <ModalSendMail :modal-id="mailModalId" :user="selectedUser" />
</template>

<script setup>
import { ref, onMounted } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";
import useData from "../composables/useData";
import { useRoute } from "vue-router";
import { Modal } from "bootstrap";

const route = useRoute();
const { initData, data: users, errorMessage } = useData();

const mailModalId = ref("userMailModal");
const selectedUser = ref(null);

setWindowName("Registrierte Piloten");

let mailModal;

onMounted(() => {
  mailModal = new Modal(document.getElementById(mailModalId.value));
});

const messageUser = (user) => {
  selectedUser.value = user;
  mailModal.show();
};

// Await is necessary to trigger the suspense feature
await initData(ApiService.getUsers, {
  queryParameters: {
    ...route.query,
    records: true,
  },
});
</script>
