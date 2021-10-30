<template>
  <div
    class="modal fade"
    id="addGliderModal"
    tabindex="-1"
    aria-labelledby="addAircraftModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="addAircraftModalLabel">
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
          <div class="mb-3"></div>
          <BaseInput label="Fluggerät" />

          <BaseSelect :options="gliderClass" label="Geräteklasse" />
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
export default {
  name: "ModalAddGlider",
  data() {
    return {
      brands: ["Ozone", "Flow", "AirG"],
      // DIRTY
      gliderClass: ["EN-A", "EN-B"],
    };
  },
  computed: {
    getRankingClasses() {
      // TODO: This needs repair

      // const entries = Object.entries(rankingClassNames);
      // let tmp = [];
      // entries.forEach((e) => {
      //   tmp.push(e[1].long);
      // });
      return null;
    },
  },
};
</script>
