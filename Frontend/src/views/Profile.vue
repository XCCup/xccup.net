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
            />
            <span class="font-weight-bold"> Foo </span>
            <span class="text-black-50">Bar</span>
          </div>
        </div>

        <!-- Center -->
        <div class="col-md-9">
          <div v-if="editMode" class="p-3">
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
                  v-model="userProfile.club.name"
                  label="Verein"
                  :isDisabled="true"
                />
                <BaseInput v-model="userProfile.birthday" label="Geburtstag" />
                <BaseInput v-model="userProfile.email" label="E-Mail" />
                <BaseInput
                  v-model="userProfile.address.street"
                  label="Strasse"
                />
                <div class="row">
                  <div class="col-md-6">
                    <BaseInput v-model="userProfile.address.zip" label="PLZ" />
                  </div>
                  <div class="col-md-6">
                    <BaseInput
                      v-model="userProfile.address.city"
                      label="Stadt"
                    />
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <BaseInput
                      v-model="userProfile.address.state"
                      label="Bundesland"
                    />
                  </div>
                  <div class="col-md-6">
                    <BaseInput
                      v-model="userProfile.address.country"
                      label="Land"
                    />
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
                <hr />
              </div>
              <div class="col-md-12">
                <GliderList
                  :gliders="userProfile.gliders"
                  :defaultGlider="userProfile.defaultGlider"
                  @gliders-changed="glidersChanged"
                />
              </div>

              <!-- Glider select -->
              <!-- <div class="col-md-12">
                <div class="row d-flex align-items-end">
                  <div class="col-md-7">
                    <div class="">
                      <GliderSelect
                        v-model="userProfile.defaultGlider"
                        :showLabel="true"
                        label="Standard Gerät"
                        :gliders="userProfile.gliders"
                        :isDisabled="false"
                      />
                    </div>
                  </div>
                  <div class="col-md-5">
                    <div class="d-grid gap-2 d-md-flex justify-content-md-end">
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
              </div> -->
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
            <button
              class="btn btn-primary"
              :disabled="!profileDataHasChanged"
              @click="save"
            >
              Speichern
              <div
                v-if="showSpinner"
                class="spinner-border spinner-border-sm"
                role="status"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
            </button>

            <!-- Edit -->
            <!-- <div v-if="!edit">
              <router-link
                :to="{ name: 'ProfileEdit' }"
                class="btn btn-primary"
              >
                Edit
              </router-link>
            </div>
            <div v-if="edit">
              <div>Edit: {{ userProfile.firstName }}</div>

              <button class="btn btn-primary" @click="save">Speichern</button>
              <button class="btn btn-outline-danger" @click="cancel">
                Abbrechen
              </button>
            </div> -->
            <!-- Edit -->
          </div>
          <div v-if="!editMode" class="p-3">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h4 class="text-right">Profil</h4>
            </div>

            <div class="row mt-3">
              <div class="col-md-12">
                <p>{{ userProfile.birthday }}</p>
                <p>{{ userProfile.email }}</p>
                <p>{{ userProfile.address.street }}</p>

                <div class="row">
                  <div class="col-md-6">
                    {{ userProfile.address.zip }}
                  </div>
                  <div class="col-md-6">
                    {{ userProfile.address.city }}
                  </div>
                </div>
                <div class="row">
                  <div class="col-md-6">
                    <BaseInput
                      v-model="userProfile.address.state"
                      label="Bundesland"
                    />
                  </div>
                  <div class="col-md-6">
                    <BaseInput
                      v-model="userProfile.address.country"
                      label="Land"
                    />
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
                    <div class="">
                      <GliderSelect
                        v-model="userProfile.defaultGlider"
                        :showLabel="true"
                        label="Standard Gerät"
                        :gliders="userProfile.gliders"
                        :isDisabled="false"
                      />
                    </div>
                  </div>
                  <div class="col-md-5">
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
            <button
              class="btn btn-primary"
              :disabled="!profileDataHasChanged"
              @click="save"
            >
              Speichern
              <div
                v-if="showSpinner"
                class="spinner-border spinner-border-sm"
                role="status"
              >
                <span class="visually-hidden">Loading...</span>
              </div>
            </button>

            <!-- Edit -->
            <!-- <div v-if="!edit">
              <router-link
                :to="{ name: 'ProfileEdit' }"
                class="btn btn-primary"
              >
                Edit
              </router-link>
            </div>
            <div v-if="edit">
              <div>Edit: {{ userProfile.firstName }}</div>

              <button class="btn btn-primary" @click="save">Speichern</button>
              <button class="btn btn-outline-danger" @click="cancel">
                Abbrechen
              </button>
            </div> -->
            <!-- Edit -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ApiService from "@/services/ApiService.js";

import { mapGetters } from "vuex";
import { ref } from "vue";

import cloneDeep from "lodash/cloneDeep";

export default {
  name: "Profile",
  async setup() {
    // TODO: Remove if store will not be used for user details. Maybe leave it here for reference how to do it;)
    // const store = useStore();
    // store.dispatch("user/getUserDetails", store.getters["getAuthData"].userId);
    // const userDetails = computed(() => store.getters["user/getUserDetails"]);
    try {
      const { data: initialData } = await ApiService.getUserDetails();
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
      unmodifiedUserProfile: null,
      showSpinner: false,
      editMode: true,
    };
  },
  computed: {
    ...mapGetters({
      getterUserId: "getUserId",
    }),
    profileDataHasChanged() {
      return (
        JSON.stringify(this.userProfile) !=
        JSON.stringify(this.unmodifiedUserProfile)
      );
    },
  },
  beforeMount() {
    this.userProfile = cloneDeep(this.userDetails);
    this.unmodifiedUserProfile = cloneDeep(this.userDetails);
  },
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    glidersChanged(gliders) {
      this.userProfile.gliders = gliders;
    },
    async save() {
      try {
        this.showSpinner = true;
        const res = await ApiService.updateUserProfile(this.userProfile);
        if (res.status != 200) throw res.statusText;
        this.userProfile = res.data;
        this.unmodifiedUserProfile = cloneDeep(this.userProfile);
        this.showSpinner = false;
      } catch (error) {
        console.error(error);
        this.showSpinner = false;
      }
    },
    // cancel() {
    //   this.$router.push({ name: "Profile" });
    // },
  },
};
</script>

<style scoped>
/* .add-experience:hover {
  background: #ba68c8;
  color: #fff;
  cursor: pointer;
  border: solid 1px #ba68c8;
} */
</style>
