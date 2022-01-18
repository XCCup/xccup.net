<template>
  <div class="border rounded shadow p-3 mb-3">
    <div class="d-flex mb-2"></div>
    <div class="mb-3">
      <div v-if="loggedIn">
        <form @submit.prevent="onSubmitComment">
          <label for="comment-editor" class="form-label">
            Kommentar verfassen:
          </label>

          <div class="dropend my-2">
            <button
              id="dropdownMenuButton1"
              class="btn btn-secondary btn-sm dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              data-bs-auto-close="outside"
              aria-expanded="false"
            >
              <i class="bi bi-emoji-smile"></i>
            </button>
            <div class="dropdown-menu">
              <VuemojiPicker @emoji-click="handleEmojiClick" />
            </div>
          </div>

          <textarea
            ref="ta"
            v-model="message"
            class="form-control mb-2"
            :rows="4"
            data-cy="comment-editor"
            @input="saveMessageToLocalStorage"
          ></textarea>
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
import { VuemojiPicker } from "vuemoji-picker";

const { getUserId, loggedIn } = useUser();
const { submitComment } = useComments();

const route = useRoute();

// Submit comment
const message = ref("");
const sendButtonIsDisabled = computed(() => message.value.length < 3);

const onSubmitComment = async () => {
  const comment = {
    message: message.value,
    userId: getUserId.value,
  };
  try {
    const res = await submitComment(comment);
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
    "commentMessage",
    JSON.stringify({
      message: message.value,
      flightId: route.params.flightId,
    })
  );
};
const removeMessageFromLocalStorage = () => {
  localStorage.removeItem("commentMessage");
};
const getMessageFromLocalStorage = () => {
  if (localStorage.getItem("commentMessage") === null) {
    return "";
  } else {
    const { message, flightId } = JSON.parse(
      localStorage.getItem("commentMessage")
    );
    // Check if the comment in local storage belongs to this flight
    if (flightId === route.params.flightId) {
      return message;
    } else {
      return "";
    }
  }
};

// Emoji Picker
const ta = ref(null);
const handleEmojiClick = (detail) => {
  if (!detail.unicode) return;
  try {
    ta.value.focus();
    ta.value.setRangeText(
      detail.unicode,
      ta.value.selectionStart,
      ta.value.selectionStart,
      "end"
    );
    // Somehow changing the value of the textarea does not update the ref value
    message.value = ta.value.value;
  } catch (error) {
    console.log(error);
  }
};
</script>
