<template>
  <div v-if="rankingClass">
    <i class="bi bi-trophy" :class="rankingClass.key"></i>
    {{
      short == true ? rankingClass.shortDescription : rankingClass.description
    }}
  </div>
</template>

<script setup>
const props = defineProps({
  rankingClass: {
    type: Object,
    required: true,
  },
  short: {
    type: Boolean,
    required: false,
    default: false,
  },
});
</script>
