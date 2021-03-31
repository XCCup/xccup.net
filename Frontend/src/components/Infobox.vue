<template>
  <!-- Alert -->
  <div class="alert alert-danger mb-0" role="alert">
    Erste Sonderwertung "Early Bird"
    <a href="#" class="alert-link">mehr Infos</a>
  </div>
  <section class="container-fluid header-image"></section>
  <section class="py-3 text-center container">
    <div class="col-md-8 mx-auto">
      <h1 class="fw-light">XCCup 2021</h1>
      <p class="lead">
        Der XCCup soll das Streckenfliegen in unserer Region fördern. Hierzu
        werden nach einem einfachen Prinzip Streckenflüge mit Gleitschirmen,
        Drachen oder Starrflüglern ausgewertet. Derzeit sind 829 Piloten, 19
        Vereine und 33 Teams gemeldet. In dieser Saison wurden insgesamt 235 km
        erflogen.
      </p>
      <p>
        <a href="#" class="btn btn-outline-secondary my-2">Ausschreibung</a>
      </p>
    </div>
  </section>
</template>

<script>
export default {
  name: "Infobox",
  props: {
    msg: String,
  },
};
</script>

<style scoped lang="scss"></style>
