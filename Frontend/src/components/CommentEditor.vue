<template>
  <div class="shadow p-3 mb-3">
    <div class="d-flex mb-2"></div>
    <div class="mb-3">
      <div v-if="loggedIn">
        <form @submit.prevent="onSubmit">
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
        <BaseLogin />
      </div>
    </div>
  </div>
</template>

<script setup>
import useUser from "@/composables/useUser";
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
const { getUserId, loggedIn } = useUser();
const emit = defineEmits(["submitComment"]);
const route = useRoute();

const message = ref("");

const sendButtonIsDisabled = computed(() => message.value.length < 3);

onMounted(() => (message.value = getMessageFromLocalStorage()));

const onSubmit = () => {
  const comment = {
    message: message.value,
    userId: getUserId,
  };
  emit("submitComment", comment);
};
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
defineExpose({
  clearCommentEditorInput,
});
</script>
