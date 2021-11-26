<template>
  <div id="upload" class="container">
    <h3>Flug bearbeiten</h3>
    <!-- Glider select -->
    <div class="col-md-12">
      <div class="row d-flex align-items-end">
        <div class="col-md-9">
          <GliderSelect
            v-model="defaultGlider"
            label="Fluggerät"
            :show-label="true"
            :gliders="listOfGliders"
          />
        </div>
        <div class="col-md-3 mt-3">
          <router-link :to="{ name: 'ProfileGliderList' }" class="d-grid gap-2">
            <button type="button" class="btn btn-primary">
              Liste bearbeiten
            </button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import useUser from "@/composables/useUser";
import useFlight from "@/composables/useFlight";
import { getbaseURL } from "@/helper/base-url-helper";
import ApiService from "@/services/ApiService";
import { useRoute } from "vue-router";

const route = useRoute();

const { flight, fetchOne } = useFlight();

fetchOne(route.params.id);
const listOfGliders = ref(null);
try {
  const res = await ApiService.getGliders();
  if (res.status != 200) throw res.statusText;
  listOfGliders.value = res.data.gliders;
  // defaultGlider: ref(initialData.defaultGlider),
} catch (error) {
  console.log(error);
}
</script>

<style scoped></style>
