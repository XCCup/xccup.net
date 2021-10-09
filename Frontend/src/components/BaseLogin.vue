<template>
  <form class="px-4 py-3" @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label for="exampleDropdownFormEmail1" class="form-label">E-Mail</label>
      <input
        type="email"
        class="form-control"
        id="exampleDropdownFormEmail1"
        placeholder="E-Mail"
        v-model="email"
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
// import ApiService from "@/services/ApiService";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "BaseLogin",

  data() {
    return { email: "", password: "" };
  },
  computed: {
    ...mapGetters({
      getterLoginStatus: "getLoginStatus",
    }),
  },

  methods: {
    ...mapActions({
      actionLogin: "login",
    }),
    async handleSubmit() {
      this.actionLogin({
        email: this.email,
        password: this.password,
      });
      // TODO: If we do want to redirect: Do it here or in router config?
      // if (response === 200) {
      //   this.$router.push({
      //     name: "Profile",
      //   });
      // } else {
      //   console.log(this.getterLoginStatus);
      // }
    },
  },
};
</script>

<style scoped></style>
