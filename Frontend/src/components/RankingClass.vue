<template>
  <div v-if="rankingClass">
    <i class="bi bi-trophy" :class="rankingClass.key"></i>
    {{ rankingClass.description }}
  </div>
</template>

<script>
export default {
  name: "RankingClass",
  props: {
    rankingClass: {
      type: Object,
      required: true,
    },
  },
};
</script>
