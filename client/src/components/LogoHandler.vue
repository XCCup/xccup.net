<script setup lang="ts">
import { getbaseURL } from "@/helper/baseUrlHelper";
import ApiService from "@/services/ApiService";
import { computed, onMounted, ref, watch } from "vue";

const props = defineProps({
  logoId: {
    type: String,
    required: false,
    default: undefined,
  },
  referenceId: {
    type: String,
    required: false,
    default: undefined,
  },
});

const emit = defineEmits(["logo-updated"]);

watch(
  () => props.logoId,
  () => {
    console.log("LOGO ID: ", props.logoId);
  }
);

// Find the input dialog in template
const photoInput = ref<HTMLElement | null>(null);
onMounted(() => {
  photoInput.value = document.getElementById("photo-input-logo");
});

const isLogoDeleted = ref(false);
const errorMessage = ref("");

function onAddPhoto() {
  photoInput.value?.click();
}

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget;
}
async function onLogoSelected(e: Event) {
  const event = e as HTMLInputEvent;
  if (!event.target.files?.length || !props.referenceId) return;
  const selectedLogo = event.target.files[0];

  errorMessage.value = "";
  try {
    const formData = new FormData();
    formData.append("image", selectedLogo);
    formData.append("sponsorId", props.referenceId);
    await ApiService.addSponsorLogo(formData);
    isLogoDeleted.value = false;
  } catch (error) {
    errorMessage.value = "Der Upload des Logo war nicht erfolgreich";
  }
  console.log(event.target.files[0]);
}

async function onDeleteImage() {
  try {
    if (!props.referenceId) return console.log("No reference for logo");

    await ApiService.deleteSponsorLogo(props.referenceId);
    emit("logo-updated");
    isLogoDeleted.value = true;
  } catch (error) {
    console.error(error);
  }
}
</script>

<template>
  <input
    id="photo-input-logo"
    type="file"
    accept=".png"
    style="display: none"
    multiple
    @change="onLogoSelected"
  />

  <div class="p-2 bg-light mb-4 p-4 sponsor-box filter position-relative">
    <img
      v-if="logoId && !isLogoDeleted"
      class="mw-100 mh-100 position-relative top-50 start-50 translate-middle"
      :src="getbaseURL() + `media/` + props.logoId"
    />
    <span
      v-if="logoId && !isLogoDeleted"
      class="shadow position-absolute translate-middle clickable badge rounded-pill bg-danger"
      style="top: 20px; right: -10px"
      @click.prevent="onDeleteImage"
    >
      <i class="bi bi-trash fs-6"></i>
    </span>
    <button
      v-if="!logoId || isLogoDeleted"
      class="btn block w-100 bi bi-plus-square fs-1 text-primary"
      @click.prevent="onAddPhoto"
    ></button>
  </div>
  <BaseError
    class="mb-3"
    :error-message="errorMessage"
    data-cy="error-message"
  />
</template>
