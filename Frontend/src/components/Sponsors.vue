<template>
  <!-- Divider -->
  <div class="bg-primary text-light p-4">
    <br />
  </div>

  <section class="sponsoren">
    <div class="container">
      <h3>Sponsoren</h3>
      <div v-for="sponsor in sponsors" :key="sponsor.id">
        {{ sponsor.name }}
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "Sponsors",

  props: {
    sponsors: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped></style>
