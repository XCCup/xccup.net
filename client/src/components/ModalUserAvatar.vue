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
            Avatar bearbeiten
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="onClose"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3"></div>
          <div v-if="!errorMessage">
            <VueAvatar
              ref="vueavatar"
              :width="400"
              :height="400"
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
            <p>{{ errorMessage }}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!saveButtonIsEnabled"
            @click="onSaveClicked"
          >
            Speichern <BaseSpinner v-if="showSpinner" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
            @click="onClose"
          >
            <div>Abbrechen</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService.js";

import { ref } from "vue";
import { VueAvatar } from "vue-avatar-editor-improved";

const emit = defineEmits(["image-saved"]);

const image = ref(null);
const vueavatar = ref(null);
const rotation = ref(0);
const scale = ref(1);
const borderRadius = ref(200);

const showSpinner = ref(false);
const saveButtonIsEnabled = ref(false);
const errorMessage = ref(null);

const onImageReady = () => {
  saveButtonIsEnabled.value = true;
};

const onSaveClicked = async () => {
  showSpinner.value = true;
  const img = vueavatar.value.getImageScaled();
  try {
    img.toBlob(async function (blob) {
      const formData = new FormData();
      formData.append("image", blob);
      const res = await ApiService.uploadUserPicture(formData);
      if (res.status != 200) throw res.statusText;
      emit("image-saved");
    });
  } catch (error) {
    errorMessage.value =
      "Es ist ein Fehler beim Senden deines Bildes aufgetreten. Versuche es erneut. Wenn der Fehler weiterhin besteht, wende dich bitte an einen Administrator.";
    console.log(error);
  } finally {
    showSpinner.value = false;
  }
};
</script>
