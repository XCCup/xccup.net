<template>
  <!-- Alert -->
  <!-- <div class="alert alert-danger mb-0" role="alert">
    Erste Sonderwertung "Early Bird"
    <a href="#" class="alert-link">mehr Infos</a>
  </div> -->
  <!-- Alert -->
  <div class="header-image-parent">
    <section class="container-fluid header-image"></section>
  </div>
  <section v-if="seasonStats" class="py-3 text-center container">
    <div class="col-md-8 mx-auto">
      <!-- TODO: Replace with season details -->
      <h1 class="fw-light">XCCup {{ new Date().getFullYear() }}</h1>
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
/* TODO: Pick a nicer image */
.header-image {
  background-image: url("../assets/images/header/rachtig.jpg");
  height: 22vh;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center center;
}

@media (max-width: 2000px) {
  .header-image {
    background-image: url("../assets/images/header/rachtig-regular.jpg");
  }
}

@media (max-width: 1100px) {
  .header-image {
    background-image: url("../assets/images/header/rachtig-small.jpg");
  }
}

@media (max-width: 620px) {
  .header-image {
    background-image: url("../assets/images/header/rachtig-xsmall.jpg");
  }
}

@media (max-width: 310px) {
  .header-image {
    background-image: url("../assets/images/header/rachtig-thumb.jpg");
  }
}

/* .header-image-gradient {
  background-image: linear-gradient(
      to left,
      rgba(255, 0, 0, 0),
      rgb(26, 44, 51)
    ),
    url("../assets/images/rachtig.jpg");
} */
/* .header-image-parent {
  mask-image: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 50%,
    transparent 100%
  );
} */
</style>
