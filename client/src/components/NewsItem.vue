<template>
  <div class="col d-flex align-items-start">
    <div class="flex-shrink-0 me-3">
      <i class="bi bi-alarm fs-2"></i>
      <!-- <svg class="bi" width="1em" height="1em">
            <use xlink:href="#toggles2"></use>
          </svg> -->
    </div>
    <div>
      <h2>{{ newsItem.title }}</h2>
      <p v-snip="5">{{ newsItem.message }}</p>
      <a href="#" class="btn btn-primary">Foo? Bar!</a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  newsItem: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped></style>
