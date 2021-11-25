<template>
  <div class="container mt-3">
    <!-- Editor -->
    <div v-if="userDetails">
      <div class="row">
        <!-- Left -->
        <div class="col-md-3">
          <div class="d-flex flex-column align-items-center text-center p-3">
            <img
              class="rounded-circle"
              width="150px"
              src="https://avatars.dicebear.com/api/big-ears/your-custom-seed.svg?b=%23d9eb37"
            />
            <span class="font-weight-bold">Foo</span>
            <span class="text-light">Bar</span>
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
                  :is-disabled="true"
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
                      :show-label="true"
                      :options="['M', 'W', 'D']"
                    />
                  </div>
                  <div class="col-md-6">
                    <BaseSelect
                      v-model="userProfile.tshirtSize"
                      label="T-Shirt Größe"
                      :show-label="true"
                      :options="['S', 'M', 'L', 'XL', 'XXL']"
                    />
                  </div>
                </div>

                <div class="mt-3"></div>
              </div>
            </div>
            <h5>Benachrichtigungen</h5>
            <div class="form-check">
              <input
                id="notifyForComment"
                v-model="userProfile.emailInformIfComment"
                class="form-check-input"
                type="checkbox"
                value
              />
              <label class="form-check-label" for="flexCheckDefault">
                Email bei neuem Kommentar
                <i class="bi bi-info-circle"></i>
              </label>
            </div>
            <div class="form-check">
              <input
                id="optInNewsletter"
                v-model="userProfile.emailNewsletter"
                class="form-check-input"
                type="checkbox"
                value
              />
              <label class="form-check-label" for="flexCheckDefault">
                Newsletter abonnieren
                <i class="bi bi-info-circle"></i>
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
              <i v-if="showSuccessInidcator" class="bi bi-check-circle"></i>
            </button>

            <hr />
            <div id="glider-select" class="col-md-12">
              <GliderList
                :gliders="userProfile.gliders"
                :default-glider="userProfile.defaultGlider"
                @gliders-changed="glidersChanged"
              />
            </div>
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
            </div>-->
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
                  <div class="col-md-6">{{ userProfile.address.zip }}</div>
                  <div class="col-md-6">{{ userProfile.address.city }}</div>
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
                      :show-label="true"
                      :options="['M', 'W', 'D']"
                    />
                  </div>
                  <div class="col-md-6">
                    <BaseSelect
                      v-model="userProfile.tshirtSize"
                      label="T-Shirt Größe"
                      :show-label="true"
                      :options="['S', 'M', 'L', 'XL', 'XXL']"
                    />
                  </div>
                </div>

                <div class="mt-3"></div>
              </div>
              <div class="col-md-12">
                <div class="row d-flex align-items-end">
                  <div class="col-md-7">
                    <div class>
                      <GliderSelect
                        v-model="userProfile.defaultGlider"
                        :show-label="true"
                        label="Standard Gerät"
                        :gliders="userProfile.gliders"
                        :is-disabled="false"
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
                        data-bs-target="#confirmModal"
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
                id="notifyForComment"
                v-model="userProfile.emailInformIfComment"
                class="form-check-input"
                type="checkbox"
                value
              />
              <label class="form-check-label" for="flexCheckDefault">
                Email bei neuem Kommentar
                <i class="bi bi-info-circle"></i>
              </label>
            </div>
            <div class="form-check">
              <input
                id="optInNewsletter"
                v-model="userProfile.emailNewsletter"
                class="form-check-input"
                type="checkbox"
                value
              />
              <label class="form-check-label" for="flexCheckDefault">
                Newsletter abonnieren
                <i class="bi bi-info-circle"></i>
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
            </div>-->
            <!-- Edit -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import ApiService from "@/services/ApiService.js";
import { ref } from "vue";
import cloneDeep from "lodash/cloneDeep";
import { setWindowName } from "../helper/utils";

setWindowName("Profil");
export default {
  name: "UserProfile",
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
    scrollToGliderSelect: {
      type: Boolean,
      default: false,
    },
  },
  async setup() {
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
      showSuccessInidcator: false,
    };
  },
  computed: {
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
  mounted() {
    // Scroll to anchor if it exists after mounting
    const el = document.querySelector("#glider-select");
    if (el && this.scrollToGliderSelect) el.scrollIntoView();
  },
  methods: {
    inidcateSuccess() {
      this.showSuccessInidcator = true;
      setTimeout(() => (this.showSuccessInidcator = false), 2000);
    },

    async glidersChanged(data) {
      try {
        // const res = await ApiService.getUserDetails();
        this.userProfile.gliders = data.gliders;
        this.userProfile.defaultGlider = data.defaultGlider;

        // this.unmodifiedUserProfile = cloneDeep(this.userProfile);
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    },
    async save() {
      try {
        this.showSpinner = true;
        const res = await ApiService.updateUserProfile(this.userProfile);
        if (res.status != 200) throw res.statusText;
        this.userProfile = res.data;
        this.unmodifiedUserProfile = cloneDeep(this.userProfile);
        this.showSpinner = false;
        this.inidcateSuccess();
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

<style scoped></style>
