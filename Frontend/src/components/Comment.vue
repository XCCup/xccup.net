<template>
  <div class="d-flex mb-2">
    <img
      src="@/assets/images/avatar2.png"
      class="rounded-circle"
      style="margin-right: 6px"
      height="24"
      width="24"
    />
    <a href="#">{{ comment.User.name }}</a>
    <span class="ms-auto fw-light text-secondary"
      ><BaseDate :timestamp="comment.createdAt" dateFormat="dd.MM.yyyy"
    /></span>
  </div>
  <p v-if="!showMessageEditor">
    {{ comment.message }}
  </p>
  <!-- TODO: Maybe combine this editor with the one for new comments because parts of the logic are identical  -->
  <div v-if="showMessageEditor">
    <textarea
      class="form-control mb-2"
      id="comment-editor"
      v-model="editedMessage"
    ></textarea>
    <button class="btn btn-primary me-2" @click.prevent="saveEditedMessage">
      Speichern
    </button>
    <button class="btn btn-outline-danger" @click.prevent="closeMessageEditor">
      Abbrechen
    </button>
  </div>

  <div
    v-if="comment.userId === getUserId && !showMessageEditor"
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

export default {
  name: "Comment",
  data() {
    return {
      showMessageEditor: false,
      editedMessage: this.comment.message,
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
      this.showMessageEditor = true;
    },
    saveEditedMessage() {
      const comment = {
        message: this.editedMessage,
        userId: this.getUserId,
        id: this.comment.id,
      };
      this.$emit("comment-edited", comment);
    },

    closeMessageEditor() {
      this.showMessageEditor = false;
      this.editedMessage = this.comment.message;
    },
  },
  computed: {
    ...mapGetters(["getUserId", "getLoginStatus", "isTokenActive"]),
  },
  emits: ["delete-comment", "comment-edited"],
};
</script>
