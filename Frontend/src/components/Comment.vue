<template>
  <div class="d-flex mb-2">
    <img
      src="@/assets/images/avatar2.png"
      class="rounded-circle"
      style="margin-right: 6px"
      height="24"
      width="24"
    />
    <a href="#">{{ comment.User.name }}</a>
    <span class="ms-auto fw-light text-secondary"
      ><BaseDate :timestamp="comment.createdAt" dateFormat="dd.MM.yyyy"
    /></span>
  </div>
  <p>
    {{ comment.message }}
  </p>
  <div v-if="comment.userID === getterUserId" class="text-secondary text-end">
    <a href="#" @click.prevent="editComment"
      ><i class="bi bi-pencil-square mx-1"></i>Bearbeiten</a
    >
    <a href="#" @click.prevent="deleteComment">
      <i class="bi bi-trash mx-1"></i>Löschen
    </a>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Comment",
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
  methods: {
    deleteComment() {
      this.$emit("delete-comment", this.comment.id);
    },
    editComment() {
      console.log("edit clicked");
    },
  },
  computed: {
    ...mapGetters("auth", {
      getterUserId: "getUserId",
    }),
  },
  emits: ["delete-comment"],
};
</script>
