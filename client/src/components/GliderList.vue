<template>
  <h5>Standard Gerät wählen</h5>
  <div v-for="glider in gliders" :key="glider.id" class="form-check mt-2">
    <input
      :id="glider.id"
      v-model="selectedDefaultGlider"
      class="form-check-input"
      type="radio"
      name="gliderSelectRadios"
      :value="glider.id"
      :checked="glider.id === defaultGlider"
      @change="updateDefaultGlider"
    />
    <label class="form-check-label" :for="glider.id">
      {{ formatGliderName(glider) }}
      <a href="#" @click.prevent="onDelete(glider)">
        <i class="bi bi-trash"></i>
      </a>
    </label>
  </div>

  <button type="button" class="btn btn-outline-primary mt-2" @click="onAdd">
    <i class="bi bi-plus"></i> Gerät hinzufügen
  </button>
  <!-- Modals -->
  <ModalAddGlider @add-glider="addGlider" />
  <BaseModal
    modal-title="Kommentar löschen?"
    :modal-body="removeMessage"
    confirm-button-text="Löschen"
    modal-id="removeGliderModal"
    :confirm-action="removeGlider"
  />
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { Modal } from "bootstrap";

import ApiService from "@/services/ApiService.js";

export default {
  name: "GliderSelect",
  props: {
    gliders: {
      type: Array,
      required: true,
    },
    defaultGlider: {
      type: String,
      required: true,
    },
  },
  emits: ["gliders-changed"],

  setup(props, { emit }) {
    const selectedGlider = ref(null);
    const showSpinner = ref(false);

    const removeMessage = computed(() => {
      return `${selectedGlider.value?.brand} ${selectedGlider.value?.model} entfernen`;
    });

    // Remove Glider
    // TODO: Should this be a ref?
    let removeGliderModal = null;
    const onDelete = (glider) => {
      selectedGlider.value = glider;
      removeGliderModal.show();
    };
    const removeGlider = async (result) => {
      if (result) {
        try {
          showSpinner.value = true;
          const res = await ApiService.removeGlider(selectedGlider.value.id);
          if (res.status != 200) throw res.statusText;
          showSpinner.value = false;
          emit("gliders-changed", res.data);
          removeGliderModal.hide();
        } catch (error) {
          // TODO: Handle error
          console.error(error);
          showSpinner.value = false;
        }
      }
    };
    // Add glider
    let addGliderModal = null;
    const onAdd = () => {
      addGliderModal.show();
    };
    const addGlider = async (glider) => {
      try {
        showSpinner.value = true;
        const res = await ApiService.addGlider(glider);
        if (res.status != 200) throw res.statusText;
        showSpinner.value = false;
        emit("gliders-changed", res.data);
        addGliderModal.hide();
      } catch (error) {
        // TODO: Handle error
        console.error(error);
        showSpinner.value = false;
      }
    };
    // Update default glider
    const selectedDefaultGlider = ref(null);
    const updateDefaultGlider = async () => {
      try {
        const res = await ApiService.setDefaultGlider(
          selectedDefaultGlider.value
        );
        if (res.status != 200) throw res.statusText;
      } catch (error) {
        // TODO: Handle error
        console.error(error);
      }
    };
    const formatGliderName = (glider) =>
      glider.brand +
      " " +
      glider.model +
      " (" +
      glider.gliderClass.shortDescription +
      ")";

    onMounted(() => {
      removeGliderModal = new Modal(
        document.getElementById("removeGliderModal")
      );
      addGliderModal = new Modal(document.getElementById("addGliderModal"));
    });
    return {
      selectedGlider,
      removeMessage,
      formatGliderName,
      onDelete,
      removeGlider,
      onAdd,
      addGlider,
      updateDefaultGlider,
      selectedDefaultGlider,
    };
  },
};
</script>
