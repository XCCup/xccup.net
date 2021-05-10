<template>
  <div id="upload" class="container">
    <h3>Flug hochladen</h3>
    <form @submit.prevent="sendForm">
      <div class="mb-3">
        <label for="igcUploadForm" class="form-label">
          Flug auswählen (.igc)
        </label>
        <input
          class="form-control"
          type="file"
          accept=".igc"
          id="igcUploadForm"
          @change="handleIGC"
        />
      </div>

      <div class="row">
        <div class="col">
          <BaseInput
            v-model="flight.takeoff"
            label="Startplatz"
            :isDisabled="true"
          />
        </div>
        <div class="col">
          <BaseInput
            v-model="flight.landing"
            label="Landeplatz"
            :isDisabled="true"
          />
        </div>
      </div>

      <div class="col-md-12">
        <div class="row d-flex align-items-end">
          <div class="col-md-9">
            <BaseSelect
              v-model="flight.glider"
              label="Fluggerät"
              :showLabel="true"
              :options="[flight.glider]"
            />
          </div>
          <div class="col-md-3 mt-3">
            <div class="d-grid gap-2">
              <button
                type="button"
                class="btn btn-primary"
                data-bs-toggle="modal"
                data-bs-target="#addGliderModal"
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
            v-model="flight.report"
          ></textarea>
          <label for="floatingTextarea2">Flugbericht</label>
        </div>

        <div class="mb-3">
          <label for="formFileMultiple" class="form-label"
            >Bilder hinzufügen</label
          >
          <input
            class="form-control"
            type="file"
            id="formFileMultiple"
            multiple
          />
        </div>
        <div class="form-check mb-3">
          <input
            class="form-check-input"
            type="checkbox"
            v-model="rulesAccepted"
            id="flexCheckDefault"
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
  <AddGliderModal />
</template>

<script>
import FlightService from "@/services/FlightService";
import AddGliderModal from "@/components/AddGliderModal";

export default {
  name: "UploadForm",
  components: { AddGliderModal },
  data() {
    return {
      flight: {
        userId: "ccee643a-8460-406f-a363-89072f0f5540",
        glider: "XCRacer S",
        // brand: "Flow",
        // takeoff: "Bremm",
        // landing: "Zeltingen-Rachtig",
        report: "Lorem ipsum",
        igc: {
          name: "",
          body: null,
        },
      },
      rulesAccepted: true,
      validIgcSelected: false,
    };
  },
  computed: {
    sendButtonIsDisabled() {
      return this.validIgcSelected && this.rulesAccepted === true
        ? false
        : true;
    },
  },
  methods: {
    async sendForm() {
      if (this.flight.igc.body == null) return;
      try {
        const response = await FlightService.uploadFlight(this.flight);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    },
    handleIGC(file) {
      try {
        if (file.target.files[0]) {
          const reader = new FileReader();
          reader.onload = (e) => {
            this.flight.igc.body = e.target.result;
          };
          this.flight.igc.name = file.target.files[0].name;
          reader.readAsText(file.target.files[0]);
          this.validIgcSelected = true;
        }
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style scoped>
.container {
  max-width: 900px !important;
}
</style>
