<template>
  <div class="container">
    <div class="shadow p-3 mb-3" v-for="comment in comments" :key="comment.id">
      <Comment :comment="comment" />
    </div>
    <CommentEditor @comment-submitted="onSubmit" />
  </div>
</template>

<script>
import Comment from "@/components/Comment";
import CommentEditor from "@/components/CommentEditor";

export default {
  name: "Comments",
  components: {
    Comment,
    CommentEditor,
  },
  props: {
    comments: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {};
  },
  methods: {
    onSubmit(comment) {
      this.$emit("comment-submitted", comment);
    },
  },
};
</script>

<style scoped></style>
