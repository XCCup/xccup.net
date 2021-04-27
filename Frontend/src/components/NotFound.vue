<template>
  <div class="container text-center my-5">
    <h1>Hoppla!</h1>
    <h3>Diese {{ resource }} existiert leider nicht😱</h3>
    <router-link :to="{ name: 'Home' }">Zurück zur Startseite</router-link>
  </div>
</template>
<script>
export default {
  props: {
    resource: {
      type: String,
      required: true,
      default: "Seite",
    },
  },
};
</script>
