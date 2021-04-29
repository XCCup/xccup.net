<template>
  <div class="flug-melden mb-5">
    <div id="upload" class="container">
      <h3>Flug hochladen</h3>
      <form @submit.prevent="sendForm">
        <div class="mb-3">
          <label for="formFile" class="form-label">.igc auswählen</label>
          <input class="form-control" type="file" id="formFile" />
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
          <div class="row mt-2">
            <div class="col-md-9">
              <BaseSelect
                v-model="flight.glider"
                label="Fluggerät"
                :showLabel="true"
                :options="[flight.glider]"
              />
            </div>
            <div class="col-md-3">
              <div class="d-grid gap-2">
                <button
                  type="button"
                  class="btn btn-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#addAircraftModal"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <div class="form-floating mb-3">
            <textarea
              class="form-control"
              placeholder="Flugbericht"
              id="floatingTextarea2"
              style="height: 100px"
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
              value=""
              id="flexCheckDefault"
            />
            <label class="form-check-label" for="flexCheckDefault">
              Die Ausschreibung ist mir bekannt, flugrechtliche Auflagen wurden
              eingehalten.<br />
              Jeder Teilnehmer nimmt auf eigene Gefahr an diesem Wettbewerb
              teil. Ansprüche gegenüber dem Veranstalter, dem Ausrichter, dem
              Organisator, dem Wettbewerbsleiter sowie deren Helfer wegen
              einfacher Fahrlässigkeit sind ausgeschlossen. Mit dem Anklicken
              des Häckchens erkenne ich die
              <a href="#">Ausschreibung</a> und
              <a href="#">Datenschutzbestimmungen</a>
              an.
            </label>
          </div>

          <button type="submit" class="btn btn-primary me-1">
            Streckenmeldung absenden
          </button>
          <button type="submit" class="btn btn-danger">Abbrechen</button>
        </div>
      </form>
    </div>
    {{ flight }}
    <AddAircraftModal />
  </div>
</template>

<script>
import FlightService from "@/services/FlightService";
import AddAircraftModal from "@/components/AddAircraftModal";

export default {
  name: "UploadForm",
  components: { AddAircraftModal },
  data() {
    return {
      flight: {
        glider: "XCRacer S",
        brand: "",
        rankingClass: "",
        takeoff: "Bremm",
        landing: "Zeltingen-Rachtig",
      },

      rankingClass: [
        "GS Competition high (EN-D oder CCC und einer Streckung von 7,0 und mehr)",
        "GS Performance low (EN-D und einer Streckung von <7,0)",
      ],
      brands: ["Ozone", "Flow", "AirG"],
    };
  },
  methods: {
    async sendForm() {
      try {
        const response = await FlightService.uploadFlight(this.flight.takeoff);
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    },
  },
};
</script>

<style scoped></style>
