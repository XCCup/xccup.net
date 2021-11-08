<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary bg-gradient">
    <div class="container-fluid">
      <router-link :to="{ name: 'Home' }" class="navbar-brand" href="/">
        <img src="../assets/images/xccup_white.svg" alt="XCCup" height="50" />
      </router-link>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
            >Ergebnisse</a>
            <ul class="dropdown-menu">
              <li>
                <router-link
                  :to="{ name: 'FlightsAll', params: { year: currentYear } }"
                  class="dropdown-item"
                >Eingereichte Flüge</router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsOverall',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >Gesamtwertung</router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsTeams',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >Teamwertung</router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsClubs',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >Vereinswertung</router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsNewcomer',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >Newcomer</router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsSeniors',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >Seniorenwertung</router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsLadies',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >Damenwertung</router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsRlp',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >Landesmeisterschaft RLP</router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsLux',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >Luxemburg Championat</router-link>
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'SiteRecords',
                  }"
                  class="dropdown-item"
                >Flugebietsrekords</router-link>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <a class="dropdown-item" href="#">…</a>
              </li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
            >Listen</a>
            <ul class="dropdown-menu">
              <li>
                <router-link
                  :to="{
                    name: 'Sponsors',
                  }"
                  class="dropdown-item"
                >Sponsors</router-link>
              </li>
              <li>
                <a class="dropdown-item" href="#">Vereine</a>
              </li>
              <li>
                <a class="dropdown-item" href="#">Registrierte Piloten</a>
              </li>
              <li>
                <a class="dropdown-item" href="#">Teams 2021</a>
              </li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <router-link :to="{ name: 'Privacy' }" class="nav-link active">Datenschutz</router-link>
          </li>
          <li class="nav-item dropdown">
            <router-link :to="{ name: 'Imprint' }" class="nav-link active">Kontakt / Impressum</router-link>
          </li>
          <!-- TODO show only when user has role of moderator or higher-->
          <li v-if="true" class="nav-item dropdown">
            <router-link :to="{ name: 'AdminDashboard' }" class="nav-link active">
              <!-- Hab das mal strong gemacht wie du wolltest aber sehe den Sinn nicht😂 -->
              <strong>Kommandozentrale</strong>
            </router-link>
          </li>
        </ul>
        <!-- Login dropdown  -->
        <div class="dropdown">
          <button
            type="button"
            class="btn btn-outline-light btn-sm m-1 dropdown-toggle"
            id="dropdownMenuButton1"
            data-bs-toggle="dropdown"
          >
            <i class="bi bi-person"></i>
            {{ loggedIn ? gettersAuthData.firstName : "Login" }}
          </button>
          <div class="dropdown-menu" style="width: 250px">
            <BaseLogin v-if="!loggedIn" />
            <div v-else>
              <div class="mb-3">
                <router-link :to="{ name: 'Profile' }" class="dropdown-item">Profil</router-link>
                <button class="btn btn-danger btn-sm m-1" @click="actionLogout">Abmelden</button>
              </div>
            </div>
          </div>
        </div>
        <router-link class="btn btn-danger btn-sm m-1" :to="{ name: 'FlightUpload' }">Flug hochladen</router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
export default {
  name: "TheNavbar",
  computed: {
    ...mapGetters({
      gettersAuthData: "getAuthData",
      getterLoginStatus: "getLoginStatus",
    }),
    loggedIn() {
      return this.getterLoginStatus === "success";
    },
    currentYear() {
      return new Date().getFullYear();
    },
  },
  methods: {
    ...mapActions({
      actionLogout: "logout",
    }),
    async handleLogout() {
      await this.actionLogout();
      // TODO: the redirect is not working right now
      this.$router.push({ name: "Home" });
    },
  },
};
</script>

<style scoped>
</style>
