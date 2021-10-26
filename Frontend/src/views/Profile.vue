<template>
  <div class="container mt-3">
    <!-- Editor -->
    <div v-if="userDetails" class="rounded bg-white">
      <div class="row">
        <!-- Left -->
        <div class="col-md-3 border-end">
          <div class="d-flex flex-column align-items-center text-center p-3">
            <img
              class="rounded-circle"
              width="150px"
              src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg"
            /><span class="font-weight-bold">Lorem Ipsum</span
            ><span class="text-black-50">Lorem, ipsum.</span>
          </div>
        </div>

        <!-- Center -->
        <div class="col-md-9">
          <div class="p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="text-right">Profil</h4>
            </div>
            <div class="row mt-2">
              <div class="col-md-6">
                <BaseInput v-model="userProfile.firstName" label="Name" />
              </div>
              <div class="col-md-6">
                <BaseInput v-model="userProfile.lastName" label="Nachname" />
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-12">
                <BaseInput
                  v-model="userProfile.Club.name"
                  label="Verein"
                  :isDisabled="true"
                />
                <BaseInput v-model="userProfile.birthday" label="Geburtstag" />
                <BaseInput v-model="userProfile.email" label="E-Mail" />
                <BaseInput v-model="userProfile.street" label="Strasse" />
                <div class="row">
                  <div class="col-md-6">
                    <BaseInput v-model="userProfile.zip" label="PLZ" />
                  </div>
                  <div class="col-md-6">
                    <BaseInput v-model="userProfile.city" label="Stadt" />
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <BaseInput v-model="userProfile.state" label="Bundesland" />
                  </div>
                  <div class="col-md-6">
                    <BaseInput v-model="userProfile.country" label="Land" />
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <BaseSelect
                      v-model="userProfile.gender"
                      label="Geschlecht"
                      :showLabel="true"
                      :options="['M', 'W', 'D']"
                    />
                  </div>
                  <div class="col-md-6">
                    <BaseSelect
                      v-model="userProfile.tshirtSize"
                      label="T-Shirt Größe"
                      :showLabel="true"
                      :options="['S', 'M', 'L', 'XL', 'XXL']"
                    />
                  </div>
                </div>

                <div class="mt-3"></div>
              </div>
              <div class="col-md-12">
                <div class="row d-flex align-items-end">
                  <div class="col-md-7">
                    <BaseSelect
                      v-model="userProfile.gliders[0]"
                      label="Standard Gerät"
                      :showLabel="true"
                      :options="userDetails.gliders"
                    />
                  </div>
                  <div class="col-md-5 mt-3">
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                      <button
                        type="button"
                        class="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#addGliderModal"
                      >
                        Hinzufügen
                      </button>

                      <button
                        type="button"
                        class="btn btn-outline-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#removeGliderModal"
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <hr />
            <h5>Benachrichtigungen</h5>
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                value=""
                id="notifyForComment"
                v-model="userProfile.emailInformIfComment"
              />
              <label class="form-check-label" for="flexCheckDefault">
                Email bei neuem Kommentar <i class="bi bi-info-circle"></i>
              </label>
            </div>
            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                value=""
                id="optInNewsletter"
                v-model="userProfile.emailNewsletter"
              />
              <label class="form-check-label" for="flexCheckDefault">
                Newsletter abonnieren <i class="bi bi-info-circle"></i>
              </label>
            </div>

            <br />
            <!-- Edit -->
            <div v-if="!edit">
              <router-link
                :to="{ name: 'ProfileEdit' }"
                class="btn btn-primary"
              >
                Edit
              </router-link>
            </div>
            <div v-if="edit">
              <div>Edit: {{ authUser.name }}</div>

              <button class="btn btn-primary" @click="save">Speichern</button>
              <button class="btn btn-outline-danger" @click="cancel">
                Abbrechen
              </button>
            </div>
            <!-- Edit -->
          </div>
        </div>
        <!-- Right -->
        <!-- <div class="col-md-4">
          <div class="p-3 py-5">
            <div
              class="d-flex justify-content-between align-items-center experience"
            >
              <span>Edit Experience</span
              ><span class="border px-3 p-1 add-experience"
                ><i class="fa fa-plus"></i>&nbsp;Experience</span
              >
            </div>
            <br />
            <div class="col-md-12">
              <label class="labels">Experience in Designing</label
              ><input
                type="text"
                class="form-control"
                placeholder="experience"
                value=""
              />
            </div>
            <br />
            <div class="col-md-12">
              <label class="labels">Additional Details</label
              ><input
                type="text"
                class="form-control"
                placeholder="additional details"
                value=""
              />
            </div>
          </div>
        </div> -->
      </div>
      <h5 v-if="userDetails">Raw user details</h5>
      {{ userDetails }}
    </div>
  </div>

  <!-- Modals -->
  <AddGliderModal />
  <RemoveGliderModal v-if="userDetails" :glider="userProfile.gliders[0]" />
</template>

<script>
import ApiService from "@/services/ApiService.js";

import { mapGetters, useStore } from "vuex";
import { computed, ref } from "vue";

import AddGliderModal from "@/components/AddGliderModal";
import RemoveGliderModal from "@/components/RemoveGliderModal";

export default {
  name: "Profile",
  components: { AddGliderModal, RemoveGliderModal },
  async setup() {
    // TODO: Remove if store will not be used for user details. Maybe leave it here for reference how to do it;)
    // const store = useStore();
    // store.dispatch("user/getUserDetails", store.getters["getAuthData"].userId);
    // const userDetails = computed(() => store.getters["user/getUserDetails"]);
    try {
      const store = useStore();

      const userId = store.getters["getAuthData"].userId;
      const { data: initialData } = await ApiService.getUserDetails(userId);

      return {
        userDetails: ref(initialData),
      };
    } catch (error) {
      console.log(error);
    }
  },
  data() {
    return {
      userProfile: null,
    };
  },
  computed: {
    // ...mapGetters(["authUser"]),
    ...mapGetters({
      getterUserId: "getUserId",
    }),
    // listOfAircrafts() {
    //   if (!this.authUser.gliders) return;
    //   let gliderList = [];
    //   this.authUser.gliders.forEach((element) => {
    //     gliderList.push(`${element.brand} ${element.model}`);
    //   });
    //   return gliderList;
    // },
  },
  beforeMount() {
    this.userProfile = { ...this.userDetails };
  },
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    save() {
      console.log("Profile saved");
    },
    cancel() {
      this.$router.push({ name: "Profile" });
    },
  },
};
</script>

<style scoped>
.add-experience:hover {
  background: #ba68c8;
  color: #fff;
  cursor: pointer;
  border: solid 1px #ba68c8;
}
</style>
