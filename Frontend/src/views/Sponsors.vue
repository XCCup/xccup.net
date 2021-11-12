<template>
    <div class="container-fluid">
        <h3>Sponsoren des Jahres {{ new Date().getFullYear() }}</h3>
    </div>
    <div class="card" v-for="(sponsor, index) in sponsors" v-bind:key="sponsor.id">
        <Sponsor
            :sponsor="sponsor"
            :linkMessage="linkMessages[Math.floor(Math.random() * linkMessages.length)]"
        />
    </div>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { shuffle } from "lodash"

//Shuffle all entries but sort goldsponsors to the front
const responseData = shuffle((await ApiService.getSponsors()).data).sort((a, b) => {
    if (a.isGoldSponsor && !b.isGoldSponsor) return -1
    if (!a.isGoldSponsor && b.isGoldSponsor) return 1
    return 0
});

document.title = "XCCup - Sponsoren"

const linkMessages = ref(["Hit it!", "Check it out", "Klick mich", "Show more", "Erfahre mehr", "Besuche uns", "Visit us"])
const sponsors = ref(responseData)

</script>

