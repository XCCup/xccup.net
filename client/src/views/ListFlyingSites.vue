<template>
  <div v-if="sites" class="container-lg">
    <h3>Fluggebietsübersicht</h3>
    <div v-if="loggedIn">
      <p>Du vermisst ein Gelände? Dann mache uns einen Vorschlag.</p>
      <button
        type="button"
        class="col btn btn-primary btn-sm me-1 mb-3"
        data-cy="add-site-button"
        @click="onAddSite"
      >
        Fluggebiet vorschlagen
        <i class="bi bi-send-plus"></i>
      </button>
    </div>
    <FlyingSiteMap :sites="sites" />
  </div>
  <ModalAddFlyingSite ref="addModal" />
</template>

<script setup>
import { ref } from "vue";
import ApiService from "@/services/ApiService";
import { setWindowName } from "../helper/utils";
import FlyingSiteMap from "../components/FlyingSiteMap.vue";
import useUser from "@/composables/useUser";

const { loggedIn } = useUser();

const addModal = ref(null);
const onAddSite = () => {
  addModal.value.show();
};

const sites = ref([]);

setWindowName("Fluggebietsübersicht");

try {
  const res = await ApiService.getSites();
  if (res.status != 200) throw res.status.text;
  sites.value = res.data;
} catch (error) {
  console.error(error);
}
</script>
