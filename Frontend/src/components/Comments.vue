<template>
  <div class="container">
    <div class="shadow p-3 mb-3" v-for="comment in comments" :key="comment.id">
      <div class="d-flex mb-2">
        <img
          src="@/assets/images/avatar2.png"
          class="rounded-circle"
          style="margin-right: 6px"
          height="24"
          width="24"
        />
        <a href="#">{{ comment.name }}</a>
        <span class="ms-auto fw-light text-secondary">{{ comment.date }}</span>
      </div>
      <p>
        {{ comment.comment }}
      </p>

      <div class="text-secondary text-end">
        <a href="#"><i class="bi bi-pencil-square mx-1"></i>Bearbeiten</a>
        <a href="#"><i class="bi bi-trash mx-1"></i>Löschen</a>
      </div>
    </div>

    <!-- New comment -->
    <div class="shadow p-3 mb-3">
      <div class="d-flex mb-2"></div>
      <div class="mb-3">
        <label for="exampleFormControlTextarea1" class="form-label"
          >Kommentar verfassen:</label
        >
        <textarea
          class="form-control"
          id="exampleFormControlTextarea1"
          rows="3"
        ></textarea>
      </div>
      <button class="btn btn-primary me-1">Senden</button>
      <button class="btn btn-outline-danger mx-1">Löschen</button>
    </div>
  </div>
</template>

<script>
export default {
  name: "Comments",
  props: {
    comments: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped></style>
