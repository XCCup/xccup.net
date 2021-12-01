<!-- TODO: It may be possible to replace this modal with BaseModal and slots -->
<template>
  <div
    id="addGliderModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="addAircraftModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="addAircraftModalLabel" class="modal-title">
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
            v-model="newGlider.brand"
            :options="brands"
            label="Hersteller"
          />
          <div class="mb-3"></div>
          <BaseInput v-model="newGlider.model" label="Fluggerät" />

          <select v-model="newGlider.gliderClass" class="form-select">
            <option disabled value="" selected>Geräteklasse</option>
            <option
              v-for="(gliderClass, classKey) in gliderClasses"
              :key="classKey"
              :value="classKey"
            >
              {{ gliderClass.description }}
            </option>
          </select>
        </div>
        <div class="modal-footer">
          <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>

          <button
            type="button"
            class="btn btn-primary"
            :disabled="!saveButtonIsEnabled"
            @click="onAddGlider"
          >
            Speichern
            <BaseSpinner v-if="showSpinner" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";
import { ref, computed, reactive } from "vue";

const emit = defineEmits(["add-glider"]);

defineProps({
  showSpinner: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: [String, null],
    default: null,
  },
});

const newGlider = reactive({
  brand: "",
  model: "",
  gliderClass: "",
});

// Fetch data

const brands = ref(null);
const gliderClasses = ref(null);

try {
  brands.value = (await ApiService.getBrands()).data;
  gliderClasses.value = (await ApiService.getGliderClasses()).data;
} catch (error) {
  console.log(error);
}

const saveButtonIsEnabled = computed(() => {
  return (
    (newGlider.model.length > 2) &
    (newGlider.brand != "") &
    (newGlider.gliderClass != "")
  );
});

const onAddGlider = () => {
  emit("add-glider", newGlider);
};
</script>
