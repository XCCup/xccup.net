<template>
  <footer class="footer p-3 text-light bg-primary mt-auto">
    <p class="float-end"><a href="#" class="link-light">Nach oben</a></p>
    <p>
      © XCCup {{ new Date().getFullYear() }} ·
      <router-link :to="{ name: 'Privacy' }" class="link-light"
        >Datenschutz
      </router-link>
      ·
      <router-link :to="{ name: 'Imprint' }" class="link-light"
        >Impressum
      </router-link>
      ·
      <a href="https://github.com/XCCup/xccup.net" class="link-light"
        ><i class="bi bi-github"></i
      ></a>
    </p>
  </footer>
</template>

<script setup></script>

<style lang="scss"></style>
