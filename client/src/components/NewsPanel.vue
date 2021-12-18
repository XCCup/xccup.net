<template>
  <div v-if="newsItems" class="container py-4" data-cy="news-items">
    <h2 class="pb-2 border-bottom">News</h2>
    <div
      class="row g-4 py-4 row-cols-1 row-cols-md-2 row-cols-xl-3"
      data-cy="news-items"
    >
      <div
        v-for="(newsItem, index) in newsItems"
        :key="newsItem.id"
        :class="index > 1 ? 'd-none d-xl-block' : ''"
        data-cy="news-item"
      >
        <NewsItem :news-item="newsItem" />
      </div>
    </div>
    <div class="mt-3">
      <router-link :to="{ name: 'News' }">
        <button
          data-cy="news-button"
          class="btn btn-sm btn-primary"
          @click="toggleSnipping"
        >
          Alle News anzeigen
        </button>
      </router-link>
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
