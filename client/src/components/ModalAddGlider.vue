<!-- TODO: It may be possible to replace this modal with BaseModal and slots -->
<template>
  <div
    id="addGliderModal"
    ref="_modal"
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
            id="brand-select"
            v-model="newGlider.brand"
            :options="brands"
            label="Hersteller"
          />
          <div class="mb-3"></div>
          <BaseInput
            id="glider-name"
            v-model="newGlider.model"
            label="Fluggerät"
          />

          <select
            id="ranking-class-select"
            v-model="newGlider.gliderClass"
            class="form-select mb-3"
          >
            <option disabled value selected>Geräteklasse</option>
            <option
              v-for="(gliderClass, classKey) in gliderClasses"
              :key="classKey"
              :value="classKey"
            >
              {{ gliderClass.description }}
            </option>
          </select>
          <div v-if="reynoldsClassIsEnabled" class="form-check">
            <input
              id="reynolds-check-box"
              v-model="newGlider.reynoldsClass"
              class="form-check-input"
              type="checkbox"
            />
            <label class="form-check-label" for="reynolds-check-box">
              Leichtgewichtswertung <FeatherIcon />
            </label>
            <p>
              <router-link :to="{ name: 'Rules', hash: '#reynolds-class' }"
                >Startgewicht max. 85kg
              </router-link>
            </p>
          </div>
        </div>
        <div class="modal-footer">
          <BaseError id="loginErrorMessage" :error-message="errorMessage" />

          <button
            type="button"
            class="btn btn-primary"
            :disabled="!saveButtonIsEnabled"
            data-cy="save-new-glider-button"
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
import ApiService from "@/services/ApiService";
import { ref, computed, reactive, onMounted, onUnmounted } from "vue";
import { Modal } from "bootstrap";
import { useRoute } from "vue-router";

const route = useRoute();

const emit = defineEmits(["add-glider"]);

// defineProps<{
//   showSpinner?: boolean;
//   errorMessage?: string;
// }>();

// const _modal = ref();
// const modal = ref<Modal | null>();
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
const _modal = ref(null);
const modal = ref(null);

onMounted(() => {
  modal.value = new Modal(_modal.value);
});

onUnmounted(() => modal.value?.hide());

const show = () => modal.value?.show();
const hide = () => modal.value?.hide();

defineExpose({ show, hide });

const newGlider = reactive({
  brand: "",
  model: "",
  gliderClass: "",
  reynoldsClass: false,
});

// TODO: Introduce common types between backend and client as these are duplicate type definitions

// type GliderClass =
//   | "AB_low"
//   | "AB_high"
//   | "C_low"
//   | "C_high"
//   | "D_low"
//   | "D_high"
//   | "Tandem"
//   | "HG_1_Turm"
//   | "HG_1_Turmlos"
//   | "HG_5_starr";

// type GliderClasses = {
//   [key in GliderClass]: {
//     scoringMultiplicator: {
//       BASE: number;
//       FREE: number;
//       FLAT: number;
//       FAI: number;
//     };
//     description: string;
//     shortDescription: string;
//   };
// };

// Fetch data
const brands = ref(null);
const gliderClasses = ref(null);
// const brands = ref<string[] | undefined>();
// const gliderClasses = ref<GliderClasses | undefined>();

try {
  [brands.value, gliderClasses.value] = (
    await Promise.all([ApiService.getBrands(), ApiService.getGliderClasses()])
  ).map(({ data }) => data);
} catch (error) {
  console.log(error);
}

const saveButtonIsEnabled = computed(() => {
  return (
    newGlider.model.length > 2 &&
    newGlider.brand != "" &&
    newGlider.gliderClass != ""
  );
});

const qualifiedForReynoldsClass = computed(() =>
  ["AB_low", "AB_high", "C_low", "C_high", "D_low", "D_high"].includes(
    newGlider.gliderClass
  )
);

const reynoldsClassIsEnabled = computed(() => qualifiedForReynoldsClass.value);

const onAddGlider = () => {
  if (!qualifiedForReynoldsClass.value) newGlider.reynoldsClass = false;
  emit("add-glider", newGlider);
};
</script>
