<template>
  <div>
    <h3>{{ user.firstName }} {{ user.lastName }}</h3>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService.js";
import { setWindowName } from "../helper/utils";
import { useRoute } from "vue-router";

const route = useRoute();
const user = ref(null);

try {
  const res = await ApiService.getUser(route.params.userId);
  if (res.status != 200) throw res.status.text;

  user.value = res.data;

  setWindowName(`Profil von ${user.value.firstName} ${user.value.lastName}`);
} catch (error) {
  console.error(error);
}
</script>
