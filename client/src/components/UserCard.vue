<template>
  <div class="card-header"></div>
  <div class="card-body row">
    <div class="col-xl-4 row mb-3">
      <div class="col-6">
        <div class="profile-image">
          <router-link
            :to="{
              name: 'FlightsAll',
              query: { userId: user.id },
            }"
          >
            <img class="rounded-circle img-fluid" :src="avatarUrl" />
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
            <h5 class="card-title cy-user-name-label">
              {{ user.firstName }} {{ user.lastName }}
            </h5>
          </router-link>
        </div>
        <div>
          <button
            class="col btn btn-primary cy-mail-button w-50"
            @click="onMessagePilot"
          >
            <i class="bi bi-envelope"></i>
          </button>
        </div>
      </div>
    </div>
    <div class="col-xl-4 row mb-3">
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
        <div v-if="user.team">
          <strong>Team</strong>
          <div>
            <router-link
              :to="{
                name: 'FlightsAll',
                query: { teamId: user.team.id },
              }"
            >
              {{ user.team?.name }}</router-link
            >
          </div>
        </div>
      </div>
      <div class="col-6">
        <div><strong>Hangar</strong></div>
        <ul v-if="user.gliders.length" class="list-group list-unstyled">
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
    <div class="col-xl-4 row mb-3">
      <div class="col-6">
        <strong>Rekorde</strong>
        <div>
          <FlightShortSummary
            flight-type="FREE"
            :flight="user.records.free[0]"
          />
        </div>
        <div>
          <FlightShortSummary
            flight-type="FLAT"
            :flight="user.records.flat[0]"
          />
        </div>
        <div>
          <FlightShortSummary flight-type="FAI" :flight="user.records.fai[0]" />
        </div>
      </div>
      <div class="col-6">
        <strong>Statistiken</strong>
        <div>{{ user.stats.flights }} Flüge</div>
        <div>{{ user.stats.distance }} Kilometer</div>
        <div>{{ user.stats.points }} Punkte</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { createUserPictureUrl } from "../helper/profilePictureHelper";
import RankingClass from "./RankingClass.vue";

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["open-message-dialog"]);

const avatarUrl = ref(createUserPictureUrl(props.user.id), true);

const createRankingClass = (glider) => {
  return {
    key: glider.gliderClass.key,
    description: glider.gliderClass.shortDescription,
  };
};

const onMessagePilot = () => {
  emit("open-message-dialog", props.user);
};
</script>

<style scoped>
img {
  max-width: 120px;
}
</style>
