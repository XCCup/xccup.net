<template>
  <div class="container mt-3">
    <!-- Editor -->
    <div class="rounded bg-white">
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
                <BaseInput v-model="userProfile.name" label="Name" />
              </div>
              <div class="col-md-6">
                <BaseInput v-model="userProfile.surname" label="Nachname" />
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-12">
                <BaseInput
                  v-model="userProfile.club"
                  label="Verein"
                  :isDisabled="true"
                />

                <BaseInput v-model="userProfile.birthday" label="Geburtstag" />
                <BaseInput v-model="userProfile.email" label="E-Mail" />

                <BaseSelect
                  v-model="userProfile.sex"
                  label="Geschlecht"
                  :showLabel="true"
                  :options="['männlich', 'weiblich']"
                />
                <div class="mt-3"></div>
                <BaseSelect
                  v-model="userProfile.shirtSize"
                  label="T-Shirt Größe"
                  :showLabel="true"
                  :options="['S', 'M', 'L', 'XL', 'XXL']"
                />
                <div class="mt-3"></div>
              </div>
              <div class="col-md-12">
                <div class="row d-flex align-items-end">
                  <div class="col-md-7">
                    <BaseSelect
                      v-model="userProfile.defaultAircraft.listName"
                      label="Standard Gerät"
                      :showLabel="true"
                      :options="listOfAircrafts"
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
              />
              <label class="form-check-label" for="flexCheckDefault">
                Newsletter abonnieren <i class="bi bi-info-circle"></i>
              </label>
            </div>

            <h5>Sonderwertungen</h5>

            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                value=""
                id="gsRLP"
              />
              <label class="form-check-label" for="flexCheckDefault">
                GS RLP <i class="bi bi-info-circle"></i>
              </label>
            </div>

            <div class="form-check">
              <input
                class="form-check-input"
                type="checkbox"
                value=""
                id="luxChampionat"
              />
              <label class="form-check-label" for="flexCheckDefault">
                Luxemburg XC-Championat <i class="bi bi-info-circle"></i>
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
    </div>
    <!-- Editor -->
  </div>

  <!-- Modals -->
  <AddGliderModal />
  <RemoveGliderModal :glider="userProfile.defaultAircraft.listName" />
</template>

<script>
import { mapGetters } from "vuex";
import AddGliderModal from "@/components/AddGliderModal";
import RemoveGliderModal from "@/components/RemoveGliderModal";
export default {
  name: "Profile",
  components: { AddGliderModal, RemoveGliderModal },
  data() {
    return {
      userProfile: null,
    };
  },
  computed: {
    ...mapGetters(["authUser"]),
    listOfAircrafts() {
      let gliderList = [];
      this.authUser.gliders.forEach((element) => {
        gliderList.push(`${element.brand} ${element.model}`);
      });
      return gliderList;
    },
  },
  beforeMount() {
    this.userProfile = { ...this.authUser };
  },
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
  },
  watch: {
    // userProfile() {
    //   this.userProfile = { ...this.authUser };
    // },
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
