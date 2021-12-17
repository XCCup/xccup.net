<template>
  <div v-if="newsItems" class="container py-4">
    <h2 class="pb-2 border-bottom">News</h2>
    <div class="row g-4 py-4 row-cols-1 row-cols-md-2 row-cols-xl-3">
      <div
        v-for="(newsItem, index) in newsItems"
        :key="newsItem.id"
        :class="index > 1 ? 'd-none d-xl-block' : ''"
      >
        <NewsItem :news-item="newsItem" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  newsItems: {
    type: [Array, null],
    required: true,
  },
});
</script>

<style scoped></style>
