<template>
  <div v-if="newsItems" data-cy="list-news" class="container py-4">
    <h2 class="pb-2 border-bottom">News</h2>
    <div class="row mt-3">
      <div
        v-for="newsItem in newsItems"
        :key="newsItem.id"
        data-cy="news-item"
        class="mt-3"
      >
        <NewsItem :news-item="newsItem" :snip-text="false" />
      </div>
    </div>
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { ref } from "vue";
import { setWindowName } from "../helper/utils";
import { useRouter } from "vue-router";
const router = useRouter();

setWindowName("News");

const newsItems = ref(null);
try {
  const res = await ApiService.getPublicNews();
  newsItems.value = res.data;
} catch (error) {
  console.log(error);
  router.push({
    name: "NetworkError",
  });
}
</script>

<style scoped></style>
