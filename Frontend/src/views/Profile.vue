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
                <BaseInput v-model="authUser.name" label="Name" />
              </div>
              <div class="col-md-6">
                <BaseInput v-model="authUser.surname" label="Nachname" />
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-md-12">
                <BaseInput
                  v-model="authUser.club"
                  label="Verein"
                  :disabled="true"
                />
              </div>
              <div class="col-md-12">
                <BaseInput v-model="authUser.birthday" label="Geburtstag" />
              </div>
              <div class="col-md-12">
                <BaseInput v-model="authUser.email" label="E-Mail" />
              </div>
              <div class="col-md-12">
                <BaseSelect
                  v-model="authUser.sex"
                  label="Geschlecht"
                  :options="['männlich', 'weiblich']"
                />
              </div>
              <div class="col-md-12">
                <BaseSelect
                  v-model="authUser.shirtSize"
                  label="T-Shirt Größe"
                  :options="['S', 'M', 'L', 'XL', 'XXL']"
                />
              </div>
              <div class="col-md-12">
                <p>Fluggeräte:</p>

                <div class="row mt-2">
                  <div class="col-md-9">
                    <BaseSelect
                      v-model="listOfAircrafts[0]"
                      label="Geräte"
                      :options="listOfAircrafts"
                    />
                  </div>
                  <div class="col-md-3">
                    <div class="d-grid gap-2">
                      <button
                        class="btn btn-primary"
                        data-bs-toggle="modal"
                        data-bs-target="#exampleModal"
                      >
                        Hinzufügen
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

  <!-- Modal -->
  <div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">
            Fluggerät hinzufügen
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <BaseSelect :options="brands" label="Hersteller" />

          <BaseInput label="Fluggerät" type="text" />

          <BaseSelect :options="rankingClass" label="Geräteklasse" />
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
          <button type="button" class="btn btn-primary">Speichern</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Profile",
  data() {
    return {
      brands: ["Ozone", "Flow", "AirG"],
      rankingClass: [
        "GS Competition high (EN-D oder CCC und einer Streckung von 7,0 und mehr)",
        "GS Performance low (EN-D und einer Streckung von <7,0)",
      ],
    };
  },
  computed: {
    ...mapGetters(["authUser"]),
    listOfAircrafts() {
      let aircraftList = [];
      this.authUser.aircrafts.forEach((element) => {
        aircraftList.push(`${element.brand} ${element.model}`);
      });
      return aircraftList;
    },
  },
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    save() {
      console.log("save");
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
