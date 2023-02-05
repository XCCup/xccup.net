<template>
  <div v-if="!hideList" class="mb-3" data-cy="user-profile-glider-list">
    <h5>Standard Gerät wählen</h5>
    <div
      v-for="glider in listOfGliders"
      :key="glider.id"
      class="form-check mt-2"
      :data-cy="`glider-list-item-${glider.id}`"
    >
      <input
        :id="glider.id"
        v-model="selectedGlider"
        class="form-check-input"
        type="radio"
        name="gliderSelectRadios"
        :value="glider.id"
        :checked="glider.id === selectedGlider"
        @change="updateDefaultGlider"
      />
      <label class="form-check-label" :for="glider.id">
        {{ formatGliderName(glider) }}
        <FeatherIcon v-if="glider.reynoldsClass" class="me-1" />
        <a href="#" data-cy="delete-glider" @click.prevent="onRemove(glider)">
          <i class="bi bi-trash"></i>
        </a>
      </label>
    </div>
    <!-- TODO: Move to more elegant position -->
    <BaseSpinner v-if="showSpinner" />
  </div>
  <button
    type="button"
    class="btn btn-outline-primary"
    data-cy="add-glider-button"
    @click="onAdd"
  >
    <i class="bi bi-plus-circle"></i> Gerät hinzufügen
  </button>
  <!-- Modals -->
  <ModalAddGlider
    ref="addModal"
    :show-spinner="showAddGliderSpinner"
    :error-message="addGliderErrorMessage"
    @add-glider="addGlider"
  />
  <BaseModal
    modal-title="Bist du sicher?"
    :modal-body="removeMessage"
    confirm-button-text="OK"
    modal-id="removeGliderModal"
    :confirm-action="removeGlider"
    :error-message="removeGliderErrorMessage"
    :show-spinner="showRemoveGliderSpinner"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Modal } from "bootstrap";
import ApiService from "@/services/ApiService";
import useSwal from "../composables/useSwal";
import type { Glider } from "@/types/Glider";

const { showSuccessToast, showFailedToast } = useSwal();

defineProps({
  hideList: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["gliders-changed"]);

const selectedGlider = ref<string | null>(null);
const initialGlider = ref(null);

const listOfGliders = ref<Glider[]>([]);

const addModal = ref<Modal | null>(null);
const showAddGliderSpinner = ref(false);
const showSpinner = ref(false);

const addGliderErrorMessage = ref<string | undefined>(undefined);

// Update local copy of glider data
const updateGliderData = (data: any) => {
  selectedGlider.value = data.defaultGlider;
  initialGlider.value = data.defaultGlider;
  listOfGliders.value = data.gliders;
};

// Fetch users gliders
try {
  const res = await ApiService.getGliders();
  if (res.status != 200) throw res.statusText;
  updateGliderData(res.data);
} catch (error) {
  console.log(error);
}

// Remove Glider
const showRemoveGliderSpinner = ref(false);
const removeGliderErrorMessage = ref<string | null>();
const gliderToRemove = ref<Glider | null>(null);

const removeMessage = computed(() => {
  return `${gliderToRemove.value?.brand} ${gliderToRemove.value?.model} aus der Liste entfernen`;
});

const removeGliderModal = ref<Modal>();

onMounted(() => {
  const el = document.getElementById("removeGliderModal");
  if (el) removeGliderModal.value = new Modal(el);
});

const onRemove = (glider: Glider) => {
  gliderToRemove.value = glider;
  removeGliderErrorMessage.value = null;
  removeGliderModal.value?.show();
};

const removeGlider = async () => {
  try {
    if (!gliderToRemove.value?.id) throw new Error("No glider ID specified");
    showRemoveGliderSpinner.value = true;
    const res = await ApiService.removeGlider(gliderToRemove.value.id);
    if (res.status != 200) throw res.statusText;
    updateGliderData(res.data);
    removeGliderModal.value?.hide();
  } catch (error) {
    console.error(error);
    removeGliderErrorMessage.value = "Da ist leider was schief gelaufen";
  } finally {
    showRemoveGliderSpinner.value = false;
  }
};

// Add glider
const onAdd = () => {
  addModal.value?.show();
};
const addGlider = async (glider: Glider) => {
  try {
    showAddGliderSpinner.value = true;
    const res = await ApiService.addGlider(glider);
    console.log(res);

    if (res.status != 200) throw res.statusText;
    updateGliderData(res.data);
    addGliderErrorMessage.value = undefined;
    addModal.value?.hide();
    emit("gliders-changed");
  } catch (error) {
    addGliderErrorMessage.value = "Da ist leider was schief gelaufen";
    console.error(error);
  } finally {
    showAddGliderSpinner.value = false;
  }
};

// Update default glider
const updateDefaultGlider = async () => {
  try {
    if (!selectedGlider.value) throw new Error("No glider id specified");
    showSpinner.value = true;
    const res = await ApiService.setDefaultGlider(selectedGlider.value);
    if (res.status != 200) throw res.statusText;
    updateGliderData(res.data);
    showSuccessToast("Standard Gerät geändert");
  } catch (error) {
    selectedGlider.value = initialGlider.value;
    showFailedToast("Da ist leider was schief gelaufen");
    console.error(error);
  } finally {
    showSpinner.value = false;
  }
};

const formatGliderName = (glider: Glider) =>
  glider.brand +
  " " +
  glider.model +
  " (" +
  glider.gliderClass.shortDescription +
  ")";
</script>
