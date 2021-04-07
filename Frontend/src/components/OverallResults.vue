<template>
  <!-- Tabs -->
  <div class="container mt-2">
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
          id="profile-tab"
          data-bs-toggle="tab"
          data-bs-target="#profile"
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
        <TopFlights />
      </div>
      <div class="tab-pane fade" id="profile" role="tabpanel">
        <ClassRanking />
      </div>
      <div class="tab-pane fade" id="club" role="tabpanel">
        <ClubRanking />
      </div>
      <div class="tab-pane fade" id="team" role="tabpanel">
        <TeamRanking />
      </div>
    </div>
  </div>
</template>

<script>
import ClassRanking from "@/components/rankings/ClassRanking.vue";
import ClubRanking from "@/components/rankings/ClubRanking.vue";
import TeamRanking from "@/components/rankings/TeamRanking";
import TopFlights from "@/components/rankings/TopFlights";

export default {
  components: { ClassRanking, ClubRanking, TeamRanking, TopFlights },
  name: "OverallResults",
};
</script>

<style scoped></style>
