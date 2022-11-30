<template>
  <div v-if="flight" id="foo" class="row my-4" data-cy="flight-details-pilot">
    <div class="col-12 col-md-6">
      <div class="d-flex">
        <img :src="avatarUrl" class="rounded-circle" />
        <div class="ms-4 mt-1">
          <router-link
            :to="{
              name: 'FlightsAll',
              query: { userId: flight.user?.id },
            }"
          >
            <h4>{{ flight.user?.fullName }}</h4>
          </router-link>
          <router-link
            :to="{
              name: 'FlightsAll',
              query: { clubId: flight.club?.id },
            }"
          >
            <h6>{{ flight.club?.name }}</h6>
          </router-link>

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
      </div>
    </div>
    <div
      v-if="flight.isNewPersonalBest"
      class="col-12 col-md-6 text-md-end mt-4 mt-md-0 h5"
      data-cy="personal-best-tag"
    >
      <i class="bi bi-award me-1"></i>Neue Persönliche Bestleistung
    </div>
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

/* @media (max-width: 768px) {
  .rounded-circle {
    height: 50px;
    width: 50px;
  }
} */
</style>
