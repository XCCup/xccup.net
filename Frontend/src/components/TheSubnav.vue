<template>
  <div class="container-fluid flight-info text-light mb-0 p-1">
    <p class="m-0">
      <router-link to="/"><i class="bi bi-chevron-left mx-2"></i> </router-link>

      Flug von
      <a href="#">{{ flight.User.firstName + " " + flight.User.lastName }}</a>
      am
      <a href="#"><BaseDate :timestamp="flight.dateOfFlight" /></a>
    </p>
  </div>
</template>

<script>
export default {
  name: "TheSubnav",
  components: {},
  data() {
    return {};
  },
  props: {
    flight: {
      type: Object,
      required: true,
    },
  },
  methods: {},
  computed: {},
};
</script>

<style></style>
