<template>{{ authUser.name }}</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Profile",
  computed: {
    ...mapGetters(["authUser"]),
  },
};
</script>

<style></style>
