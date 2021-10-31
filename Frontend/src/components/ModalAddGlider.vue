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
          <button type="button" class="btn btn-primary" @click="addGlider">
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

import { ref } from "vue";

export default {
  name: "ModalAddGlider",
  async setup() {
    try {
      const { data: initalBrands } = await ApiService.getBrands();
      const { data: initialGliderClasses } =
        await ApiService.getGliderClasses();

      return {
        brands: ref(initalBrands),
        gliderClasses: ref(initialGliderClasses),
      };
    } catch (error) {
      console.log(error);
    }
  },

  data() {
    return {
      glider: {
        brand: "",
        model: "",
        gliderClass: "",
      },
      showSpinner: false,
    };
  },
  methods: {
    async addGlider() {
      try {
        this.showSpinner = true;
        const res = await ApiService.addGlider(this.glider);
        if (res.status != 200) throw res.statusText;
        this.showSpinner = false;
      } catch (error) {
        console.error(error);
        this.showSpinner = false;
      }
    },
  },
};
</script>
