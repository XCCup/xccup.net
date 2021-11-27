<template>
  <div :id="modalId" class="modal fade" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ modalTitle }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div v-if="modalBody" class="modal-body">
          <p>{{ modalBody }}</p>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn"
            :class="isDangerousAction ? 'btn-danger' : 'btn-primary'"
            data-bs-dismiss="modal"
            @click="confirmAction"
          >
            {{ confirmButtonText }}
          </button>
          <button
            type="button"
            class="btn"
            :class="
              isDangerousAction ? 'btn-outline-primary' : 'btn-outline-danger'
            "
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modalId: {
    type: String,
    required: true,
  },
  modalTitle: {
    type: String,
    required: true,
  },
  modalBody: {
    type: String,
    required: false,
    default: null,
  },
  confirmButtonText: {
    type: String,
    required: true,
  },
  confirmAction: {
    type: Function,
    required: true,
  },
  isDangerousAction: {
    type: Boolean,
    default: false,
  },
});
</script>
