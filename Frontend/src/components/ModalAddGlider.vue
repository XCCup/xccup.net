<template>
  <div
    class="modal fade"
    id="addGliderModal"
    tabindex="-1"
    aria-labelledby="addAircraftModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addAircraftModalLabel">
            Fluggerät hinzufügen
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <BaseSelect
            v-model="glider.brand"
            :options="brands"
            label="Hersteller"
          />
          <div class="mb-3"></div>
          <BaseInput v-model="glider.model" label="Fluggerät" />

          <select class="form-select" v-model="glider.gliderClass">
            <option disabled value="" selected>Geräteklasse</option>
            <option
              v-for="(gliderClass, classKey) in gliderClasses"
              :value="classKey"
              :key="classKey"
            >
              {{ gliderClass.description }}
            </option>
          </select>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="onAddGlider"
            :disabled="!saveButtonIsEnabled"
          >
            Speichern
            <div
              v-if="showSpinner"
              class="spinner-border spinner-border-sm"
              role="status"
            >
              <span class="visually-hidden">Loading...</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ApiService from "@/services/ApiService.js";

import { ref, computed, reactive } from "vue";

export default {
  name: "ModalAddGlider",
  emits: ["add-glider"],

  async setup(props, { emit }) {
    const glider = reactive({
      brand: "",
      model: "",
      gliderClass: "",
    });
    const showSpinner = ref(false);
    const brands = ref(null);
    const gliderClasses = ref(null);
    const saveButtonIsEnabled = computed(() => {
      return (
        (glider.model.length > 2) &
        (glider.brand != "") &
        (glider.gliderClass != "")
      );
    });

    try {
      brands.value = (await ApiService.getBrands()).data;
      gliderClasses.value = (await ApiService.getGliderClasses()).data;
    } catch (error) {
      console.log(error);
    }

    const onAddGlider = () => {
      emit("add-glider", glider);
    };
    return {
      brands,
      gliderClasses,
      glider,
      showSpinner,
      onAddGlider,
      saveButtonIsEnabled,
    };
  },
};
</script>
