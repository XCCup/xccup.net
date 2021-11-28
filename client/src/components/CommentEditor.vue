<template>
  <div id="comment-editor" class="shadow p-3 mb-3">
    <div class="d-flex mb-2"></div>
    <div class="mb-3">
      <div v-if="loggedIn">
        <form @submit.prevent="onSubmitComment">
          <label for="comment-editor" class="form-label"
            >Kommentar verfassen:</label
          >

          <textarea
            id="comment-editor"
            v-model="message"
            class="form-control mb-2"
            :rows="3"
            @input="saveMessageToLocalStorage"
          ></textarea>
          <button
            class="btn btn-primary me-1"
            type="submit"
            :disabled="sendButtonIsDisabled"
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

// Sumbit comment
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
</script>
