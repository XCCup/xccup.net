<template>
  <div v-if="!record">-</div>
  <div v-else>
    <router-link
      :to="{
        name: 'Flight',
        params: { flightId: record?.externalId },
      }"
    >
      <RankingClass :ranking-class="record.glider.gliderClass" />
      {{ record.user?.firstName }} {{ record.user?.lastName }}
      {{ Math.round(record.distance) }} km
    </router-link>
  </div>
</template>

<script setup>
defineProps({
  record: {
    type: [Object, null],
    required: true,
  },
});
</script>
