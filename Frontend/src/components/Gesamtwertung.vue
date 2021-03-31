<template>
  <!-- Tabs -->
  <div class="container mt-2">
    <h3>Gesamtwertung</h3>
    <ul class="nav nav-tabs" id="myTab" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="topFluege-tab"
          data-bs-toggle="tab"
          data-bs-target="#topFluege"
          type="button"
          role="tab"
          aria-controls="topFluege"
          aria-selected="true"
        >
          Top Flüge
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="profile-tab"
          data-bs-toggle="tab"
          data-bs-target="#profile"
          type="button"
          role="tab"
          aria-controls="profile"
          aria-selected="false"
        >
          Gerätewertung
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="club-tab"
          data-bs-toggle="tab"
          data-bs-target="#club"
          type="button"
          role="tab"
          aria-controls="contact"
          aria-selected="false"
        >
          Vereinswertung
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          class="nav-link"
          id="team-tab"
          data-bs-toggle="tab"
          data-bs-target="#team"
          type="button"
          role="tab"
          aria-controls="contact"
          aria-selected="false"
        >
          Teamwertung
        </button>
      </li>
    </ul>
    <div class="tab-content" id="myTabContent">
      <div
        class="tab-pane fade show active"
        id="topFluege"
        role="tabpanel"
        aria-labelledby="topFluege-tab"
      >
        <TopFluege />
      </div>
      <div
        class="tab-pane fade"
        id="profile"
        role="tabpanel"
        aria-labelledby="profile-tab"
      >
        <Geraetewertung />
      </div>
      <div
        class="tab-pane fade"
        id="club"
        role="tabpanel"
        aria-labelledby="club-tab"
      >
        <Vereinswertung />
      </div>
      <div
        class="tab-pane fade"
        id="team"
        role="tabpanel"
        aria-labelledby="team-tab"
      >
        <Teamwertung />
      </div>
    </div>
  </div>
</template>

<script>
import Geraetewertung from "@/components/rankings/Geraetewertung.vue";
import Vereinswertung from "@/components/rankings/Vereinswertung.vue";
import Teamwertung from "@/components/rankings/Teamwertung";
import TopFluege from "@/components/rankings/TopFluege";

export default {
  components: { Geraetewertung, Vereinswertung, Teamwertung, TopFluege },
  name: "Gesamtwertung",
};
</script>

<style scoped></style>
