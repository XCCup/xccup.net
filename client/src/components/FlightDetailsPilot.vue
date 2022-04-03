<template>
  <div v-if="flight" class="d-flex my-4" data-cy="flight-details-pilot">
    <div>
      <img :src="avatarUrl" class="rounded-circle" />
    </div>
    <div class="ms-4 mt-1">
      <router-link
        :to="{
          name: 'FlightsAll',
          query: { userId: flight.user?.id },
        }"
      >
        <h4>{{ flight.user?.firstName + " " + flight.user?.lastName }}</h4>
      </router-link>
      <a href="#"
        ><h6>{{ flight.club?.name }}</h6></a
      >
      <p>
        <router-link
          :to="{
            name: 'FlightsAll',
            query: { teamId: flight.team?.id },
          }"
        >
          <div>
            {{ flight.team?.name }}
          </div>
        </router-link>
      </p>
    </div>

    <div class="ms-auto"></div>
  </div>
</template>

<script setup>
import useFlight from "@/composables/useFlight";
import { createUserPictureUrl } from "../helper/profilePictureHelper";

const { flight } = useFlight();
const avatarUrl = createUserPictureUrl(flight.value?.user?.id, {
  size: "thumb",
});
</script>

<style scoped>
.rounded-circle {
  margin-right: 6px;
  height: 100px;
  width: 100px;
}
</style>
