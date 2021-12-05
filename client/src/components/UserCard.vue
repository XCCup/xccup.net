<template>
  <div class="card-header"></div>
  <div class="card-body row align-items-center">
    <!-- TODO: Cols should wrap in own row when viewport width shrinks -->
    <div class="col-xl-4 row align-items-center">
      <div class="col-6">
        <div class="profile-image">
          <router-link
            :to="{
              name: 'FlightsAll',
              query: { userId: user.id },
            }"
          >
            <img :src="avatarUrl" />
          </router-link>
        </div>
      </div>
      <div class="col-6">
        <div>
          <router-link
            :to="{
              name: 'FlightsAll',
              query: { userId: user.id },
            }"
          >
            <h5 class="row card-title cy-user-name-label">
              {{ user.firstName }} {{ user.lastName }}
            </h5>
          </router-link>
        </div>
        <div class="row">
          <button
            class="col btn btn-primary cy-mail-button"
            @click="onMessagePilot"
          >
            <i class="bi bi-envelope"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="col-xl-4 row align-items-center">
      <div class="col-6">
        <div>
          <strong>Club</strong>
          <router-link
            :to="{
              name: 'FlightsAll',
              query: { clubId: user.club.id },
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
                query: { teamId: user.team.id },
              }"
            >
              {{ user.team?.name }}</router-link
            >
          </div>
          <div v-else>🤷</div>
        </div>
      </div>
      <div class="col-6">
        <div><strong>Hangar</strong></div>
        <ul v-if="user.gliders.length" class="list-group">
          <li v-for="glider in user.gliders" :key="glider.id">
            <RankingClass :ranking-class="createRankingClass(glider)" />{{
              glider.brand
            }}
            {{ glider.model }}
          </li>
        </ul>
        <div v-else>🕵️</div>
      </div>
    </div>
    <div class="col-xl-4">
      <div><strong>Rekorde</strong></div>
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

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["open-message-dialog"]);

const avatarUrl = ref(
  `https://avatars.dicebear.com/api/avataaars/${props.user.id}.svg`
);

const createRankingClass = (glider) => {
  return {
    key: glider.gliderClass,
    description: glider.gliderClassShortDescription,
  };
};

const onMessagePilot = () => {
  emit("open-message-dialog", props.user);
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
