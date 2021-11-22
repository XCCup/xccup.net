<template>
  <div id="userListView" class="container">
    <h3>Registrierte Piloten</h3>
    <div v-for="user in users" :key="user.id" class="card mb-3">
      <UserCard :user="user" @open-message-dialog="messageUser" />
    </div>
  </div>
  <ModalSendMail :modal-id="mailModalId" :user="selectedUser" />
</template>

<script setup>
import { onMounted, ref } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";
import { Modal } from "bootstrap";

const users = ref([]);
const mailModalId = ref("userMailModal");
const selectedUser = ref(null);
let mailModal;

setWindowName("Registrierte Piloten");

onMounted(() => {
  mailModal = new Modal(document.getElementById(mailModalId.value));
});

const messageUser = (user) => {
  selectedUser.value = user;
  mailModal.show();
};

try {
  const res = await ApiService.getUsers({
    records: true,
    limit: 20,
    offset: 0,
  });
  if (res.status != 200) throw res.status.text;

  users.value = res.data;
} catch (error) {
  console.error(error);
}
</script>
