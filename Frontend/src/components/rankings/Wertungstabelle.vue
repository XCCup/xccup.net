<template>
  <div class="card" v-if="wertung">
    <div class="card-body">
      <h6 class="card-title">
        <i class="bi bi-trophy" :class="wertung.rankingClass"></i>
        {{ wertung.rankingName }}
      </h6>
      <p class="card-text"></p>
      <table class="table">
        <thead></thead>
        <tbody>
          <tr v-for="(pilot, _, i) in wertung" :key="i">
            <td>{{ i + 1 }}</td>
            <td>{{ wertung.pilots[i].name }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
export default {
  name: "Wertungstabelle",
  props: {
    wertung: Object,
  },
};
</script>

<style scoped lang="scss"></style>
