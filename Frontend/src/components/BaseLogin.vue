<template>
  <form class="px-4 py-3" @submit.prevent="handleSubmit">
    <div class="mb-3">
      <label for="email" class="form-label">E-Mail</label>
      <input
        type="email"
        class="form-control"
        id="email"
        placeholder="E-Mail"
        v-model="email"
      />
    </div>
    <div class="mb-3">
      <label for="password" class="form-label">Passwort</label>
      <input
        type="password"
        class="form-control"
        id="password"
        placeholder="Passwort"
        v-model="password"
      />
    </div>
    <!-- Stay logged in not realy useful with JWT auth -->
    <!-- <div class="mb-3">
      <div class="form-check">
        <input type="checkbox" class="form-check-input" id="dropdownCheck" />
        <label class="form-check-label" for="dropdownCheck">
          Angemeldet bleiben
        </label>
      </div>
    </div> -->
    <button type="submit" class="btn btn-primary">Anmelden</button>
  </form>
  <!-- TODO: Dynamic classes depending on where this component is used? -->
  <div class="dropdown-divider"></div>
  <a class="dropdown-item" href="#">Registrieren</a>
  <a class="dropdown-item" href="#">Password vergessen?</a>
</template>

<script>
// import { mapActions, mapGetters } from "vuex";
import useUser from "@/composables/useUser";
const { login } = useUser();

export default {
  name: "BaseLogin",

  data() {
    return { email: "", password: "" };
  },
  // computed: {
  //   ...mapGetters({
  //     getterLoginStatus: "getLoginStatus",
  //   }),
  // },

  methods: {
    // ...mapActions({
    //   actionLogin: "login",
    // }),
    async handleSubmit() {
      try {
        const response = await login({
          email: this.email,
          password: this.password,
        });
        // Redirect after login
        if (response.status === 200) {
          let searchParams = new URLSearchParams(window.location.search);
          if (searchParams.has("redirect")) {
            this.$router.push({ path: `${searchParams.get("redirect")}` });
          }
        }
      } catch (error) {
        // TODO: Display error message
        console.log(error);
      }
    },
  },
  props: {
    redirectAfterLogin: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
};
</script>

<style scoped></style>
