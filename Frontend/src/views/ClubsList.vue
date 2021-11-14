<template>
  <div class="container-fluid">
    <h3>Teilnehmende Vereine des Jahres {{ new Date().getFullYear() }}</h3>
  </div>
  <div class="row">
    <!-- Table looks so "2000". We will with just use a map. -->
    <!-- <div class="col-xl-5 col-md-6 col-12">
            <div class="text-light p-4 pb-4">
                <table class="table table-striped table-hover text-sm">
                    <thead>
                        <th>Verein</th>
                        <th>Anzahl Teilnahmen seit 2011</th>
                        <th>Mitglieder im XCCup</th>
                    </thead>
                    <tbody>
                        <tr
                            v-for="(club, index) in clubs"
                            v-bind:item="club"
                            v-bind:index="index"
                            v-bind:key="club.id"
                            @click="openClubWebsite(club.website)"
                        >
                            <td>{{ club.name }}</td>
                            <td>{{ club.participantInSeasons.length }}</td>
                            <td>{{ 42 }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>-->
    <div class="col">
      <ClubMap :clubs="clubs" />
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { shuffle } from "lodash";

const clubs = ref([]);

// const openClubWebsite = (url) => {
//     window.open(url);
// }

document.title = "XCCup - Vereine";

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
