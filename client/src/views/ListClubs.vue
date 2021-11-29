<template>
  <div class="container-fluid">
    <h3>Teilnehmende Vereine des Jahres {{ new Date().getFullYear() }}</h3>
  </div>
  <ClubMap :clubs="clubs" />
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { shuffle } from "lodash";
import { setWindowName } from "../helper/utils";

const clubs = ref([]);

setWindowName("Vereine");

try {
  const res = await ApiService.getClubs();
  if (res.status != 200) throw res.status.text;

  const shuffledData = shuffle(res.data);

  clubs.value = shuffledData;
} catch (error) {
  console.error(error);
}
</script>

<style scoped></style>
