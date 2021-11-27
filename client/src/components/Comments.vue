<template>
  <div id="flight-comments" class="container">
    <h3>Kommentare</h3>
    <div
      v-for="comment in commentsWithReplies"
      :key="comment.id"
      class="shadow p-3 mb-3"
    >
      <Comment :comment="comment" />
    </div>
    <CommentEditor />
  </div>
</template>

<script setup>
import useComments from "@/composables/useComments";

const { commentsWithReplies } = useComments();
</script>

<style scoped></style>
