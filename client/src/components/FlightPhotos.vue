<template>
  <div class="container mt-3">
    <div v-if="isAdmin" class="text-warning">
      <!-- TODO: Find a nice way to prevent mixing up user ids when uploading for a user or simply do not upload for a user… -->
      Admins should not upload photos for a user!
    </div>

    <input
      id="photo-input"
      type="file"
      accept=".jpg, .jpeg"
      style="display: none"
      multiple
      @change="onPhotoSelected"
    />

    <div v-if="photos" class="row">
      <div
        v-for="(photo, index) in _photos"
        :id="`photo-${index}`"
        :key="index"
        class="col-sm-4 col-6"
      >
        <!-- Upload failed -->
        <!-- TODO: Beautify this -->
        <figure v-if="photo.id === 'failed'" class="figure position-relative">
          <img
            src="@/assets/images/placeholder.png"
            class="figure-img img-fluid img-thumbnail"
            alt=""
          />
          <button
            class="btn btn-lg btn-outline-primary position-absolute top-50 start-50 translate-middle"
            @click.prevent="onRetry({ index: index, cueId: photo.uploadCue })"
          >
            <span class="align-middle">
              <i class="bi bi-arrow-clockwise"></i>
            </span>
          </button>
          <i
            class="bi bi-x-circle text-danger fs-3 clickable position-absolute top-0 start-100 translate-middle"
            @click="onCancelUpload(photo)"
          ></i>
          <span class="text-danger">Da ist was schief gelaufen</span>
        </figure>

        <!-- Uploading -->
        <!-- TODO: Beautify this -->
        <div
          v-if="photo.id === null"
          class="d-flex justify-content-center mt-4"
        >
          <BaseSpinner />
        </div>
        <!-- Photo -->
        <figure
          v-if="photo.id !== 'failed' && photo.id"
          class="figure position-relative"
        >
          <a
            :id="photo.id"
            :href="baseURL + `media/` + photo.id"
            data-sizes="(max-width: 800px) 1100px, 4000px"
            :data-srcset="createImageSrcSet(photo.id)"
            data-gallery="photos"
            data-type="image"
            class="glightbox"
            alt="image"
            :data-description="photo.description ? photo.description : ``"
          >
            <img
              :src="baseURL + `media/` + photo.id + `?size=thumb`"
              class="figure-img img-fluid img-thumbnail"
              alt=""
            />
          </a>
          <figcaption
            v-if="!flightId"
            :data-cy="`photo-caption-${index}`"
            class="figure-caption text-center"
          >
            {{ photo.description ? photo.description : "" }}
          </figcaption>
          <div class="p-1">
            <input
              v-if="flightId"
              v-model="photo.description"
              :data-cy="`photo-caption-${index}`"
              class="form-control form-control-sm"
              type="text"
              placeholder="Beschreibung"
              :tabindex="index + 10"
              @input="photosChanged"
            />
          </div>
          <i
            v-if="flightId"
            class="bi bi-x-circle text-danger fs-3 clickable position-absolute top-0 start-100 translate-middle"
            @click="onDeletePhoto(photo.id)"
          ></i>
        </figure>
      </div>
      <!-- Add photo button -->
      <!-- TODO: Position button in center -->
      <div
        v-if="flightId && _photos.length < MAX_PHOTOS"
        id="add-photo"
        class="col-4"
      >
        <figure class="figure position-relative">
          <img
            src="@/assets/images/placeholder.png"
            class="figure-img img-fluid img-thumbnail"
            alt=""
          />
          <button
            class="btn btn-lg btn-outline-primary position-absolute top-50 start-50 translate-middle"
            @click.prevent="onAddPhoto"
          >
            <span class="align-middle">
              <i class="bi bi-plus-square"></i>
            </span>
          </button>
        </figure>
      </div>
      <BaseError
        class="mb-3"
        :error-message="errorMessage"
        data-cy="error-message"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { getbaseURL } from "@/helper/baseUrlHelper";
import useAuth from "@/composables/useAuth";
import ApiService from "@/services/ApiService";
import { v4 as uuidv4 } from "uuid";
import { remove, last } from "lodash-es";
import BaseError from "./BaseError.vue";
import { MAX_PHOTOS } from "@/common/Constants";
import GLightbox from "glightbox";
import { createImageSrcSet } from "@/helper/imageHelper";

