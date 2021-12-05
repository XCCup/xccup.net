<template>
  <div class="container mt-3">
    <!-- Editor -->
    <div class="row">
      <!-- Profile Picture -->
      <div class="col-md-3">
        <div
          class="d-flex flex-column align-items-center text-center p-3"
          @mouseover="profileImageHover = true"
          @mouseleave="profileImageHover = false"
          @touchstart="profileImageHover = !profileImageHover"
          @touchmove="profileImageHover = false"
        >
          <img class="rounded-circle" :src="profileImageUrl" />
          <span class="font-weight-bold">{{ userData.firstName }}</span>
          <span class="text-secondary">{{ userData.lastName }}</span>
          <button
            v-show="profileImageHover"
            class="btn btn-outline-primary mb-1"
            @click.prevent="onAddPhoto"
          >
            <span v-if="pictureStored">Foto ändern</span>
            <span v-else>Foto hochladen</span>
          </button>
          <button
            v-show="profileImageHover && pictureStored"
            id="profilePictureDeleteButton"
            type="button"
            class="col btn btn-outline-danger btn-sm"
            @click="onDeleteProfilePicture"
          >
            <i class="bi bi-x"></i>
          </button>
          <input
            id="photo-input"
            type="file"
            accept=".jpg, .jpeg, .png, .webp"
            style="display: none"
            @change="onPhotoSelected"
          />
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="col-md-9 col-lg-8">
        <nav>
          <div id="nav-tab" class="nav nav-tabs" role="tablist">
            <button
              id="nav-profile-tab"
              class="nav-link active"
              data-bs-toggle="tab"
              data-bs-target="#nav-profile"
              type="button"
              role="tab"
              aria-controls="nav-profile"
              aria-selected="true"
            >
              Profil
            </button>
            <button
              id="nav-hangar-tab"
              class="nav-link"
              data-bs-toggle="tab"
              data-bs-target="#nav-hangar"
              type="button"
              role="tab"
              aria-controls="nav-hangar"
              aria-selected="false"
            >
              Hangar
            </button>
            <button
              id="nav-my-flights-tab"
              class="nav-link"
              data-bs-toggle="tab"
              data-bs-target="#nav-my-flights"
              type="button"
              role="tab"
              aria-controls="nav-my-flights"
              aria-selected="false"
            >
              Meine Flüge
            </button>
          </div>
        </nav>
        <!-- Tab content -->
        <div id="nav-tabContent" class="tab-content">
          <div
            id="nav-profile"
            class="tab-pane fade show active"
            role="tabpanel"
            aria-labelledby="nav-profile-tab"
          >
            <UserProfileDetails />
          </div>
          <div
            id="nav-hangar"
            class="tab-pane fade"
            role="tabpanel"
            aria-labelledby="nav-hangar-tab"
          >
            <div id="glider-select" class="col-md-12 mb-4">
              <UserProfileGliderlist />
            </div>
          </div>
          <div
            id="nav-my-flights"
            class="tab-pane fade"
            role="tabpanel"
            aria-labelledby="nav-my-flights-tab"
          >
            ...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { setWindowName } from "../helper/utils";
import useUserProfile from "@/composables/useUserProfile";
import { onMounted, ref, computed } from "vue";
import { Tab } from "bootstrap";
import { getUserPicture } from "../helper/profilePictureHelper";
import ApiService from "../services/ApiService";

setWindowName("Profil");
const props = defineProps({
  edit: {
    type: Boolean,
    default: false,
  },
  showHangar: {
    type: Boolean,
    default: false,
  },
});

// TODO: Warn user if there are unsaved changes
const { fetchProfile, userData } = useUserProfile();

try {
  // Get user details
  await fetchProfile();
} catch (error) {
  // TODO: Handle error
  console.log(error);
}

const profileImageHover = ref(false);

const photoInput = ref(null);
onMounted(() => {
  photoInput.value = document.getElementById("photo-input");
  // Navigate to hangar tab via props
  let hangarTab = new Tab(document.querySelector("#nav-hangar-tab"));
  if (props.showHangar) hangarTab.show();
});

const pictureStored = computed(() => userData.value.picture);
const profileImageUrl = computed(() => getUserPicture(userData.value, true));

const onAddPhoto = () => photoInput.value.click();

const onPhotoSelected = (event) => {
  [...event.target.files].forEach((element) => {
    uploadPhoto(element);
  });
};
const onDeleteProfilePicture = async () => {
  try {
    const res = await ApiService.deleteUserPicture();
    if (res.status != 200) throw res.statusText;
    // profileImageUrl.value = createDicebearUrl(userData.value);
    fetchProfile();
  } catch (error) {
    console.log(error);
  }
};
const uploadPhoto = async (photo) => {
  try {
    const formData = new FormData();
    formData.append("image", photo, photo.name);
    console.log(photo.name);
    const res = await ApiService.uploadUserPicture(formData);
    if (res.status != 200) throw res.statusText;
    fetchProfile();
  } catch (error) {
    console.log(error);
  }
};
</script>

<style scoped>
img {
  width: 150px;
}
</style>
