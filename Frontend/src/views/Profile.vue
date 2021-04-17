<template>
  <div class="container">
    <h2>Profil</h2>
    <div v-if="!edit">
      {{ authUser.name }}
      <router-link :to="{ name: 'ProfileEdit' }" class="btn btn-primary">
        Edit
      </router-link>
    </div>
    <div v-if="edit">
      <div>Edit: {{ authUser.name }}</div>

      <button class="btn btn-primary" @click="save">Speichern</button>
      <button class="btn btn-outline-danger" @click="cancel">Abbrechen</button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";

export default {
  name: "Profile",
  computed: {
    ...mapGetters(["authUser"]),
  },
  props: {
    edit: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    save() {
      console.log("save");
    },
    cancel() {
      this.$router.push({ name: "Profile" });
    },
  },
};
</script>
