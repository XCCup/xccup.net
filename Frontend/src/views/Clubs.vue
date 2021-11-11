<template>
    <div class="container-fluid">
        <h3>Teilnehmende Vereine des Jahres {{ new Date().getFullYear() }}</h3>
    </div>
    <div class="card" v-for="(club, index) in clubs" v-bind:key="club.id">
        <div>ID: {{ club.id }}</div>
        <Sponsor
            :sponsor="club"
            :linkMessage="linkMessages[Math.floor(Math.random() * linkMessages.length)]"
        />
    </div>
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { shuffle } from "lodash"

const responseData = shuffle((await ApiService.getClubs()).data);

const linkMessages = ref(["Hit it!", "Check it out", "Klick mich", "Show more", "Erfahre mehr", "Besuche uns", "Visit us"])
const clubs = ref(responseData)

</script>

