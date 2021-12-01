<template>
  <h5>Standard Gerät wählen</h5>
  <div v-for="glider in listOfGliders" :key="glider.id" class="form-check mt-2">
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
      <a href="#" @click.prevent="onDelete(glider)">
        <i class="bi bi-trash"></i>
      </a>
    </label>
  </div>

  <button type="button" class="btn btn-outline-primary mt-2" @click="onAdd">
    <i class="bi bi-plus"></i> Gerät hinzufügen
  </button>
  <!-- Modals -->
  <ModalAddGlider
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
  />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Modal } from "bootstrap";
import ApiService from "@/services/ApiService.js";
import useUserProfile from "@/composables/useUserProfile";

const selectedGlider = ref(null);
const listOfGliders = ref(null);

const showSpinner = ref(false);

const showAddGliderSpinner = ref(false);
const addGliderErrorMessage = ref(null);

// Modal
const removeGliderModal = ref(null);

onMounted(() => {
  removeGliderModal.value = new Modal(
    document.getElementById("removeGliderModal")
  );
  addGliderModal = new Modal(document.getElementById("addGliderModal"));
});

const removeMessage = computed(() => {
  return `${selectedGlider.value?.brand} ${selectedGlider.value?.model} aus der Liste entfernen`;
});

// Update local copy of glider data
const { fetchProfile } = useUserProfile();

const updateGliderData = async (data) => {
  selectedGlider.value = data.defaultGlider;
  listOfGliders.value = data.gliders;
  // This is only necessary if the userprofile API call needs glider information
  await fetchProfile();
};

// Fetch users gliders
try {
  const res = await ApiService.getGliders();
  if (res.status != 200) throw res.statusText;
  await updateGliderData(res.data);
} catch (error) {
  // TODO: Hanlde error
  console.log(error);
}

// Remove Glider
const onDelete = (glider) => {
  selectedGlider.value = glider;
  removeGliderModal.value.show();
};
const removeGlider = async (result) => {
  if (result) {
    try {
      showSpinner.value = true;
      const res = await ApiService.removeGlider(selectedGlider.value.id);
      if (res.status != 200) throw res.statusText;
      await updateGliderData(res.data);

      showSpinner.value = false;
      removeGliderModal.value.hide();
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
    showAddGliderSpinner.value = true;
    const res = await ApiService.addGlider(glider);
    if (res.status != 200) throw res.statusText;
    await updateGliderData(res.data);
    addGliderErrorMessage.value = null;
    addGliderModal.hide();
  } catch (error) {
    addGliderErrorMessage.value = error;
    console.error(error);
  } finally {
    showAddGliderSpinner.value = false;
  }
};

// Update default glider
const updateDefaultGlider = async () => {
  try {
    const res = await ApiService.setDefaultGlider(selectedGlider.value);
    if (res.status != 200) throw res.statusText;
    await fetchProfile();

    // TODO: Show success indicator
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
</script>
