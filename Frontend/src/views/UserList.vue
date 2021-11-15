<template>
  <div class="container-fluid">
    <h3>Registrierte Piloten</h3>
  </div>
  <div v-for="user in users" :key="user.id" class="card">
    <UserCard :user="user" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";

const users = ref([]);

setWindowName("Registrierte Piloten");

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
