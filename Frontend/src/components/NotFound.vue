<template>
  <div class="container text-center my-5">
    <h1>Hoppla! 😱</h1>
    <h3>{{ resource }}</h3>
    <a href="#" @click="$router.go(-2)"
      ><i class="bi bi-chevron-left mx-2"> Zurück</i></a
    >
    <!-- <router-link :to="{ name: 'Home' }">Zurück zur Startseite</router-link> -->
  </div>
</template>
<script setup>
defineProps({
  resource: {
    type: String,
    default: "Diese Seite existiert leider nicht",
  },
});
</script>
