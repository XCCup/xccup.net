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
    <CommentReply :reply="reply" />
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
      @click.prevent="onSaveEditedMessage"
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
      :disabled="replySaveButtonIsDisabled"
      @click.prevent="onSubmitReplyMessage"
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
    <a href="#" @click.prevent="onEditComment"
      ><i class="bi bi-pencil-square mx-1"></i>Bearbeiten</a
    >
    <a href="#" @click.prevent="deleteCommentModal.show()">
      <i class="bi bi-trash mx-1"></i>Löschen
    </a>
  </div>
  <!-- Modal -->
  <!-- TODO Refactor to BaseModal Component? -->
  <div :id="comment.id" class="modal fade" tabindex="-1">
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
            @click="onDeleteComment"
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

<script setup>
import useUser from "@/composables/useUser";
import useComments from "@/composables/useComments";
import { ref, computed, onMounted } from "vue";
import { Modal } from "bootstrap";

const { getUserId } = useUser();
const { deleteComment, editComment, submitComment } = useComments();

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
});

// Modal
const deleteCommentModal = ref(null);
onMounted(() => {
  deleteCommentModal.value = new Modal(
    document.getElementById(props.comment.id)
  );
});

// Delete comment
const onDeleteComment = async () => {
  try {
    const res = await deleteComment(props.comment.id);
    if (res.status != 200) throw res.statusText;
  } catch (error) {
    console.log(error);
  }
};

// Edit Comment
const showCommentEditor = ref(false);
const editedComment = ref(props.comment.message);

const onEditComment = () => (showCommentEditor.value = true);
const onSaveEditedMessage = async () => {
  const comment = {
    message: editedComment.value,
    userId: getUserId.value,
    id: props.comment.id,
  };
  try {
    const res = await editComment(comment);
    if (res.status != 200) throw res.statusText;
    closeCommentEditor();
  } catch (error) {
    console.log(error);
  }
};

const closeCommentEditor = () => {
  showCommentEditor.value = false;
  editedComment.value = props.comment.message;
};
const saveButtonIsDisabled = computed(() => editedComment.value.length < 3);

// Submit new reply
const replyMessage = ref("");
const showReplyEditor = ref(false);
const replySaveButtonIsDisabled = computed(() => replyMessage.value.length < 3);

const openReplyEditor = () => (showReplyEditor.value = true);

const onSubmitReplyMessage = async () => {
  const comment = {
    message: replyMessage.value,
    userId: getUserId.value,
    relatedTo: props.comment.id,
  };
  try {
    const res = await submitComment(comment);
    if (res.status != 200) throw res.statusText;
    closeReplyEditor();
  } catch (error) {
    console.log(error);
  }
};

const closeReplyEditor = () => {
  showReplyEditor.value = false;
  replyMessage.value = "";
};
</script>
