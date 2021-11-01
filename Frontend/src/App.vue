<template>
  <TheNavbar />
  <div v-if="error" class="error-message">Uh oh .. {{ error }}</div>
  <router-view v-else v-slot="{ Component }">
    <template v-if="Component">
      <suspense timeout="500">
        <template #default>
          <!-- 
          :key="$route.path" is neccesary to re-render and fetch API when 
          URL props changed. See https://notestack.io/public/force-reload-of-vue-component-with-dynamic-route-parameters/f62f3c66-e77b-494e-b120-bf0ddefe0522
          and https://router.vuejs.org/guide/essentials/dynamic-matching.html#reacting-to-params-changes
          for details.
          TODO: Is there a better way to do this?
          -->
          <!-- Main thing to show -->
          <component :is="Component" :key="$route.path"></component>
        </template>
        <template #fallback>
          <BaseSpinner />
        </template>
      </suspense>
    </template>
  </router-view>
  <TheFooter />
</template>

<script>
import TheNavbar from "@/components/TheNavbar.vue";
import TheFooter from "@/components/TheFooter";
import { ref, onErrorCaptured } from "vue";

export default {
  name: "App",
  components: {
    TheNavbar,
    TheFooter,
  },
  setup() {
    const error = ref(null);
    onErrorCaptured((e) => {
      error.value = e;
      return true;
    });
    return { error };
  },
};
</script>

<style lang="scss">
// Include custom variable default overrides here
$primary: #08556d;
$table-bg-scale: 0;
$form-check-input-width: 1.1em;

$table-striped-bg-factor: 0.05;
$table-striped-bg: rgba($primary, $table-striped-bg-factor);

@import "../node_modules/bootstrap/scss/bootstrap";
@import url("https://cdn.jsdelivr.net/npm/bootstrap-icons@1.4.0/font/bootstrap-icons.css");
@import "scss/rankingClasses";
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
  height: 22vh;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

.error-message {
  height: 60vh;
}

// TODO: Is this obsolete?
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
