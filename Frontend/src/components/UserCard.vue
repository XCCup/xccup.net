<template>
  <div class="card-header"></div>
  <div class="card-body row justify-content-start align-items-center">
    <!-- TODO: Cols should wrap in own row when viewport width shrinks -->
    <div class="col-1">
      <div class="profile-image">
        <a href="" target="_blank">
          <img :src="avatarUrl" />
        </a>
      </div>
    </div>
    <div class="col-2">
      <div>
        <router-link
          :to="{
            name: 'FlightsAll',
            params: { userId: user.id, year: 2021 },
          }"
        >
          <h5 disabled="true" class="row card-title">
            {{ user.firstName }} {{ user.lastName }}
          </h5>
        </router-link>
      </div>
      <!-- <router-link
        class="btn btn-primary"
        :to="{
          name: 'User',
          params: { userId: user.id },
        }"
        >Rekorde</router-link
      > -->
      <div class="row justify-content-start">
        <button class="col me-5 btn btn-primary" @click="messagePilot(flight)">
          <i class="bi bi-envelope"></i>
        </button>
        <!-- <button class="col me-3 btn btn-primary" @click="messagePilot(flight)">
          <img
            src="https://img.icons8.com/ios/30/000000/airplane-take-off.png"
          />
        </button> -->
      </div>
    </div>
    <div class="col-2">
      <div>
        <strong>Club</strong>
        <router-link
          :to="{
            name: 'FlightsAll',
            params: { clubId: user.club.id, year: 2021 },
          }"
        >
          <div>{{ user.club.name }}</div>
        </router-link>
      </div>
      <div>
        <strong>Team</strong>
        <div v-if="user.team">
          <router-link
            :to="{
              name: 'FlightsAll',
              params: { teamId: user.team.id, year: 2021 },
            }"
          >
            {{ user.team?.name }}</router-link
          >
        </div>
        <div v-else>🤷</div>
      </div>
    </div>
    <div class="col-2">
      <div><strong>Hangar</strong> <br /></div>
      <ul v-if="user.gliders.length" class="list-group list-group-flush">
        <li v-for="glider in user.gliders" :key="glider.id">
          <RankingClass :ranking-class="createRankingClass(glider)" />{{
            glider.brand
          }}
          {{ glider.model }}
        </li>
      </ul>
      <div v-else>🕵️</div>
    </div>
    <div class="col-2">
      <div><strong>Rekorde</strong> <br /></div>
      <div class="row">
        <FlightShortSummary flight-type="FREE" :flight="user.records[0][0]" />
      </div>
      <div class="row">
        <FlightShortSummary flight-type="FLAT" :flight="user.records[1][0]" />
      </div>
      <div class="row">
        <FlightShortSummary flight-type="FAI" :flight="user.records[2][0]" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import RankingClass from "./RankingClass.vue";
// const baseURL = import.meta.env.VITE_API_URL;

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const avatarUrl = ref(
  `https://avatars.dicebear.com/api/avataaars/${props.user.id}.svg`
);

const createRankingClass = (glider) => {
  return {
    key: glider.gliderClass,
    description: glider.gliderClassShortDescription,
  };
};
</script>

<style scoped>
img {
  max-height: 100px;
}
button {
  max-width: 100px;
}
ul {
  list-style: none;
  padding-left: 0;
}
</style>
