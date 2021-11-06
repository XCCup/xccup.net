<template>
  <div class="modal fade" id="confirmModal" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="confirmModalLabel">
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
          {{ messageBody }} 
        </div>
        <div class="modal-footer">
          <button
            @click="logMessage"
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
          <button
            @click="confirmOk"
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
  name: "ModalConfirm",
  methods: {
    confirmOk() {
      this.$emit("confirm-result", true);
    },
    logMessage() {
      console.log("MSG: ", this.messageBody);
    },
  },
  props: {
    glider: Object,
    messageBody: String,
  },
  emits: ["confirm-result"],
};
</script>
