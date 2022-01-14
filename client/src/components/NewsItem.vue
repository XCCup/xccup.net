<template>
  <div class="col d-flex align-items-start">
    <div class="flex-shrink-0 me-3">
      <i
        class="bi fs-2"
        :class="newsItem.icon ?? 'bi-megaphone'"
        data-cy="news-item-icon"
      ></i>
    </div>
    <div>
      <h4 class="mt-2">{{ newsItem.title }}</h4>
      <p>
        <small class="text-muted" data-cy="news-item-date"
          ><BaseDate :timestamp="newsItem.from" date-format="dd.MM.yyyy"
        /></small>
        -
        <span data-cy="news-item-text"> {{ snippedText }}</span>
      </p>

      <!-- TODO: Animate this? -->
      <div v-if="showReadMore">
        <button
          class="btn btn-sm btn-outline-primary"
          data-cy="news-item-button"
          @click="toggleSnipping"
        >
          {{ snippingActive ? "Mehr anzeigen" : "Weniger anzeigen" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { MAX_NEWS_CHARACTERS } from "@/common/Constants";

const props = defineProps({
  newsItem: {
    type: Object,
    required: true,
  },
  snipText: {
    type: Boolean,
    default: true,
  },
});

const showReadMore = computed(() => {
  if (props.newsItem.message.length > MAX_NEWS_CHARACTERS && props.snipText) {
    return true;
  } else {
    return false;
  }
});

const snippedText = computed(() => {
  const text = props.newsItem.message;
  if (text.length > MAX_NEWS_CHARACTERS && snippingActive.value) {
    return text.substring(0, MAX_NEWS_CHARACTERS - 80) + "…";
  } else {
    return text;
  }
});

const snippingActive = ref(props.snipText);
const toggleSnipping = () => (snippingActive.value = !snippingActive.value);
</script>

<style scoped></style>
