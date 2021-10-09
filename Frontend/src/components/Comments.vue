<template>
  <div class="container">
    <h3>Kommentare</h3>
    <div class="shadow p-3 mb-3" v-for="comment in comments" :key="comment.id">
      <Comment
        ref="Comment"
        :comment="comment"
        @delete-comment="showCommentDeleteModal"
        @comment-edited="onCommentEdited"
      />
    </div>
    <CommentEditor ref="commentEditor" @submit-comment="onSubmit" />
  </div>
  <!-- Modal -->
  <!-- TODO Refactor to BaseModal Component? -->
  <div class="modal fade" id="deleteCommentModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Kommentar löschen?</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
            @click="deleteComment"
          >
            Löschen
          </button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Comment from "@/components/Comment";
import CommentEditor from "@/components/CommentEditor";

import { Modal } from "bootstrap";

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
    return { deleteCommentModal: null, commentIdToDelete: null };
  },
  mounted() {
    this.deleteCommentModal = new Modal(
      document.getElementById("deleteCommentModal")
    );
  },
  methods: {
    onSubmit(comment) {
      this.$emit("submit-comment", comment);
    },
    onCommentEdited(comment) {
      this.$emit("comment-edited", comment);
    },
    showCommentDeleteModal(id) {
      this.commentIdToDelete = id;
      this.deleteCommentModal.show();
    },
    deleteComment() {
      this.$emit("delete-comment", this.commentIdToDelete);
    },
    clearCommentEditorInput() {
      this.$refs.commentEditor.clearCommentEditorInput();
    },
  },
  emits: ["delete-comment", "submit-comment", "comment-edited"],
};
</script>

<style scoped></style>
