<template>
  <div id="flight-comments" class="container">
    <h3>Kommentare</h3>
    <div
      v-for="comment in commentsWithReplies"
      :key="comment.id"
      class="shadow p-3 mb-3 rounded"
      :class="commentClass"
    >
      <Comment :comment="comment" />
    </div>
    <CommentEditor />
  </div>
</template>

<script setup>
import useComments from "@/composables/useComments";
import { computed, ref } from "vue";

const { commentsWithReplies } = useComments();

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

const commentClass = computed(() => {
  const dark = "shadow bg-primary";
  const light = "shadow border";
  if (userPrefersDark.value) return dark;
  return light;
});
</script>

<style scoped></style>
