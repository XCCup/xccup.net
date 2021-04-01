<template>
  <div class="flug-melden mb-5">
    <div id="upload" class="container">
      <h3>Flug hochladen</h3>
      <form>
        <div class="mb-3">
          <label for="formFile" class="form-label">.igc auswählen</label>
          <input class="form-control" type="file" id="formFile" />
        </div>

        <div class="row">
          <div class="col">
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control"
                id="floatingInput"
                placeholder="Fluggerät"
                disabled
                value="Zeltingen-Rachtig"
              />
              <label for="floatingInput">Startplatz</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating mb-3">
              <input
                type="text"
                class="form-control"
                id="floatingInput"
                placeholder="Fluggerät"
                disabled
                value="Boppard"
              />
              <label for="floatingInput">Landeplatz</label>
            </div>
          </div>
        </div>

        <select class="form-select mb-3" aria-label="Default select example">
          <option selected>Fluggerät wählen</option>
          <option value="1">Enzo 3 S</option>
          <option value="2">XC Racer S</option>
        </select>

        <div class="mb-3">
          <p>Oder neues Fluggerät hinzufügen:</p>

          <select class="form-select mb-3" aria-label="Default select example">
            <option selected>Hersteller</option>
            <option value="1">Ozone</option>
            <option value="2">Skywalk</option>
          </select>
          <div class="form-floating mb-3">
            <input
              type="text"
              class="form-control"
              id="floatingInput"
              placeholder="Fluggerät"
            />
            <label for="floatingInput">Fluggerät</label>
          </div>
          <select class="form-select mb-3" aria-label="Default select example">
            <option selected>Geräteklasse</option>
            <option value="1">Sport</option>
            <option value="2">Performance</option>
          </select>
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
  </div>
</template>

<script>
export default {
  name: "UploadForm",
};
</script>

<style scoped></style>
