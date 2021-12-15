<template>
  <div :id="modalId" class="modal fade" tabindex="-1">
    <div
      class="modal-dialog modal-lg"
      :class="scrollable ? 'modal-dialog-scrollable' : ''"
    >
      <div class="modal-content">
        <div v-if="false" class="modal-header">
          <h5 class="modal-title">{{ modalTitle }}</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
          ></button>
        </div>
        <div class="modal-body">
          <slot></slot>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-outline-primary"
            data-bs-dismiss="modal"
          >
            Schließen
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
  scrollable: {
    type: Boolean,
    default: false,
  },
});
</script>
