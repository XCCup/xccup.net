<template>
  <!-- Alert -->
  <div class="alert alert-danger mb-0" role="alert">
    Erste Sonderwertung "Early Bird"
    <a href="#" class="alert-link">mehr Infos</a>
  </div>
  <!-- Alert -->

  <section class="container-fluid header-image"></section>
  <section v-if="seasonStats" class="py-3 text-center container">
    <div class="col-md-8 mx-auto">
      <h1 class="fw-light">XCCup 2021</h1>
      <p id="infoboxContent" class="lead">
        Der XCCup soll das Streckenfliegen in unserer Region fördern. Hierzu
        werden nach einem einfachen Prinzip Streckenflüge mit Gleitschirmen,
        Drachen oder Starrflüglern ausgewertet. Derzeit sind
        {{ seasonStats.numberOfUsers }} Piloten,
        {{ seasonStats.numberOfClubs }} Vereine und
        {{ seasonStats.numberOfTeams }} Teams gemeldet. In dieser Saison wurden
        insgesamt {{ seasonStats.totalFlightDistance }} km erflogen.
      </p>
    </div>
  </section>
</template>

<script>
export default {
  name: "InfoBox",
  props: {
    seasonStats: { type: Object, required: true },
  },
};
</script>

<style scoped>
/* .header-image-gradient {
  background-image: linear-gradient(
      to left,
      rgba(255, 0, 0, 0),
      rgb(26, 44, 51)
    ),
    url("../assets/images/rachtig.jpg");
} */
.header-image {
  background-image: url("../assets/images/rachtig.jpg");
  height: 22vh;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}
</style>
