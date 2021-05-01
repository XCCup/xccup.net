<template>
  <div
    class="modal fade"
    id="removeAircraftModal"
    tabindex="-1"
    aria-labelledby="removeAircraftModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="removeAircraftModalLabel">
            Bist du sicher?
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">{{ aircraft }} entfernen</div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
          <button type="button" class="btn btn-primary">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "removeAircraftModal",
  data() {
    return {};
  },
  props: {
    aircraft: String,
  },
};
</script>
