<template>
  <h5>Standard Gerät wählen</h5>
  <div v-for="glider in gliders" :key="glider.id" class="form-check mt-2">
    <input
      class="form-check-input"
      type="radio"
      name="gliderSelectRadios"
      v-model="selectedDefaultGlider"
      :id="glider.id"
      :value="glider.id"
      :checked="glider.id === defaultGlider"
      @change="updateDefaultGlider"
    />
    <!-- TODO: Make icons appear as link -->
    <label class="form-check-label" :for="glider.id">
      {{ formatGliderName(glider) }}
      <!-- <i @click="onEdit" class="bi bi-pencil-square mx-1"></i> -->

      <i @click="onDelete(glider)" class="bi bi-trash"></i>
    </label>
  </div>
  <button @click="onAdd" type="button" class="btn btn-outline-primary mt-2">
    <i class="bi bi-plus"></i> Gerät hinzufügen
  </button>
  <!-- Modals -->
  <ModalAddGlider @add-glider="addGlider" />
  <ModalConfirm @confirm-result="removeGlider" :messageBody="removeMessage" />
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
    },
    defaultGlider: {
      type: String,
    },
  },
  emits: ["gliders-changed"],

  setup(props, { emit }) {
    const selectedGlider = ref(null);
    const showSpinner = ref(false);

    const removeMessage = computed(()=>{
      return `${selectedGlider.value?.brand} ${selectedGlider.value?.model} entfernen`
    })

    // Remove Glider
    // TODO: Should this be a ref?
    let removeGliderModal = null;
    const onDelete = (glider) => {
      selectedGlider.value = glider;
      removeGliderModal.show();
    };
    const removeGlider = async (result) => {
      if(result){
        try {
          showSpinner.value = true;
          const res = await ApiService.removeGlider(selectedGlider.value.id);
          if (res.status != 200) throw res.statusText;
          showSpinner.value = false;
          emit("gliders-changed", res.data.gliders);
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
        emit("gliders-changed", res.data.gliders);
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
      glider.gliderClassShortDescription +
      ")";

    onMounted(() => {
      removeGliderModal = new Modal(
        document.getElementById("confirmModal")
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
