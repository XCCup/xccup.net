<template>
  <div class="modal fade" id="removeGliderModal" tabindex="-1">
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
        <div class="modal-body">
          {{ glider?.brand + " " + glider?.model }} entfernen
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
          <button
            @click="onGliderRemoved"
            type="button"
            class="btn btn-primary"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: "ModalRemoveGlider",
  methods: {
    onGliderRemoved() {
      this.$emit("remove-glider", this.glider.id);
    },
  },
  props: {
    glider: Object,
  },
  emits: ["remove-glider"],
};
</script>
