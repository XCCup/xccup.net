<template>
  <div class="container col-md-10 col-lg-8 col-12 mx-automx-auto">
    <h3>Sponsoren des Jahres {{ new Date().getFullYear() }}</h3>
    <SponsorCard
      v-for="sponsor in sponsors"
      :key="sponsor.id"
      :sponsor="sponsor"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { shuffle } from "lodash";
import { setWindowName } from "../helper/utils";

const sponsors = ref([]);

setWindowName("Sponsoren");

try {
  const res = await ApiService.getSponsors();
  if (res.status != 200) throw res.status.text;

  //Shuffle all entries but sort goldsponsors to the front
  const shuffledData = shuffle(res.data).sort((a, b) => {
    if (a.isGoldSponsor && !b.isGoldSponsor) return -1;
    if (!a.isGoldSponsor && b.isGoldSponsor) return 1;
    return 0;
  });

  sponsors.value = shuffledData;
} catch (error) {
  console.error(error);
}
</script>
