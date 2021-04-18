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
          v-model="text"
          :rows="3"
        ></textarea>
        <button class="btn btn-primary me-1" type="submit">Senden</button>
        <button class="btn btn-outline-danger mx-1" type="reset">
          Löschen
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "CommentEditor",

  data() {
    return {
      text: "",
    };
  },
  computed: {
    ...mapGetters(["authUser"]),
  },
  methods: {
    onSubmit() {
      let comment = {
        text: this.text,
        pilotId: this.authUser.id,
        name: this.authUser.name,
        date: Date.now(),
      };
      this.$emit("comment-submitted", comment);
      this.text = "";
    },
  },
  emits: ["comment-submitted"],
};
</script>
