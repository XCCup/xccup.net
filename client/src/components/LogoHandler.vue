<script setup lang="ts">
import { getbaseURL } from "@/helper/baseUrlHelper";
import ApiService from "@/services/ApiService";
import { watch } from "vue";
import { onMounted, ref } from "vue";

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
  referenceType: {
    type: String,
    required: true,
    default: "Sponsor",
  },
});

// Maybe also support a future admin club  with this component in the future
const supportedReferenceTypes = ["Sponsor"];
if (!supportedReferenceTypes.includes(props.referenceType))
  throw new Error(
    "Reference type is not supported; Supported types are " +
      supportedReferenceTypes
  );

const emit = defineEmits(["logo-updated"]);

// Find the input dialog in template
const photoInput = ref<HTMLElement | null>(null);
onMounted(() => {
  photoInput.value = document.getElementById("photo-input-logo");
});

const errorMessage = ref("");
const localLogoId = ref(props.logoId);
watch(
  () => props.logoId,
  () => (localLogoId.value = props.logoId)
);

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

  // Handle the different reference types
  let apiCall = null;
  let referenceIdName = "";
  switch (props.referenceType) {
    case "Sponsor":
    default:
      apiCall = ApiService.addSponsorLogo;
      referenceIdName = "sponsorId";
      break;
  }

  errorMessage.value = "";
  try {
    const formData = new FormData();
    formData.append("image", selectedLogo);
    formData.append(referenceIdName, props.referenceId);
    const result = (await apiCall(formData)).data;
    localLogoId.value = result.id;
  } catch (error) {
    errorMessage.value = "Der Upload des Logo war nicht erfolgreich";
  }
}

async function onDeleteImage() {
  try {
    if (!props.referenceId) return;

    await ApiService.deleteSponsorLogo(props.referenceId);
    emit("logo-updated");
    localLogoId.value = "";
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
      v-if="localLogoId"
      class="mw-100 mh-100 position-relative top-50 start-50 translate-middle"
      :src="getbaseURL() + `media/` + localLogoId"
    />
    <span
      v-if="localLogoId"
      class="shadow position-absolute translate-middle clickable badge rounded-pill bg-danger"
      style="top: 20px; right: -10px"
      @click.prevent="onDeleteImage"
    >
      <i class="bi bi-trash fs-6"></i>
    </span>
    <button
      v-if="!localLogoId"
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
