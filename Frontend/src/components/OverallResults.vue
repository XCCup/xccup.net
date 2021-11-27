<template>
  <!-- Tabs -->
  <div v-if="rankingByClass" id="overallResultsTabPanel" class="container my-2">
    <h3>Gesamtwertung</h3>
    <ul id="myTab" class="nav nav-tabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          id="topFlights-tab"
          class="nav-link active"
          data-bs-toggle="tab"
          data-bs-target="#topFlights"
          type="button"
          role="tab"
        >
          Top Flüge
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          id="class-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#class"
          type="button"
          role="tab"
        >
          Gerätewertung
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          id="club-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#club"
          type="button"
          role="tab"
        >
          Vereinswertung
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button
          id="team-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#team"
          type="button"
          role="tab"
        >
          Teamwertung
        </button>
      </li>
    </ul>
    <div id="myTabContent" class="tab-content">
      <div id="topFlights" class="tab-pane fade show active" role="tabpanel">
        <TopFlights :flights="topFlights" />
      </div>
      <div id="class" class="tab-pane fade" role="tabpanel">
        <ClassRanking :ranking-by-class="rankingByClass" />
      </div>
      <div id="club" class="tab-pane fade" role="tabpanel">
        <ClubRanking :best-clubs="bestClubs" />
      </div>
      <div id="team" class="tab-pane fade" role="tabpanel">
        <TeamRanking :best-teams="bestTeams" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  rankingByClass: {
    type: Array,
    required: true,
  },
  topFlights: {
    type: Object,
    required: true,
  },
  bestClubs: {
    type: Object,
    required: true,
  },
  bestTeams: {
    type: Object,
    required: true,
  },
});
</script>
