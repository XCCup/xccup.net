<template>
  <div
    class="modal fade"
    id="addAircraftModal"
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

          <BaseInput label="Fluggerät" />

          <BaseSelect :options="getRankingClasses" label="Geräteklasse" />
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
import rankingClassNames from "@/assets/js/rankingClassNames";

export default {
  name: "AddAircraftModal",
  data() {
    return { brands: ["Ozone", "Flow", "AirG"] };
  },
  computed: {
    getRankingClasses() {
      const entries = Object.entries(rankingClassNames);
      let tmp = [];
      entries.forEach((e) => {
        tmp.push(e[1].long);
      });
      return tmp;
    },
  },
};
</script>
