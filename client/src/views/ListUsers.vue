<template>
  <div id="userListView" class="container">
    <h3>Registrierte Piloten</h3>
    <div class="row">
      <div class="col-6">
        <FilterPanel
          :api-endpoint="ApiService.getUsers"
          @show-filter="showFilter"
        />
      </div>
      <div class="col-6">
        <PaginationPanel
          :api-endpoint="ApiService.getUsers"
          entry-name="Piloten"
        />
      </div>
    </div>
    <div v-for="user in users" :key="user.id" class="card mb-3">
      <UserCard :user="user" @open-message-dialog="messageUser" />
    </div>
  </div>
  <ModalSendMail :modal-id="mailModalId" :user="selectedUser" />
  <ModalFilterUsers />
</template>

<script setup>
import { onMounted, ref } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";
import { Modal } from "bootstrap";
import useData from "../composables/useData";
import { useRoute } from "vue-router";

const router = useRoute();
const { fetchData, data: users } = useData(ApiService.getUsers);

const mailModalId = ref("userMailModal");
const selectedUser = ref(null);

setWindowName("Registrierte Piloten");

let filterModal;
let mailModal;
onMounted(() => {
  mailModal = new Modal(document.getElementById(mailModalId.value));
  filterModal = new Modal(document.getElementById("userFilterModal"));
});

const messageUser = (user) => {
  selectedUser.value = user;
  mailModal.show();
};

fetchData({ params: { records: true }, queries: router.query });

const showFilter = () => {
  filterModal.show();
};
</script>
