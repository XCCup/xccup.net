<template>
  <div v-if="clubs" class="container-lg">
    <!-- TODO: Shall the year be named? -->
    <h3>Teilnehmende Vereine des Jahres {{ new Date().getFullYear() }}</h3>
    <ClubMap :clubs="clubs" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";

const clubs = ref([]);

setWindowName("Vereine");

try {
  const res = await ApiService.getClubs();
  if (res.status != 200) throw res.status.text;
  clubs.value = res.data;
} catch (error) {
  console.error(error);
}
</script>

<style scoped></style>
