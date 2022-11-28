<template>
  <!-- TODO: Handle comments from deleted users -->

  <div
    v-if="comment && comment.user"
    :id="`comment-${comment.id}`"
    data-cy="flight-comment"
  >
    <div class="d-flex mb-2" data-cy="comment-header">
      <img :src="avatarUrl" class="rounded-circle" />
      <router-link
        :class="userPrefersDark ? 'link-light' : ''"
        :to="{
          name: 'FlightsAll',
          query: { userId: comment?.user?.id },
        }"
      >
        {{ comment.user?.fullName }}
      </router-link>

      <span
        class="ms-auto fw-light"
        :class="userPrefersDark ? 'text-light' : 'text-secondary'"
        ><BaseDate
          :timestamp="comment.createdAt"
          date-format="dd.MM.yyyy HH:mm"
      /></span>
    </div>
    <!-- eslint-disable vue/no-v-html -->
    <p
      v-if="!showCommentEditor"
      class="allow-white-spaces"
      data-cy="comment-body"
      v-html="commentWithLinks"
    ></p>
    <!--eslint-enable-->

    <!-- Replies -->
    <div
      v-for="reply in comment.replies"
      :key="reply.id"
      class="shadow-sm rounded p-3 mb-3"
      :class="userPrefersDark ? 'dark-reply' : ''"
    >
      <Comment :comment="reply" />
    </div>
    <!-- Comment Editor -->
    <div v-if="showCommentEditor">
      <CommentInlineEditor
        :textarea-content="editedComment"
        :use-edit-labels="true"
        :show-spinner="showSpinner"
        :error-message="errorMessage"
        @save-message="onSaveEditedMessage"
        @close-editor="closeCommentEditor"
      />
    </div>

    <!-- Reply comment editor -->
    <div v-if="showReplyEditor">
      <CommentInlineEditor
        :textarea-content="replyMessage"
        :show-spinner="showSpinner"
        :error-message="errorMessage"
        @save-message="onSubmitReplyMessage"
        @close-editor="closeReplyEditor"
      />
    </div>
    <div data-cy="comment-footer">
      <!-- Don't show the reply button if it's a reply -->
      <div
        v-if="getUserId && !comment?.relatedTo"
        class="text-secondary text-end"
      >
        <a
          href="#"
          :class="userPrefersDark ? 'link-light' : ''"
          @click.prevent="openReplyEditor"
        >
          <i class="bi bi-reply" data-cy="reply-comment-button"></i> Antworten
        </a>
      </div>
      <!-- Show edit btns to the author of a comment -->
      <div
        v-if="comment.userId === getUserId && !showCommentEditor"
        class="text-secondary text-end"
      >
        <a
          href="#"
          :class="userPrefersDark ? 'link-light' : ''"
          @click.prevent="onEditComment"
        >
          <i class="bi bi-pencil-square mx-1"></i>Bearbeiten
        </a>
        <a
          href="#"
          :class="userPrefersDark ? 'link-light' : ''"
          @click.prevent="deleteCommentModal.show()"
        >
          <i class="bi bi-trash mx-1"></i>Löschen
        </a>
      </div>
      <!-- Show admin edit btns only to admins on comments of other users -->
      <div
        v-if="
          hasElevatedRole && !showCommentEditor && comment.userId != getUserId
        "
        class="text-secondary text-end"
      >
        <a href="#" class="text-danger" @click.prevent="onEditComment"
          ><i class="bi bi-pencil-square mx-1" data-cy="admin-edit-comment"></i
          >(Admin)
        </a>
        <a
          href="#"
          class="text-danger"
          @click.prevent="deleteCommentModal.show()"
        >
          <i class="bi bi-trash mx-1" data-cy="admin-delete-comment"></i>(Admin)
        </a>
      </div>
    </div>
  </div>

  <BaseModal
    v-if="comment"
    modal-title="Kommentar löschen?"
    confirm-button-text="Löschen"
    :modal-id="comment.id"
    :confirm-action="onDeleteComment"
    :is-dangerous-action="true"
    :show-spinner="showSpinner"
    :error-message="errorMessage"
  />
</template>

<script setup>
import useAuth from "@/composables/useAuth";
import useComments from "@/composables/useComments";
import { ref, onMounted, computed } from "vue";
import { Modal } from "bootstrap";
import { createUserPictureUrl } from "../helper/profilePictureHelper";
import { activateHtmlLinks } from "../helper/utils";
import { GENERIC_ERROR } from "@/common/Constants";

const { getUserId, hasElevatedRole } = useAuth();
const { deleteComment, editComment, submitComment } = useComments();

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
});

const showSpinner = ref(false);
const errorMessage = ref(null);

const commentWithLinks = computed(() =>
  activateHtmlLinks(props.comment?.message)
);

const avatarUrl = createUserPictureUrl(props.comment?.user?.id, {
  size: "thumb",
});

// Find a way to make this reactive
const userPrefersDark = ref(
  window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
);

// Modal
const deleteCommentModal = ref(null);
onMounted(() => {
  const el = document.getElementById(props.comment?.id);
  if (el) deleteCommentModal.value = new Modal(el);
});

// Delete comment
const onDeleteComment = async () => {
  try {
    if (!deleteCommentModal.value) return;
    showSpinner.value = true;
    const res = await deleteComment(props.comment.id);
    if (res.status != 200) throw res.statusText;
    errorMessage.value = null;
    deleteCommentModal.value.hide();
  } catch (error) {
    errorMessage.value = GENERIC_ERROR;
    console.log(error);
  } finally {
    showSpinner.value = false;
  }
};

// Edit Comment
const showCommentEditor = ref(false);
const editedComment = ref(props.comment?.message);

const onEditComment = () => (showCommentEditor.value = true);

const onSaveEditedMessage = async (message) => {
  const comment = {
    message: message,
    userId: getUserId.value,
    id: props.comment.id,
  };
  try {
    showSpinner.value = true;
    const res = await editComment(comment);
    if (res.status != 200) throw res.statusText;
    closeCommentEditor();
    errorMessage.value = null;
  } catch (error) {
    console.log(error);
    errorMessage.value = GENERIC_ERROR;
  } finally {
    showSpinner.value = false;
  }
};

const closeCommentEditor = () => {
  showCommentEditor.value = false;
  editedComment.value = props.comment?.message;
};

// Submit new reply
const replyMessage = ref("");
const showReplyEditor = ref(false);

const openReplyEditor = () => (showReplyEditor.value = true);

const onSubmitReplyMessage = async (message) => {
  try {
    showSpinner.value = true;
    const res = await submitComment(message, getUserId.value, props.comment.id);
    if (res.status != 200) throw res.statusText;
    closeReplyEditor();
    errorMessage.value = null;
  } catch (error) {
    errorMessage.value = GENERIC_ERROR;
    console.log(error);
  } finally {
    showSpinner.value = false;
  }
};

const closeReplyEditor = () => {
  showReplyEditor.value = false;
  replyMessage.value = "";
};
</script>
<style lang="scss">
@import "@/styles";
// We put the import out of the scoped block to ensure that all similar imports are merged to one global import to reduce bundle size
// TODO: Should be obsolote when proper dark mode was introduced to bootstrap
.dark-reply {
  background-color: tint-color($primary, 5);
}
</style>
<style lang="scss" scoped>
.rounded-circle {
  margin-right: 6px;
  height: 24px;
  width: 24px;
}
</style>
