<template>
  <div class="container">
    <h3>Kommentare</h3>
    <div
      class="shadow p-3 mb-3"
      v-for="comment in commentsWithReplies"
      :key="comment.id"
    >
      <Comment
        :ref="comment.id"
        :comment="comment"
        @delete-comment="showCommentDeleteModal"
        @delete-reply="showCommentDeleteModal"
        @comment-edited="onCommentEdited"
        @save-reply-message="onSubmit"
      />
    </div>
    <CommentEditor ref="commentEditor" @submitComment="onSubmit" />
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

<script setup>
import { Modal } from "bootstrap";
import { ref, computed, onMounted } from "vue";

const emit = defineEmits([
  "deleteComment",
  "deleteReply",
  "submitComment",
  "commentEdited",
]);

const props = defineProps({
  comments: {
    type: Array,
    required: true,
  },
});

const deleteCommentModal = ref(null);
const commentIdToDelete = ref(null);

onMounted(() => {
  deleteCommentModal.value = new Modal(
    document.getElementById("deleteCommentModal")
  );
});

const onSubmit = (comment) => {
  emit("submitComment", comment);
};
const onCommentEdited = (comment) => {
  emit("commentEdited", comment);
};
const showCommentDeleteModal = (id) => {
  commentIdToDelete.value = id;
  deleteCommentModal.value.show();
};
const deleteComment = () => {
  emit("deleteComment", commentIdToDelete.value);
};

const commentEditor = ref(null);
const clearCommentEditorInput = () => {
  commentEditor.value.clearCommentEditorInput();
};
defineExpose({
  clearCommentEditorInput,
});

const commentsWithReplies = computed(() => {
  let comments = props.comments.flatMap((comment) =>
    !comment.relatedTo ? [comment] : []
  );
  // Add replies
  comments.forEach((comment) => {
    if (comment.relatedTo) {
      let parent = comments.findIndex(
        (element) => element.id === comment.relatedTo
      );
      if (!comments[parent]?.replies) comments[parent].replies = [];
      comments[parent].replies.push(comment);
    }
  });

  return comments;
});
</script>

<style scoped></style>
