<template>
  <slot-dialog :narrow="true">
    <h3 class="mb-4">Passwortwiederherstellung</h3>
    <NewPasswordConfirm v-if="confirm" />
    <NewPasswordRequest v-else />
  </slot-dialog>
</template>

<script setup>
defineProps({
  confirm: {
    type: String,
    default: "",
  },
});
</script>
