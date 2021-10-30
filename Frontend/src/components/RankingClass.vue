<template>
  <div v-if="rankingClass">
    <i class="bi bi-trophy" :class="rankingClass.key"></i>
    {{
      short == true ? rankingClass.shortDescription : rankingClass.description
    }}
  </div>
</template>

<script>
export default {
  name: "RankingClass",
  data() {
    return {
      foo: false,
    };
  },
  props: {
    rankingClass: {
      type: Object,
      required: true,
    },
    short: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
};
</script>
