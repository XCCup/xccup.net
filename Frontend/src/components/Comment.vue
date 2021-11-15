<template>
  <div class="d-flex mb-2">
    <img
      src="@/assets/images/avatar2.png"
      class="rounded-circle"
      style="margin-right: 6px"
      height="24"
      width="24"
    />
    <a href="#">{{ comment.user.firstName + " " + comment.user.lastName }}</a>
    <span class="ms-auto fw-light text-secondary"
      ><BaseDate :timestamp="comment.createdAt" date-format="dd.MM.yyyy"
    /></span>
  </div>
  <p v-if="!showCommentEditor">
    {{ comment.message }}
  </p>
  <!-- Replies -->
  <div v-for="reply in comment.replies" :key="reply.id" class="shadow p-3 mb-3">
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
      id="comment-editor"
      v-model="editedComment"
      class="form-control mb-2"
    ></textarea>
    <button
      class="btn btn-primary me-2"
      :disabled="saveButtonIsDisabled"
      @click.prevent="saveEditedMessage"
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
      id="reply-comment-editor"
      v-model="replyMessage"
      class="form-control mb-2"
    ></textarea>
    <button
      class="btn btn-primary me-2"
      :disabled="saveButtonIsDisabled"
      @click.prevent="saveReplyMessage"
    >
      Senden
    </button>
    <button class="btn btn-outline-danger" @click.prevent="closeReplyEditor">
      Abbrechen
    </button>
  </div>

  <div
    v-if="getUserId && comment.userId != getUserId"
    class="text-secondary text-end"
  >
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

<script setup>
import useUser from "@/composables/useUser";
import { ref, computed } from "vue";
const { getUserId } = useUser();

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits([
  "deleteComment",
  "deleteReply",
  "commentEdited",
  "saveReplyMessage",
]);
const showCommentEditor = ref(false);
const showReplyEditor = ref(false);
const replyMessage = ref("");
const editedComment = ref(props.comment.message);

const deleteComment = () => {
  emit("deleteComment", props.comment.id);
};
const editComment = () => {
  showCommentEditor.value = true;
};
const deleteReply = (id) => {
  emit("deleteReply", id);
};
const openReplyEditor = () => {
  showReplyEditor.value = true;
};
const editReply = (reply) => {
  emit("commentEdited", reply);
};
const saveEditedMessage = () => {
  const comment = {
    message: editedComment.value,
    userId: getUserId.value,
    id: props.comment.id,
  };
  emit("commentEdited", comment);
};
const saveReplyMessage = () => {
  const comment = {
    message: replyMessage.value,
    userId: getUserId.value,
    relatedTo: props.comment.id,
  };
  emit("saveReplyMessage", comment);
};
const closeCommentEditor = () => {
  showCommentEditor.value = false;
  editedComment.value = props.comment.message;
};
const closeReplyEditor = () => {
  showReplyEditor.value = false;
  replyMessage.value = "";
};
const saveButtonIsDisabled = computed(() => editedComment.value.length < 3);

defineExpose({
  closeCommentEditor,
  closeReplyEditor,
});
</script>
