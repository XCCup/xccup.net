<template>
  <form class="px-4 py-3" @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label for="exampleDropdownFormEmail1" class="form-label">E-Mail</label>
      <input
        type="text"
        class="form-control"
        id="exampleDropdownFormEmail1"
        placeholder="E-Mail"
        v-model="username"
      />
    </div>
    <div class="mb-3">
      <label for="exampleDropdownFormPassword1" class="form-label"
        >Passwort</label
      >
      <input
        type="password"
        class="form-control"
        id="exampleDropdownFormPassword1"
        placeholder="Passwort"
        v-model="password"
      />
    </div>
    <div class="mb-3">
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="dropdownCheck" />
        <label class="form-check-label" for="dropdownCheck">
          Angemeldet bleiben
        </label>
      </div>
    </div>
    <button type="submit" class="btn btn-primary">Anmelden</button>
  </form>
  <div class="dropdown-divider"></div>
  <a class="dropdown-item" href="#">Registrieren</a>
  <a class="dropdown-item" href="#">Password vergessen?</a>
</template>

<script>
// import FlightService from "@/services/FlightService";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "BaseLogin",

  data() {
    return { username: "", password: "" };
  },
  computed: {
    ...mapGetters("auth", {
      getterLoginStatus: "getLoginStatus",
    }),
  },

  methods: {
    ...mapActions("auth", {
      actionLogin: "login",
    }),
    async handleSubmit() {
      const response = await this.actionLogin({
        name: this.username,
        password: this.password,
      });
      if (response === 200) {
        this.$router.push({
          name: "Profile",
        });
      } else {
        console.log(this.getterLoginStatus);
      }
    },
  },
};
</script>

<style scoped></style>
