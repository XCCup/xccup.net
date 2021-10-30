<template>
  <div id="upload" class="container">
    <h3>Flug hochladen</h3>
    <form @submit.prevent="sendFlightDetails">
      <div class="mb-3">
        <label for="igcUploadForm" class="form-label">
          Flug auswählen (.igc)
        </label>
        <input
          class="form-control"
          type="file"
          accept=".igc"
          id="igcUploadForm"
          @change="igcSelected"
        />
      </div>

      <div class="row">
        <div class="col">
          <BaseInput v-model="takeoff" label="Startplatz" :isDisabled="true" />
        </div>
        <div class="col">
          <BaseInput v-model="landing" label="Landeplatz" :isDisabled="true" />
        </div>
      </div>

      <div class="col-md-12">
        <div class="row d-flex align-items-end">
          <div class="col-md-9">
            <BaseSelect
              v-model="gliderName"
              label="Fluggerät"
              :showLabel="true"
              :options="[gliderName]"
              :isDisabled="!flightId"
            />
          </div>
          <div class="col-md-3 mt-3">
            <div class="d-grid gap-2">
              <button
                type="button"
                class="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#addGliderModal"
                :disabled="!flightId"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="my-3">
        <div class="form-floating mb-3">
          <textarea
            class="form-control"
            placeholder="Flugbericht"
            id="floatingTextarea2"
            style="height: 100px"
            v-model="flightReport"
            :disabled="!flightId"
          ></textarea>
          <label for="floatingTextarea2">Flugbericht</label>
        </div>
        <!-- Images -->
        <div class="mb-3">
          <form @submit.prevent="uploadImages">
            <label for="formImageUpload" class="form-label"
              >Bilder hinzufügen</label
            >

            <input
              class="form-control"
              type="file"
              id="formImageUpload"
              accept=".jpg, .jpeg"
              :disabled="!flightId"
              @change="imageSelected"
            />
            <div v-if="userImages[0]?.name" class="row my-4">
              <div class="col-4">
                <figure class="figure">
                  <!-- <img id="preview-image" /> -->
                  <img
                    id="preview-image"
                    class="figure-img img-fluid img-thumbnail"
                    alt=""
                  />

                  <figcaption class="figure-caption text-center">
                    {{ userImages[0]?.name }}
                  </figcaption>
                </figure>
              </div>
            </div>
            <button
              class="btn btn-primary mt-2"
              :disabled="imageUploadButtonDisabled"
            >
              Bilder hochladen
              <i v-if="imageUploadSuccessfull" class="bi bi-check2-circle"></i>
            </button>
          </form>
        </div>

        <div class="form-check mb-3">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="rulesAccepted"
            id="flexCheckDefault"
            :disabled="!flightId"
          />
          <label class="form-check-label" for="flexCheckDefault">
            Die Ausschreibung ist mir bekannt, flugrechtliche Auflagen wurden
            eingehalten.<br />
            Jeder Teilnehmer nimmt auf eigene Gefahr an diesem Wettbewerb teil.
            Ansprüche gegenüber dem Veranstalter, dem Ausrichter, dem
            Organisator, dem Wettbewerbsleiter sowie deren Helfer wegen
            einfacher Fahrlässigkeit sind ausgeschlossen. Mit dem Anklicken des
            Häckchens erkenne ich die
            <a href="#">Ausschreibung</a> und
            <a href="#">Datenschutzbestimmungen</a>
            an.
          </label>
        </div>
        <!-- Send Button -->
        <button
          type="submit"
          class="btn btn-primary me-1"
          :disabled="sendButtonIsDisabled"
        >
          Streckenmeldung absenden
        </button>
      </div>
    </form>
  </div>
  <ModalAddGlider />
</template>

<script>
import ApiService from "@/services/ApiService";
import ModalAddGlider from "@/components/ModalAddGlider";

import { mapGetters, useStore } from "vuex";
import { ref } from "vue";

export default {
  name: "UploadForm",
  components: { ModalAddGlider },
  async setup() {
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
    // TODO: Clean up orphaned/duplicate variables
    return {
      igc: {
        name: "",
        body: null,
      },
      // TODO: implement this
      selectedGlider: {
        brand: "Ozone",
        model: "Enzo 4",
        gliderClass: "D_high",
      },

      // TODO: Change rules to false for production
      rulesAccepted: true,
      flightId: null,
      externalId: null,
      takeoff: "",
      landing: "",
      userImages: [],
      imageUploadSuccessfull: false,
      imageUploadButtonDisabled: true,
      flightReport: "",
    };
  },
  computed: {
    ...mapGetters({
      getterUserId: "getUserId",
    }),
    sendButtonIsDisabled() {
      return this.flightId && this.rulesAccepted === true ? false : true;
    },
    gliderName() {
      if (!this.userDetails.gliders) return;
      return this.userDetails.gliders.map((glider) => glider.model);
    },
  },
  methods: {
    readFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (res) => {
          resolve(res.target.result);
        };
        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
      });
    },
    async sendFlightDetails() {
      try {
        const response = await ApiService.uploadFlightDetails(this.flightId, {
          glider: this.selectedGlider,
          report: this.flightReport,
        });
        if (response.status != 200) throw response.statusText;
        this.routeToFlight(this.externalId);
      } catch (error) {
        console.log(error);
      }
    },
    imageSelected(event) {
      // This can already handle multiples files
      event.target.files.forEach((element) => {
        this.userImages.push(element);
      });

      var reader = new FileReader();
      reader.onload = function () {
        var output = document.getElementById("preview-image");
        output.src = reader.result;
      };
      reader.readAsDataURL(event.target.files[0]);
      this.imageUploadButtonDisabled = false;
    },
    async uploadImages() {
      // TODO: Handle multiple file upload
      try {
        const formData = new FormData();
        formData.append("image", this.userImages[0], this.userImages[0].name);
        // TODO: Remove hardcoded IDs for development
        formData.append("flightId", "0d3294d5-0031-4c5d-a6c9-fd173694ba21");
        formData.append("userId", "cd1583d1-fb7f-4a93-b732-effd59e5c3ae");
        // formData.append("flightId", this.flightId);
        // formData.append("userId", this.flightDetails.userId);
        const response = await ApiService.uploadImages(formData);
        console.log(response);
        if (response.status != 200) throw response.statusText;
        this.imageUploadSuccessfull = true;
        this.imageUploadButtonDisabled = true;
      } catch (error) {
        console.log(error);
      }
    },
    async sendIgc() {
      if (this.igc.body == null) return;
      try {
        return await ApiService.uploadIgc({ igc: this.igc });
      } catch (error) {
        console.log(error);
      }
    },
    async igcSelected(file) {
      this.flightId = null;
      try {
        if (!file.target.files[0]) return;

        this.igc.body = await this.readFile(file.target.files[0]);
        this.igc.name = file.target.files[0].name;
        const response = await this.sendIgc();
        if (response.status != 200) throw "Server error";
        this.flightId = response.data.flightId;
        this.externalId = response.data.externalId;
        this.takeoff = response.data.takeoff;
        this.landing = response.data.landing;
      } catch (error) {
        console.log(error);
      }
    },
    routeToFlight(id) {
      this.$router.push({
        name: "Flight",
        params: {
          flightId: id,
        },
      });
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 800px !important;
}
</style>
