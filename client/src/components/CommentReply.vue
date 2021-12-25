<template>
  <div :id="`comment-${reply.id}`" class="d-flex mb-2">
    <img :src="avatarUrl" class="rounded-circle" />
    <a href="#" :class="userPrefersDark ? 'link-light' : ''">{{
      reply.user.firstName + " " + reply.user.lastName
    }}</a>
    <span
      class="ms-auto fw-light"
      :class="userPrefersDark ? 'text-light' : 'text-secondary'"
      ><BaseDate :timestamp="reply.createdAt" date-format="dd.MM.yyyy"
    /></span>
  </div>
  <p v-if="!showReplyEditor" v-html="commentWithLinks"></p>
  <div v-if="showReplyEditor">
    <CommentInlineEditor
      :textarea-content="editedMessage"
      :use-edit-labels="true"
      @save-message="onSaveEditedMessage"
      @close-editor="onCloseCommentEditor"
    />
  </div>

  <div
    v-if="reply.userId === getUserId && !showReplyEditor"
    class="text-secondary text-end"
  >
    <a href="#" @click.prevent="onEditComment"
      ><i class="bi bi-pencil-square mx-1"></i>Bearbeiten</a
    >
    <a href="#" @click.prevent="deleteCommentModal.show()">
      <i class="bi bi-trash mx-1"></i>Löschen
    </a>
  </div>
  <BaseModal
    modal-title="Kommentar löschen?"
    confirm-button-text="Löschen"
    :modal-id="reply.id"
    :confirm-action="onDeleteComment"
    :is-dangerous-action="true"
  />
</template>

<script setup>
import { Modal } from "bootstrap";
import { ref, onMounted, computed } from "vue";
import useUser from "@/composables/useUser";
import useComments from "@/composables/useComments";
import { createUserPictureUrl } from "../helper/profilePictureHelper";
import { sanitizeComment } from "../helper/utils";

const { getUserId } = useUser();
const { deleteComment, editComment } = useComments();

const props = defineProps({
  reply: {
    type: Object,
    required: true,
  },
});
const commentWithLinks = computed(() => sanitizeComment(props.reply.message));

const avatarUrl = createUserPictureUrl(props.reply.user.id);

const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

// Modal
const deleteCommentModal = ref(null);
onMounted(() => {
  deleteCommentModal.value = new Modal(document.getElementById(props.reply.id));
});

// Delete
const onDeleteComment = async () => {
  try {
    const res = await deleteComment(props.reply.id);
    if (res.status != 200) throw res.statusText;
    deleteCommentModal.value.hide();
  } catch (error) {
    console.log(error);
  }
};

// Edit
const editedMessage = ref(props.reply.message);
const showReplyEditor = ref(false);

const onEditComment = () => {
  showReplyEditor.value = true;
};
const onSaveEditedMessage = async (message) => {
  const comment = {
    message: message,
    userId: getUserId.value,
    id: props.reply.id,
  };
  try {
    const res = await editComment(comment);
    if (res.status != 200) throw res.statusText;
    showReplyEditor.value = false;
  } catch (error) {
    console.log(error);
  }
};
const onCloseCommentEditor = () => {
  showReplyEditor.value = false;
  editedMessage.value = props.reply.message;
};
</script>

<style lang="scss" scoped>
.rounded-circle {
  margin-right: 6px;
  height: 24px;
  width: 24px;
}
</style>
