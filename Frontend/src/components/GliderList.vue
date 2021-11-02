<template>
  <h5>Standard Gerät wählen</h5>
  <!-- <ul class="list-group">
    <li v-for="glider in gliders" :key="glider.id" class="list-group-item">
      {{ formatGliderName(glider) }}
      <i class="bi bi-pencil-square mx-1"></i>
      <i class="bi bi-trash"></i>
    </li>
  </ul> -->

  <div v-for="glider in gliders" :key="glider.id" class="form-check mt-2">
    <input
      class="form-check-input"
      type="radio"
      name="gliderSelectRadios"
      :id="glider.id"
      :value="glider.id"
      checked
    />
    <label class="form-check-label" :for="glider.id">
      {{ formatGliderName(glider) }}
      <i
        @click="onEdit"
        class="bi bi-pencil-square mx-1"
        data-bs-toggle="modal"
        data-bs-target="#addGliderModal"
      ></i>

      <i
        @click="onDelete(glider)"
        class="bi bi-trash"
        data-bs-toggle="modal"
        data-bs-target="#removeGliderModal"
      ></i>
    </label>
  </div>
  <button type="button" class="btn btn-primary mt-2 me-2">Speichern</button>
  <button
    type="button"
    class="btn btn-outline-primary mt-2"
    data-bs-toggle="modal"
    data-bs-target="#addGliderModal"
  >
    <i class="bi bi-plus"></i> Gerät hinzufügen
  </button>
  <!-- Modals -->
  <ModalAddGlider />
  <ModalRemoveGlider @remove-glider="removeGlider" :glider="selectedGlider" />
</template>

<script>
import { ref } from "vue";

import ModalAddGlider from "@/components/ModalAddGlider";
import ModalRemoveGlider from "@/components/ModalRemoveGlider";

import ApiService from "@/services/ApiService.js";

export default {
  name: "GliderSelect",
  components: { ModalAddGlider, ModalRemoveGlider },

  props: {
    gliders: {
      type: Array,
    },
  },

  setup() {
    const selectedGlider = ref(null);
    const showSpinner = ref(false);
    const onDelete = (glider) => {
      selectedGlider.value = glider;
    };
    const removeGlider = async (id) => {
      try {
        showSpinner.value = true;
        const res = await ApiService.removeGlider(id);
        if (res.status != 200) throw res.statusText;
        showSpinner.value = false;
        // Add emit "updated"
        // Close modal
      } catch (error) {
        console.error(error);
        showSpinner.value = false;
      }
    };
    const formatGliderName = (glider) =>
      glider.brand +
      " " +
      glider.model +
      " (" +
      glider.gliderClassShortDescription +
      ")";

    return { selectedGlider, formatGliderName, onDelete, removeGlider };
  },
};
</script>
