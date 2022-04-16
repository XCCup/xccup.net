<template>
  <div class="border rounded shadow p-3 mb-3">
    <div class="d-flex mb-2"></div>
    <div class="mb-3">
      <div v-if="loggedIn">
        <form @submit.prevent="onSubmitComment">
          <label for="comment-editor" class="form-label">
            Kommentar verfassen:
          </label>

          <TextEditor v-model="message" @change="saveMessageToLocalStorage" />
          <button
            class="btn btn-primary me-1"
            type="submit"
            :disabled="sendButtonIsDisabled"
            data-cy="submit-comment-button"
          >
            Senden
          </button>
        </form>
      </div>
      <div v-else>
        Du musst angemeldet sein um einen Kommentar zu verfassen.
        <BaseLogin :prevent-redirect="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import useUser from "@/composables/useUser";
import useComments from "@/composables/useComments";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";

const { getUserId, loggedIn } = useUser();
const { submitComment } = useComments();

const route = useRoute();

const LOCAL_STORAGE_COMMENT_ITEM_KEY = "commentMessage";

// Submit comment
const message = ref("");
const sendButtonIsDisabled = computed(() => !message.value.trim().length);

const onSubmitComment = async () => {
  try {
    const res = await submitComment(message.value, getUserId.value);
    if (res.status != 200) throw res.statusText;
    clearCommentEditorInput();
  } catch (error) {
    // TODO: Do something
    console.log(error);
  }
};

// Local Storage
onMounted(() => (message.value = getMessageFromLocalStorage()));

const clearCommentEditorInput = () => {
  message.value = "";
  removeMessageFromLocalStorage();
};

const saveMessageToLocalStorage = () => {
  localStorage.setItem(
    LOCAL_STORAGE_COMMENT_ITEM_KEY,
    JSON.stringify({
      message: message.value,
      flightId: route.params.flightId,
    })
  );
};
const removeMessageFromLocalStorage = () => {
  localStorage.removeItem(LOCAL_STORAGE_COMMENT_ITEM_KEY);
};
const getMessageFromLocalStorage = () => {
  if (localStorage.getItem(LOCAL_STORAGE_COMMENT_ITEM_KEY) === null) {
    return "";
  } else {
    const { message, flightId } = JSON.parse(
      localStorage.getItem(LOCAL_STORAGE_COMMENT_ITEM_KEY)
    );
    // Check if the comment in local storage belongs to this flight
    if (flightId === route.params.flightId) {
      return message;
    } else {
      return "";
    }
  }
};
</script>
