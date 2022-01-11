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

<script setup>
import { ref, onMounted, computed } from "vue";
import { Modal } from "bootstrap";
import ApiService from "@/services/ApiService.js";
import useSwal from "../composables/useSwal";

const { showSuccessToast, showFailedToast } = useSwal();

defineProps({
  hideList: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["gliders-changed"]);

const selectedGlider = ref(null);
const initialGlider = ref(null);

const listOfGliders = ref(null);

const addModal = ref(null);
const showAddGliderSpinner = ref(false);
const showSpinner = ref(false);

const addGliderErrorMessage = ref(null);

const removeMessage = computed(() => {
  return `${selectedGlider.value?.brand} ${selectedGlider.value?.model} aus der Liste entfernen`;
});

// // Update local copy of glider data
const updateGliderData = async (data) => {
  selectedGlider.value = data.defaultGlider;
  initialGlider.value = data.defaultGlider;
  listOfGliders.value = data.gliders;
};

// Fetch users gliders
try {
  const res = await ApiService.getGliders();
  if (res.status != 200) throw res.statusText;
  await updateGliderData(res.data);
} catch (error) {
  console.log(error);
}

// Remove Glider
const showRemoveGliderSpinner = ref(false);
const removeGliderErrorMessage = ref(null);

const removeGliderModal = ref(null);

onMounted(() => {
  removeGliderModal.value = new Modal(
    document.getElementById("removeGliderModal")
  );
});
const onRemove = (glider) => {
  selectedGlider.value = glider;
  removeGliderErrorMessage.value = null;
  removeGliderModal.value.show();
};

const removeGlider = async (result) => {
  if (result) {
    try {
      showRemoveGliderSpinner.value = true;
      const res = await ApiService.removeGlider(selectedGlider.value.id);
      if (res.status != 200) throw res.statusText;
      await updateGliderData(res.data);
      showRemoveGliderSpinner.value = false;
      removeGliderModal.value.hide();
    } catch (error) {
      console.error(error);
      removeGliderErrorMessage.value = "Da ist leider was schief gelaufen";

      showRemoveGliderSpinner.value = false;
    }
  }
};

// Add glider
const onAdd = () => {
  addModal.value.show();
};
const addGlider = async (glider) => {
  try {
    showAddGliderSpinner.value = true;
    const res = await ApiService.addGlider(glider);
    if (res.status != 200) throw res.statusText;
    await updateGliderData(res.data);
    addGliderErrorMessage.value = null;
    addModal.value.hide();
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

const formatGliderName = (glider) =>
  glider.brand +
  " " +
  glider.model +
  " (" +
  glider.gliderClass.shortDescription +
  ")";
</script>
