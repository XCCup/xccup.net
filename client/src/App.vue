<template>
  <TheNavbar />
  <main class="flex-shrink-0 flex-grow-1 position-relative">
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
            <div class="position-absolute top-50 start-50 translate-middle">
              <div
                class="spinner-border text-primary"
                style="width: 5rem; height: 5rem"
                role="status"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </template>
        </suspense>
      </template>
    </router-view>
  </main>
  <TheFooter />
</template>

<script setup>
import { ref, onErrorCaptured } from "vue";

const error = ref(null);
onErrorCaptured((e) => {
  error.value = e;
  return true;
});
</script>

<style lang="scss">
@import "@/styles/style";
</style>
