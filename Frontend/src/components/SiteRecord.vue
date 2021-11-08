<template>
    <div v-if="isEmpty">Sei der Erste 😉</div>
    <div v-else>
        <router-link
            :to="{
                name: 'Flight',
                params: { flightId: record.externalId },
            }"
        >
            <RankingClass :rankingClass="record.glider.gliderClass" />
            <BaseDate :timestamp="record.takeoffTime" />
            {{ record.user.firstName }} {{ record.user.lastName }} {{ record.points }} P ({{ Math.round(record.distance) }} km)
        </router-link>
    </div>
</template>

<script setup>

import { ref } from "vue"

const props = defineProps({
    record: Object,
})

const isEmpty = ref(props.record == null)

</script>