<template>
  <i class="bi bi-trophy" :class="rankingClass"></i>
  {{ getHumanReadableRankingClass(rankingClass) }}
</template>

<script>
import rankingClassNames from "@/assets/js/rankingClassNames";
export default {
  name: "RankingClass",
  props: {
    rankingClass: {
      type: String,
      required: true,
    },
  },
  methods: {
    getHumanReadableRankingClass(rankingClass) {
      return rankingClassNames[rankingClass].short;
    },
  },
};
</script>
