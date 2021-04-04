<template>
  <NavBar />
  <router-view v-slot="{ Component }">
    <template v-if="Component">
      <suspense>
        <component :is="Component"></component>
        <template #fallback>
          <div class="d-flex justify-content-center">
            <div class="spinner-border text-primary m-5" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </template>
      </suspense>
    </template>
  </router-view>
  <Footer />
</template>

<script>
import NavBar from "@/components/NavBar.vue";
import Footer from "@/components/Footer";

export default {
  name: "App",
  components: {
    NavBar,
    Footer,
  },
};
</script>

<style lang="scss">
// Include custom variable default overrides here
$primary: #08556d;

$table-striped-bg-factor: 0.05;
$table-striped-bg: rgba($primary, $table-striped-bg-factor);

@import "../node_modules/bootstrap/scss/bootstrap";
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.0/font/bootstrap-icons.css");
@import "scss/wertungsklassen";
html,
body {
  height: 100%;
  width: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
}

// #app {
//   font-family: Avenir, Helvetica, Arial, sans-serif;
//   -webkit-font-smoothing: antialiased;
//   -moz-osx-font-smoothing: grayscale;
//   text-align: center;
//   color: #2c3e50;
// }

h3 {
  margin-bottom: 1rem;
  margin-top: 1rem;
}
h5 {
  margin-top: 1rem;
}

a {
  text-decoration: none;
}
footer {
  a {
    color: $light;
  }
  a:hover {
    color: $secondary;
  }
}
.alert {
  border-radius: 0 !important;
}

.text-light {
  a {
    color: $light;
  }
  a:hover {
    color: $secondary;
  }
}
.flight-info {
  background-color: darken($primary, 5%);
}

.header-image {
  background-image: url("assets/images/rachtig.jpg");
  height: 250px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

// Fix for responsive scaling of barogramm
// .barogramm-container {
//   position: relative;
//   margin: auto;
//   height: 20vh;
//   width: 100%;
// }

@media (max-width: 992px) {
}

@media (max-width: 786px) {
}

@media (max-width: 576px) {
}

// Extra small devices (portrait phones, less than 576px)
// No media query since this is the default in Bootstrap

// Small devices (landscape phones, 576px and up)
@media (min-width: 576px) {
}

// Medium devices (tablets, 768px and up)
@media (min-width: 768px) {
}

// Large devices (desktops, 992px and up)
@media (min-width: 992px) {
}

// Extra large devices (large desktops, 1200px and up)
@media (min-width: 1200px) {
}
</style>
