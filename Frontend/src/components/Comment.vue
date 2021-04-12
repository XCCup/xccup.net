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
    <span class="ms-auto fw-light text-secondary">{{
      format(new Date(comment.date), "dd.MM.yy")
    }}</span>
  </div>
  <p>
    {{ comment.text }}
  </p>

  <div class="text-secondary text-end">
    <a href="#"><i class="bi bi-pencil-square mx-1"></i>Bearbeiten</a>
    <a href="#"><i class="bi bi-trash mx-1"></i>Löschen</a>
  </div>
</template>

<script>
import { format } from "date-fns";
export default {
  name: "Comment",
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      format,
    };
  },
};
</script>
