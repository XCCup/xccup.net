<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-primary bg-gradient">
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
        <ul class="navbar-nav me-auto">
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
                    name: 'FlightsAll',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  ><i class="bi bi-send me-1"></i>Eingereichte
                  Flüge</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsOverall',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >
                  <i class="bi bi-trophy me-1"></i>Gesamtwertung</router-link
                >
              </li>
              <li><hr class="dropdown-divider" /></li>

              <li>
                <router-link
                  :to="{
                    name: 'ResultsTeams',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  ><i class="bi bi-people me-1"></i>Teamwertung</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsClubs',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  ><i class="bi bi-award me-1"></i>Vereinswertung</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsNewcomer',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >
                  <i class="bi bi-star me-1"></i>Newcomer</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsSeniors',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >
                  <i class="bi bi-hourglass-split me-1"></i
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
                >
                  <i class="bi bi-gender-female me-1"></i
                  >Damenwertung</router-link
                >
              </li>
              <li><hr class="dropdown-divider" /></li>

              <li>
                <router-link
                  :to="{
                    name: 'ResultsRlp',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  ><i class="bi bi-flag-fill me-1"></i>Landesmeisterschaft
                  RLP</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{
                    name: 'ResultsLux',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >
                  <i class="bi bi-flag me-1"></i>Luxemburg
                  Championat</router-link
                >
              </li>
              <li><hr class="dropdown-divider" /></li>

              <li>
                <router-link
                  :to="{
                    name: 'SiteRecords',
                  }"
                  class="dropdown-item"
                  ><i class="bi bi-bookmark-star me-1"></i>
                  Flugebietsrekorde</router-link
                >
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
                <router-link :to="{ name: 'FlyingSites' }" class="dropdown-item"
                  >Fluggebietsübersicht</router-link
                >
              </li>
              <li>
                <router-link :to="{ name: 'News' }" class="dropdown-item"
                  >News</router-link
                >
              </li>
            </ul>
          </li>
          <li id="navbarForms" class="nav-item dropdown">
            <a
              id="navbarDropdown"
              class="nav-link dropdown-toggle"
              href="#"
              role="button"
              data-bs-toggle="dropdown"
              >Formulare</a
            >
            <ul class="dropdown-menu">
              <li>
                <router-link :to="{ name: 'SubmitTeam' }" class="dropdown-item"
                  >Teammeldung</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{ name: 'SubmitFlyingSite' }"
                  class="dropdown-item"
                  >Fluggebietsmeldung</router-link
                >
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
              >Impressum</router-link
            >
          </li>
        </ul>
        <!-- Login button -->

        <router-link v-if="!loggedIn" :to="{ name: 'Login' }">
          <button
            id="loginNavButton"
            type="button"
            class="btn btn-outline-light btn-sm mx-1"
          >
            <i class="bi bi-person me-1"></i>Login
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
            <i class="bi bi-person me-1"></i>{{ authData.firstName }}
          </button>
          <ul
            class="dropdown-menu dropdown-menu-macos mx-0 shadow"
            style="width: 220px"
          >
            <li>
              <router-link :to="{ name: 'Profile' }" class="dropdown-item">
                <i class="bi bi-gear me-1"></i>Profil
              </router-link>
            </li>

            <li v-if="hasElevatedRole">
              <router-link
                id="navbarAdminDashboard"
                :to="{ name: 'AdminDashboard' }"
                class="dropdown-item"
              >
                <i class="bi bi-speedometer2 me-1"></i>Admin
              </router-link>
            </li>

            <li><hr class="dropdown-divider" /></li>
            <li>
              <a
                class="dropdown-item text-danger"
                href="#"
                @click="handleLogout"
              >
                <i class="bi bi-box-arrow-right me-1"></i>Abmelden
              </a>
            </li>
          </ul>
        </div>
        <router-link :to="{ name: 'FlightUpload' }">
          <button
            id="flightUploadNavButton"
            type="button"
            class="btn btn-danger btn-sm m-1 no-line-break"
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

// TODO: Current year should actually be current season
const currentYear = computed(() => new Date().getFullYear());

const router = useRouter();

const handleLogout = async () => {
  await logout();
  router.push({ name: "Home" });
};
</script>
