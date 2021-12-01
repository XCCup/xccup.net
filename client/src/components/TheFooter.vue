<template>
  <footer class="footer p-3 text-light bg-primary mt-auto">
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

<script setup></script>
