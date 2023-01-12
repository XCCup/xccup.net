<template>
  <footer class="footer p-3 text-light bg-primary mt-auto">
    <p class="float-end"><a href="#">Nach oben</a></p>
    <p>
      © XCCup {{ new Date().getFullYear() }} ·
      <router-link :to="{ name: 'Privacy' }" class="link-secondary"
        >Datenschutz
      </router-link>
      ·
      <router-link :to="{ name: 'Imprint' }" class="link-secondary"
        >Impressum
      </router-link>
      ·
      <a href="https://github.com/XCCup/xccup.net"
        ><i class="bi bi-github link-secondary"></i
      ></a>
    </p>
  </footer>
</template>
