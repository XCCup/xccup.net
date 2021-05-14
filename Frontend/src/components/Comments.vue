<template>
  <div class="container">
    <div class="shadow p-3 mb-3" v-for="comment in comments" :key="comment.id">
      <Comment :comment="comment" @comment-deleted="deleteComment" />
    </div>
    <CommentEditor ref="commentEditor" @comment-submitted="onSubmit" />
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
    deleteComment(id) {
      this.$emit("comment-deleted", id);
    },
  },
  emits: ["comment-deleted", "comment-submitted"],
};
</script>

<style scoped></style>
