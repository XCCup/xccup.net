<template>
  <div class="d-flex mb-2">
    <img
      src="@/assets/images/avatar2.png"
      class="rounded-circle"
      style="margin-right: 6px"
      height="24"
      width="24"
    />
    <a href="#">{{ comment.name }}</a>
    <span class="ms-auto fw-light text-secondary"
      ><BaseDate :timestamp="comment.date" dateFormat="dd.MM.yyyy"
    /></span>
  </div>
  <p>
    {{ comment.text }}
  </p>
  <div v-if="comment.pilotId === authUser.id" class="text-secondary text-end">
    <a href="#"> <i class="bi bi-pencil-square mx-1"></i>Bearbeiten</a>
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
      this.$emit("comment-deleted", this.comment.id);
    },
  },
  computed: {
    ...mapGetters(["authUser"]),
  },
  emits: ["comment-deleted"],
};
</script>
