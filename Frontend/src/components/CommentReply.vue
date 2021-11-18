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
      ><BaseDate :timestamp="reply.createdAt" date-format="dd.MM.yyyy"
    /></span>
  </div>
  <p v-if="!showReplyEditor">
    {{ reply.message }}
  </p>
  <!-- TODO: Maybe combine this editor with the one for new replys because parts of the logic are identical  -->
  <div v-if="showReplyEditor">
    <textarea
      id="reply-editor"
      v-model="editedMessage"
      class="form-control mb-2"
    ></textarea>
    <button
      class="btn btn-primary me-2"
      :disabled="saveButtonIsDisabled"
      @click.prevent="onSaveEditedMessage"
    >
      Speichern
    </button>
    <button
      class="btn btn-outline-danger"
      @click.prevent="onCloseCommentEditor"
    >
      Abbrechen
    </button>
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
  />
</template>

<script setup>
import { Modal } from "bootstrap";
import { ref, computed, onMounted } from "vue";
import useUser from "@/composables/useUser";
import useComments from "@/composables/useComments";

const { getUserId } = useUser();
const { deleteComment, editComment } = useComments();

const props = defineProps({
  reply: {
    type: Object,
    required: true,
  },
});

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
  } catch (error) {
    console.log(error);
  }
};

// Edit
const editedMessage = ref(props.reply.message);
const showReplyEditor = ref(false);
const saveButtonIsDisabled = computed(() => editedMessage.value.length < 3);

const onEditComment = () => {
  showReplyEditor.value = true;
};
const onSaveEditedMessage = async () => {
  const comment = {
    message: editedMessage.value,
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
