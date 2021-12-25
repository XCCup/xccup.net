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
          <BaseError :error-message="errorMessage" />

          <button
            type="button"
            class="btn"
            :class="isDangerousAction ? 'btn-danger' : 'btn-primary'"
            @click="confirmAction"
          >
            {{ confirmButtonText }}
            <BaseSpinner v-if="showSpinner" />
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
// TODO: Refactor this to have a show method exposed?
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
  showSpinner: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: [String, null],
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