import "glightbox/dist/css/glightbox.css";

const { getUserId, isAdmin } = useAuth();
const baseURL = getbaseURL();

const props = defineProps({
  photos: {
    type: Array,
    default: () => [],
  },
  // Edit mode is enabled when a flight id is passed
  flightId: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(["photos-updated"]);

const _photos = ref([]);
const photosRemoved = ref([]);
const photosAdded = ref([]);
const errorMessage = ref(null);

const MAX_PHOTO_MESSAGE = "Du kannst maximal neun Photos hochladen";

// Copy all photos from props to the local array with only mandatory properties
props.photos.forEach((e) =>
  _photos.value.push({
    id: e.id,
    description: e.description,
    uploadCue: null,
  })
);

// Activate lightbox
onMounted(() => {
  GLightbox({ touchNavigation: true, loop: true });
});

// Find the input dialog in template
const photoInput = ref(null);
onMounted(() => {
  photoInput.value = document.getElementById("photo-input");
});

const onDeletePhoto = (id) => {
  // Add the photo to the array of photos that the parent component has to delete
  photosRemoved.value.push(id);
  // Remove photo from local list for preview
  const index = _photos.value.findIndex((e) => e.id === id);
  if (index > -1) _photos.value.splice(index, 1);

  photosChanged();
};
const onCancelUpload = (photo) => {
  remove(photoUploadQueue.value, (e) => e.id === photo.uploadCue);
  // Remove photo from local list for preview
  const index = _photos.value.findIndex((e) => e.id === photo.id);
  if (index > -1) _photos.value.splice(index, 1);
};

// To let the parent know what changed
const photosChanged = () =>
  emit("photos-updated", {
    all: _photos.value, // Contains descriptions for all photos
    removed: photosRemoved.value,
    added: photosAdded.value,
  });

// Show the file input dialog
const onAddPhoto = () => photoInput.value.click();

// Put selected photos in an upload cue and upload them
const photoUploadQueue = ref([]);
const onPhotoSelected = (event) => {
  // Check files count and substract alredy uploaded photos
  if (event.target.files.length > MAX_PHOTOS - _photos.value.length) {
    errorMessage.value = MAX_PHOTO_MESSAGE;
    return;
  }
  errorMessage.value = null;
  [...event.target.files].slice(0, MAX_PHOTOS).forEach((photo) => {
    photoUploadQueue.value.push({
      id: uuidv4(),
      photo: photo,
      status: "pending",
    });
    uploadPhoto(last(photoUploadQueue.value));
  });
};

const uploadPhoto = async (item, { retryIndex = null } = {}) => {
  let index = null;
  // Skip if this is a retry attempt
  if (retryIndex === null) {
    // Create a photo object and add it to the local photos list
    index = _photos.value.length;
    const _phototmp = { id: null, description: "", uploadCue: item.id };
    _photos.value[index] = _phototmp;
  } else {
    index = retryIndex;

    // Reset photo status
    _photos.value[index].id = null;
  }

  // Upload it
  try {
    const formData = new FormData();
    formData.append("image", item.photo, item.photo.name);
    formData.append("flightId", props.flightId);
    formData.append("userId", getUserId);

    const res = await ApiService.uploadPhotos(formData);

    // Remove photo from upload cue
    remove(photoUploadQueue.value, (e) => e.id === item.id);

    // Update local list with id to indicate success
    _photos.value[index].id = res.data.id;

    // Create a photo object and add it to the added photos list
    photosAdded.value.push(res.data.id);

    // Inform the parent about edits
    photosChanged();
  } catch (error) {
    if (error?.response?.status == 429) errorMessage.value = MAX_PHOTO_MESSAGE;

    console.log(error);
    // Trigger the retry button
    _photos.value[index].id = "failed";
  }
};

const onRetry = (options) => {
  // Item from upload cue
  const retryItem = photoUploadQueue.value.find((e) => e.id === options.cueId);
  // Upload again and mark as retry attempt by passing the index
  uploadPhoto(retryItem, { retryIndex: options.index });
};
</script>
