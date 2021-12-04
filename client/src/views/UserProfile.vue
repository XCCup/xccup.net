<template>
  <div class="container mt-3">
    <!-- Editor -->
    <div class="row">
      <!-- Profile Picture -->
      <div class="col-md-3">
        <div class="d-flex flex-column align-items-center text-center p-3">
          <img
            class="rounded-circle"
            width="150px"
            src="https://avatars.dicebear.com/api/big-ears/your-custom-seed.svg?b=%23d9eb37"
          />
          <span class="font-weight-bold">Foo</span>
          <span class="text-secondary">Bar</span>
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
import { onMounted } from "vue";
import { Tab } from "bootstrap";

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
const { fetchProfile } = useUserProfile();

try {
  // Get user details
  await fetchProfile();
} catch (error) {
  // TODO: Handle error
  console.log(error);
}

onMounted(() => {
  // Navigate to hangar tab via props
  let hangarTab = new Tab(document.querySelector("#nav-hangar-tab"));
  if (props.showHangar) hangarTab.show();
});
</script>

<style scoped></style>
