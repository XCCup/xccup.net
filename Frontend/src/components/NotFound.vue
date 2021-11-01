<template>
  <div class="container text-center my-5">
    <h1>Hoppla!</h1>
    <h3>{{ resource }}</h3>
    <router-link :to="{ name: 'Home' }">Zurück zur Startseite</router-link>
  </div>
</template>
<script>
export default {
  props: {
    resource: {
      type: String,
      required: false,
      default: "Diese Seite existiert leider nicht 😱",
    },
  },
};
</script>
