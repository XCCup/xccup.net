<template>
  <div class="d-flex mb-2">
    <img
      src="@/assets/images/avatar2.png"
      class="rounded-circle"
      style="margin-right: 6px"
      height="24"
      width="24"
    />
    <a href="#">{{ comment.User.firstName + " " + comment.User.lastName }}</a>
    <span class="ms-auto fw-light text-secondary"
      ><BaseDate :timestamp="comment.createdAt" dateFormat="dd.MM.yyyy"
    /></span>
  </div>
  <p v-if="!showCommentEditor">
    {{ comment.message }}
  </p>
  <!-- Replies -->
  <div class="shadow p-3 mb-3" v-for="reply in comment.replies" :key="reply.id">
    <CommentReply
      :ref="reply.id"
      :reply="reply"
      @delete-reply="deleteReply"
      @reply-edited="editReply"
    />
  </div>
  <!-- TODO: Maybe combine this editor with the one for new comments because parts of the logic are identical  -->
  <div v-if="showCommentEditor">
    <textarea
      class="form-control mb-2"
      id="comment-editor"
      v-model="editedComment"
    ></textarea>
    <button
      class="btn btn-primary me-2"
      @click.prevent="saveEditedMessage"
      :disabled="saveButtonIsDisabled"
    >
      Speichern
    </button>
    <button class="btn btn-outline-danger" @click.prevent="closeCommentEditor">
      Abbrechen
    </button>
  </div>

  <!-- Reply comment editor -->
  <div v-if="showReplyEditor">
    <textarea
      class="form-control mb-2"
      id="reply-comment-editor"
      v-model="replyMessage"
    ></textarea>
    <button
      class="btn btn-primary me-2"
      @click.prevent="saveReplyMessage"
      :disabled="saveButtonIsDisabled"
    >
      Senden
    </button>
    <button class="btn btn-outline-danger" @click.prevent="closeReplyEditor">
      Abbrechen
    </button>
  </div>

  <div v-if="comment.userId != getUserId" class="text-secondary text-end">
    <a href="#" @click.prevent="openReplyEditor"
      ><i class="bi bi-reply"></i> Antworten</a
    >
  </div>
  <div
    v-if="comment.userId === getUserId && !showCommentEditor"
    class="text-secondary text-end"
  >
    <a href="#" @click.prevent="editComment"
      ><i class="bi bi-pencil-square mx-1"></i>Bearbeiten</a
    >
    <a href="#" @click.prevent="deleteComment">
      <i class="bi bi-trash mx-1"></i>Löschen
    </a>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import CommentReply from "@/components/CommentReply";

export default {
  name: "Comment",
  components: {
    CommentReply,
  },
  data() {
    return {
      showCommentEditor: false,
      showReplyEditor: false,
      replyMessage: "",
      editedComment: this.comment.message,
    };
  },
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
  methods: {
    deleteComment() {
      this.$emit("delete-comment", this.comment.id);
    },
    editComment() {
      this.showCommentEditor = true;
    },
    deleteReply(id) {
      this.$emit("delete-reply", id);
    },
    openReplyEditor() {
      this.showReplyEditor = true;
    },
    editReply(reply) {
      this.$emit("comment-edited", reply);
    },
    saveEditedMessage() {
      const comment = {
        message: this.editedComment,
        userId: this.getUserId,
        id: this.comment.id,
      };
      this.$emit("comment-edited", comment);
    },
    saveReplyMessage() {
      const comment = {
        message: this.replyMessage,
        userId: this.getUserId,
        relatedTo: this.comment.id,
      };
      this.$emit("save-reply-message", comment);
    },
    closeCommentEditor() {
      this.showCommentEditor = false;
      this.editedComment = this.comment.message;
    },
    closeReplyEditor() {
      this.showReplyEditor = false;
      this.replyMessage = "";
    },
  },
  computed: {
    ...mapGetters(["getUserId", "getLoginStatus", "isTokenActive"]),
    saveButtonIsDisabled() {
      return this.editedComment.length < 3;
    },
  },
  emits: [
    "delete-comment",
    "delete-reply",
    "comment-edited",
    "save-reply-message",
  ],
};
</script>
