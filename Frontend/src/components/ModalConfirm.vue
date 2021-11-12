<template>
  <div :id="modalId" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 :id="modalId + 'Label'" class="modal-title">Bist du sicher?</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">{{ messageBody }}</div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
            @click="confirmCancel"
          >
            Abbrechen
          </button>
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
            @click="confirmOk"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
const props = defineProps({
  modalId: {
    type: String,
    default: "confirmModal",
  },
  transferObject: {
    type: Object,
    default: () => {},
  },
  messageBody: {
    type: String,
    default: "Möchtest du diese Aktion bestätigen?",
  },
});

//TODO Remove this log; For now keep it for debugging
console.log("Modal ID: ", props.modalId);

const emit = defineEmits(["confirm-result", "confirm-result"]);

const confirmOk = () => {
  emit("confirm-result", true, props.transferObject);
};
const confirmCancel = () => {
  emit("confirm-result", false, props.transferObject);
};
</script>
