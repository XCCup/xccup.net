<template>
  <div class="container-lg my-3">
    <div class="row">
      <!-- Profile Picture -->
      <div class="col-lg-2">
        <div class="d-flex flex-column align-items-center text-center p-3">
          <div class="position-relative">
            <img class="rounded-circle" :src="avatarUrl" />
            <span
              class="shadow position-absolute translate-middle clickable badge rounded-pill bg-primary"
              style="top: 20px; right: -10px"
              @click.prevent="onEditAvatar"
            >
              <i class="col bi bi-plus-circle fs-6"></i>
            </span>
          </div>

          <div class="row"></div>
          <!-- TODO: Maybe use these elements to show some addtional data above the profil -->
          <!-- <span class="font-weight-bold">A nice fact</span>
          <span class="text-secondary">or two about the user</span> -->
        </div>
      </div>

      <!-- Tab Bar -->
      <div class="col-lg-10">
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
              data-cy="profile-tab"
            >
              Profil
            </button>
            <button
              id="nav-change-pw-tab"
              class="nav-link"
              data-bs-toggle="tab"
              data-bs-target="#nav-change-pw"
              type="button"
              role="tab"
              aria-controls="nav-change-pw"
              aria-selected="false"
              data-cy="change-password-tab"
            >
              Passwort & E-Mail
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
              data-cy="hangar-tab"
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
              data-cy="my-flights-tab"
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
            <UserProfileGliderlist />
          </div>
          <div
            id="nav-change-pw"
            class="tab-pane fade"
            role="tabpanel"
            aria-labelledby="nav-change-pw-tab"
          >
            <UserProfileChangePassword />
            <hr class="my-4" />
            <UserProfileChangeEmail />
          </div>
          <div
            id="nav-my-flights"
            class="tab-pane fade"
            role="tabpanel"
            aria-labelledby="nav-my-flights-tab"
          >
            <UserProfileMyFlights />
          </div>
        </div>
      </div>
    </div>
  </div>
  <ModalUserAvatar :avatar-url="avatarUrl" @avatar-changed="updateAvatar" />
</template>
<script setup>
import { setWindowName } from "../helper/utils";
import useUserProfile from "@/composables/useUserProfile";
import { onMounted, ref, computed } from "vue";
import { Tab } from "bootstrap";
import { createUserPictureUrl } from "../helper/profilePictureHelper";
import { Modal } from "bootstrap";
import { useRouter } from "vue-router";

setWindowName("Profil");

// TODO: Remember the opened tab when navigating back to profile

const props = defineProps({
  showHangar: {
    type: Boolean,
    default: false,
  },
});

// TODO: Warn user if there are unsaved changes --> Use "beforeRouteLeave lifecycle hook"
const { fetchProfile, userData } = useUserProfile();

const router = useRouter();

try {
  await fetchProfile();
} catch (error) {
  console.error(error);
  router.push({
    name: "NetworkError",
  });
}

const editAvatarModal = ref(null);
onMounted(() => {
  editAvatarModal.value = new Modal(document.getElementById("userAvatarModal"));
  // Navigate to hangar tab via props
  let hangarTab = new Tab(document.querySelector("#nav-hangar-tab"));
  if (props.showHangar) hangarTab.show();
});

const avatarUrl = computed(() => createUserPictureUrl(userData.value.id, true));

const onEditAvatar = () => {
  editAvatarModal.value.show();
};

const updateAvatar = () => {
  editAvatarModal.value.hide();
  fetchProfile();
};
</script>

<style scoped>
img {
  width: 150px;
}
</style>
