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

const sponsors = ref([])

document.title = "XCCup - Sponsoren"
const linkMessages = ref(["Hit it!", "Check it out", "Klick mich", "Show more", "Erfahre mehr", "Besuche uns", "Visit us"])

try {
    const res = (await ApiService.getSponsors());
    if (res.status != 200) throw res.status.text;

    //Shuffle all entries but sort goldsponsors to the front
    const shuffledData = shuffle(res.data).sort((a, b) => {
        if (a.isGoldSponsor && !b.isGoldSponsor) return -1
        if (!a.isGoldSponsor && b.isGoldSponsor) return 1
        return 0
    });

    sponsors.value = shuffledData
} catch (error) {
    console.error(error);
}

</script>

