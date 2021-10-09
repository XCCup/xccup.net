<template>
  <div class="shadow p-3 mb-3">
    <div class="d-flex mb-2"></div>
    <div class="mb-3">
      <form @submit.prevent="onSubmit">
        <label for="comment-editor" class="form-label"
          >Kommentar verfassen:</label
        >
        <textarea
          class="form-control mb-2"
          id="comment-editor"
          v-model="message"
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
      <!-- TODO: Remove for production -->
      Debug information: Login status: {{ getLoginStatus }} Token active?
      {{ isTokenActive }}
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "CommentEditor",

  data() {
    return {
      message: "",
    };
  },
  computed: {
    ...mapGetters(["getUserId", "getLoginStatus", "isTokenActive"]),

    sendButtonIsDisabled() {
      return this.message.length < 5;
    },
  },
  mounted() {
    this.message = this.getMessageFromLocalStorage();
  },
  methods: {
    onSubmit() {
      const comment = {
        message: this.message,
        userId: this.getUserId,
      };
      this.$emit("submit-comment", comment);
    },
    clearCommentEditorInput() {
      this.message = "";
      this.removeMessageFromLocalStorage();
    },
    saveMessageToLocalStorage() {
      localStorage.setItem(
        "commentMessage",
        JSON.stringify({
          message: this.message,
          flightId: this.$route.params.flightId,
        })
      );
    },
    removeMessageFromLocalStorage() {
      localStorage.removeItem("commentMessage");
    },
    getMessageFromLocalStorage() {
      if (localStorage.getItem("commentMessage") === null) {
        return "";
      } else {
        const { message, flightId } = JSON.parse(
          localStorage.getItem("commentMessage")
        );
        // Check if the comment in local storage belongs to this flight
        if (flightId === this.$route.params.flightId) {
          return message;
        } else {
          return "";
        }
      }
    },
  },
  emits: ["submit-comment"],
};
</script>
