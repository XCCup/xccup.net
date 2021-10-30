<template>
  <footer class="p-3 text-light bg-primary m-0">
    <p class="float-end"><a href="#">Nach oben</a></p>
    <p>
      © XCCup 2021 ·
      <router-link :to="{ name: 'Privacy' }">Datenschutz </router-link> ·
      <router-link :to="{ name: 'Imprint' }">Impressum </router-link> ·
      <a href="https://github.com/XCCup/xccup.net"
        ><i class="bi bi-github"></i
      ></a>
    </p>
  </footer>
</template>

<script>
export default {
  name: "TheFooter",
};
</script>
