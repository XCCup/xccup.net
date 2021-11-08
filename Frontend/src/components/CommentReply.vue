<template>
  <div class="d-flex mb-2">
    <img
      src="@/assets/images/avatar2.png"
      class="rounded-circle"
      style="margin-right: 6px"
      height="24"
      width="24"
    />
    <a href="#">{{ reply.user.firstName + " " + reply.user.lastName }}</a>
    <span class="ms-auto fw-light text-secondary"
      ><BaseDate :timestamp="reply.createdAt" dateFormat="dd.MM.yyyy"
    /></span>
  </div>
  <p v-if="!showReplyEditor">
    {{ reply.message }}
  </p>
  <!-- TODO: Maybe combine this editor with the one for new replys because parts of the logic are identical  -->
  <div v-if="showReplyEditor">
    <textarea
      class="form-control mb-2"
      id="reply-editor"
      v-model="editedMessage"
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

  <div
    v-if="reply.userId === getUserId && !showReplyEditor"
    class="text-secondary text-end"
  >
    <a href="#" @click.prevent="editComment"
      ><i class="bi bi-pencil-square mx-1"></i>Bearbeiten</a
    >
    <a href="#" @click.prevent="deleteReply">
      <i class="bi bi-trash mx-1"></i>Löschen
    </a>
  </div>
</template>

<script>
import useUser from "@/composables/useUser";
const { getUserId } = useUser();

export default {
  name: "CommentReply",

  data() {
    return {
      showReplyEditor: false,
      editedMessage: this.reply.message,
      replyMessage: "",
    };
  },
  props: {
    reply: {
      type: Object,
      required: true,
    },
  },
  methods: {
    deleteReply() {
      this.$emit("deleteReply", this.reply.id);
    },
    editComment() {
      this.showReplyEditor = true;
    },
    saveEditedMessage() {
      const reply = {
        message: this.editedMessage,
        userId: getUserId,
        id: this.reply.id,
        relatedTo: this.reply.relatedTo,
      };
      this.$emit("reply-edited", reply);
    },
    openReplyEditor() {
      this.showReplyCommentEditor = true;
    },
    closeCommentEditor() {
      this.showReplyEditor = false;
      this.editedMessage = this.reply.message;
    },
  },
  computed: {
    saveButtonIsDisabled() {
      return this.editedMessage.length < 3;
    },
  },
  emits: ["deleteReply", "reply-edited"],
};
</script>
