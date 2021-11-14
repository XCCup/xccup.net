<template>
  <!-- Tabs -->
  <div id="overallResultsTabPanel" class="container my-2">
    <h3>Gesamtwertung</h3>
    <ul class="nav nav-tabs" id="myTab" role="tablist">
      <li class="nav-item" role="presentation">
        <button
          class="nav-link active"
          id="topFlights-tab"
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
          class="nav-link"
          id="class-tab"
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
          class="nav-link"
          id="club-tab"
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
          class="nav-link"
          id="team-tab"
          data-bs-toggle="tab"
          data-bs-target="#team"
          type="button"
          role="tab"
        >
          Teamwertung
        </button>
      </li>
    </ul>
    <div class="tab-content" id="myTabContent">
      <div class="tab-pane fade show active" id="topFlights" role="tabpanel">
        <TopFlights :flights="topFlights" />
      </div>
      <div class="tab-pane fade" id="class" role="tabpanel">
        <ClassRanking :rankingByClass="rankingByClass" />
      </div>
      <div class="tab-pane fade" id="club" role="tabpanel">
        <ClubRanking :bestClubs="bestClubs" />
      </div>
      <div class="tab-pane fade" id="team" role="tabpanel">
        <TeamRanking :bestTeams="bestTeams" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
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
