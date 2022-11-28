<template>
  <div v-if="clubs" class="container-lg">
    <h3>Teilnehmende Vereine</h3>
    <p>
      Ihr vermisst euren Verein? Dann nehmt doch bitte direkt
      <router-link :to="{ name: 'Imprint' }">Kontakt</router-link> mit uns auf.
      Wir freuen uns auf Euch.
    </p>
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
