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
      <div id="navbarSupportedContent" class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li id="navbarResults" class="nav-item dropdown">
            <a
              id="navbarDropdown"
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              >Ergebnisse</a
            >
            <ul class="dropdown-menu">
              <li>
                <router-link
                  :to="{
                    name: 'FlightsAllYear',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  >Eingereichte Flüge</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsOverall',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  >Gesamtwertung</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsTeams',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  >Teamwertung</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsClubs',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  >Vereinswertung</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsNewcomer',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  >Newcomer</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsSeniors',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  >Seniorenwertung</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsLadies',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  >Damenwertung</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsRlp',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  >Landesmeisterschaft RLP</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsLux',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  >Luxemburg Championat</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'SiteRecords',
                  }"
                  class="dropdown-item"
                  >Flugebietsrekorde</router-link
                >
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <a class="dropdown-item" href="#">…</a>
              </li>
            </ul>
          </li>
          <li id="navbarLists" class="nav-item dropdown">
            <a
              id="navbarDropdown"
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              >Listen</a
            >
            <ul class="dropdown-menu">
              <li>
                <router-link
                  :to="{
                    name: 'Sponsors',
                  }"
                  class="dropdown-item"
                  >Sponsoren</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'Clubs',
                  }"
                  class="dropdown-item"
                  >Vereine</router-link
                >
              </li>
              <li>
                <router-link :to="{ name: 'Users' }" class="dropdown-item"
                  >Registrierte Piloten</router-link
                >
              </li>
              <li>
                <a class="dropdown-item" href="#">Teams 2021</a>
              </li>
            </ul>
          </li>
          <li id="navbarPrivacy" class="nav-item dropdown">
            <router-link :to="{ name: 'Privacy' }" class="nav-link active"
              >Datenschutz</router-link
            >
          </li>
          <li id="navbarImprint" class="nav-item dropdown">
            <router-link :to="{ name: 'Imprint' }" class="nav-link active"
              >Kontakt / Impressum</router-link
            >
          </li>
          <li
            v-if="hasElevatedRole"
            id="navbarAdminDashboard"
            class="nav-item dropdown"
          >
            <router-link
              :to="{ name: 'AdminDashboard' }"
              class="nav-link active"
            >
              <strong>Kommandozentrale</strong>
            </router-link>
          </li>
        </ul>
        <!-- Login button -->

        <router-link v-if="!loggedIn" :to="{ name: 'Login' }">
          <button
            id="loginNavButton"
            type="button"
            class="btn btn-outline-light btn-sm m-1"
          >
            <i class="bi bi-person"></i>
            {{ "Login" }}
          </button>
        </router-link>

        <!-- User menu -->
        <div v-if="loggedIn" class="dropdown">
          <button
            id="userNavDropdownMenu"
            type="button"
            class="btn btn-outline-light btn-sm m-1 dropdown-toggle"
            data-bs-toggle="dropdown"
          >
            <i class="bi bi-person"></i>
            {{ authData.firstName }}
          </button>

          <div class="dropdown-menu" style="width: 250px">
            <div class="mb-3">
              <router-link :to="{ name: 'Profile' }" class="dropdown-item"
                >Profil
              </router-link>
              <button class="btn btn-danger btn-sm m-1" @click="handleLogout">
                Abmelden
              </button>
            </div>
          </div>
        </div>
        <router-link :to="{ name: 'FlightUpload' }">
          <button
            id="loginNavButton"
            type="button"
            class="btn btn-danger btn-sm m-1"
          >
            Flug hochladen
          </button>
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import useUser from "@/composables/useUser";

import { computed } from "vue";
import { useRouter } from "vue-router";

const { authData, loggedIn, logout, hasElevatedRole } = useUser();

const currentYear = computed(() => new Date().getFullYear());

const router = useRouter();

const handleLogout = async () => {
  await logout();
  router.push({ name: "Home" });
};
</script>
