<template>
  <div id="userListView" class="container">
    <h3>Registrierte Piloten</h3>
    <div class="row">
      <div class="col-6">
        <FilterPanel
          :is-loading="isLoading"
          :filter-active="filterActive"
          @clear-filter="clearFilter"
          @show-filter="showFilter"
        />
      </div>
      <div class="col-6"><PaginationPanel /></div>
    </div>
    <div v-for="user in users" :key="user.id" class="card mb-3">
      <UserCard :user="user" @open-message-dialog="messageUser" />
    </div>
  </div>
  <ModalSendMail :modal-id="mailModalId" :user="selectedUser" />
  <ModalFilterUsers
    :filter-active="filterActive"
    @filter-results="filterFlightsBy"
  />
</template>

<script setup>
import { onMounted, ref } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";
import { Modal } from "bootstrap";
import useFilter from "../composables/useFilter";
import { useRoute } from "vue-router";

const router = useRoute();

const {
  fetchResults,
  isLoading,
  filterActive,
  filterFlightsBy,
  clearFilter,
  data: users,
  setApiEndpoint,
} = useFilter();

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

setApiEndpoint(ApiService.getUsers);
fetchResults({ params: { records: true }, queries: router.query });

const showFilter = () => {
  filterModal.show();
};
</script>
