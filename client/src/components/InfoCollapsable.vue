<template>
  <a
    data-bs-toggle="collapse"
    :href="'#' + $attrs.id + 'CollapseDiv'"
    role="button"
    aria-expanded="false"
    aria-controls="collapseExample"
  >
    <i class="bi bi-info-circle me-1"></i
    ><span v-if="label" class="fst-italic">{{ label }}</span>
  </a>
  <div :id="$attrs.id + 'CollapseDiv'" class="collapse">
    <div class="card card-body mt-3">
      {{ infoMessage }}
    </div>
  </div>
</template>

<script lang="ts" setup>
defineProps({
  label: {
    type: String,
    required: false,
    default: "",
  },
  infoMessage: {
    type: String,
    required: true,
  },
});
</script>
