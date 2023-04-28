<template>
  <TheNavbar />
  <main class="flex-shrink-0 flex-grow-1 position-relative">
    <GenericError v-if="error" />
    <router-view v-else v-slot="{ Component }">
      <keep-alive :max="1" :include="componentsToKeepAlive">
        <template v-if="Component">
          <suspense timeout="500" @pending="start" @resolve="done">
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
      </keep-alive>
    </router-view>
  </main>
  <TheFooter />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from "vue";
import { useNProgress } from "@vueuse/integrations/useNProgress";
import "nprogress/nprogress.css";
import { leafletMarkerRetinaFix } from "@/helper/leafletRetinaMarkerFix";
import { determineColorMode } from "@/helper/colorModeToggler";

// Global fix for default marker image paths
leafletMarkerRetinaFix();

determineColorMode();

const { start, done } = useNProgress(null, { showSpinner: false });

const error = ref<Error | null>(null);
onErrorCaptured((e) => {
  error.value = e;
  console.log(e);
  return true;
});

// Prevents fetching data again & clearing filters when navigating back
const componentsToKeepAlive = [
  "FlightsAll",
  "ResultsOverall",
  "ResultsTeams",
  "ResultsNewcomer",
  "ResultsSeniors",
  "ResultsLadies",
  "ResultsRlp",
  "ResultsLux",
];
</script>

<style lang="scss">
@import "@/styles";
</style>
