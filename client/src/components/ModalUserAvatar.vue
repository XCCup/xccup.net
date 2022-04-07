<!-- TODO: It may be possible to replace this modal with BaseModal and slots -->
<template>
  <div
    id="userAvatarModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="userAvatarModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="userAvatarModalLabel" class="modal-title">
            Profilbild bearbeiten
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="onClose"
          ></button>
        </div>
        <div class="modal-body d-flex justify-content-center">
          <div class="mb-3"></div>
          <div v-if="!errorMessage && !deleteRequest">
            <!-- Todo: This is ugly on hiDPI screens -->
            <VueAvatar
              ref="vueavatar"
              :image="presetImage"
              :rotation="parseInt(rotation)"
              :border-radius="borderRadius"
              :scale="parseFloat(scale)"
              @vue-avatar-editor:image-ready="onImageReady"
            />
            <br />
            <label class="form-label">
              Zoom : {{ scale }}x
              <br />
              <input
                v-model="scale"
                class="form-range"
                type="range"
                min="1"
                max="3"
                step="0.02"
              />
            </label>
            <br />
            <label class="form-label">
              Rotation : {{ rotation }}°
              <br />
              <input
                v-model="rotation"
                class="form-range"
                type="range"
                min="0"
                max="360"
                step="1"
              />
            </label>
            <br />
            <img ref="image" />
          </div>
          <div v-else>
            <BaseError :error-message="errorMessage" />
          </div>
          <div v-if="deleteRequest">
            <p>Möchtest du dein aktuelles Profilbild wirklich löschen?</p>
          </div>
        </div>
        <div class="modal-footer">
          <!-- First Button (Toggle) -->
          <button
            v-if="!deleteRequest && deleteButtonIsEnabled"
            type="button"
            class="btn btn-outline-danger me-auto"
            @click="onDelete"
          >
            Löschen
          </button>
          <button
            v-if="deleteRequest"
            type="button"
            class="btn btn-outline-primary me-auto"
            @click="onDelete"
          >
            Ändern
          </button>
          <!-- Second Button (Execute)-->
          <button
            v-if="deleteRequest"
            type="button"
            class="btn btn-danger"
            :disabled="!saveButtonIsEnabled"
            @click="onSave"
          >
            Löschen <BaseSpinner v-if="showSpinner" />
          </button>
          <button
            v-else
            type="button"
            class="btn btn-primary"
            :disabled="!saveButtonIsEnabled"
            @click="onSave"
          >
            Speichern <BaseSpinner v-if="showSpinner" />
          </button>
          <!-- Thrid Button (Cancel) -->
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            <div>Abbrechen</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService";

import { computed, ref, watchEffect } from "vue";
import { VueAvatar } from "vue-avatar-editor-improved";
import { convertRemoteImageToDataUrl } from "../helper/utils";

const props = defineProps({
  avatarUrl: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["avatar-changed"]);

const image = ref(null);
const vueavatar = ref(null);
const rotation = ref(0);
const scale = ref(1);
const borderRadius = ref(200);

const showSpinner = ref(false);
const saveButtonIsEnabled = ref(false);
const errorMessage = ref(null);
const presetImage = ref("");
const deleteRequest = ref(false);

const isDefaultImage = ref(true);

watchEffect(() => {
  if (props.avatarUrl) {
    const imageUrl = props.avatarUrl
      .replace("?size=thumb", "")
      .replace(/&\?timestamp=\d+/, "");
    convertRemoteImageToDataUrl(imageUrl, (dataUrl, mimeType) => {
      presetImage.value = dataUrl;
      isDefaultImage.value = mimeType.includes("svg");
    });
  }
});

const deleteButtonIsEnabled = computed(() => {
  return props.avatarUrl && !isDefaultImage.value;
});

const onImageReady = () => {
  saveButtonIsEnabled.value = true;
};

const onDelete = () => {
  deleteRequest.value = !deleteRequest.value;
};

const onSave = async () => {
  showSpinner.value = true;
  deleteRequest.value ? deleteAvatar() : uploadAvatar();
};

function uploadAvatar() {
  const img = vueavatar.value.getImage();
  img.toBlob(async function (blob) {
    try {
      const formData = new FormData();
      formData.append("image", blob);
      const res = await ApiService.uploadUserPicture(formData);
      if (res.status != 200) throw res.statusText;
      emit("avatar-changed");
    } catch (error) {
      errorMessage.value = "Da ist leider was schief gelaufen.";
      console.log(error);
    } finally {
      showSpinner.value = false;
      deleteRequest.value = false;
    }
  });
}
async function deleteAvatar() {
  try {
    const res = await ApiService.deleteUserPicture();
    if (res.status != 200) throw res.statusText;
    emit("avatar-changed");
  } catch (error) {
    errorMessage.value = "Da ist leider was schief gelaufen.";
    console.log(error);
  } finally {
    showSpinner.value = false;
    deleteRequest.value = false;
  }
}
</script>
