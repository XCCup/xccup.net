<template>
  <!-- Alert -->
  <!-- <div class="alert alert-danger mb-0" role="alert">
    Bitte stelle sicher, dass du deinen Schirm für die Leichtgewichtswertung
    registriert hast, wenn du an dieser teilnehmen möchtest. Details dazu
    findest du unter
    <a href="https://xccup.net/news" class="alert-link"
      >Änderungen an der Ausschreibung</a
    >.
  </div> -->
  <!-- Alert -->
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
