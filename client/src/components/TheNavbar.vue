<script setup>
import useAuth from "@/composables/useAuth";
import useNotifications from "@/composables/useNotifications";

import { computed, watchEffect } from "vue";
import { useRouter } from "vue-router";
import { useRoute } from "vue-router";

const { getAuthData, loggedIn, logout, hasElevatedRole } = useAuth();
const { getNotifications, refreshNotifications } = useNotifications();

// TODO: Current year should actually be current season
const currentYear = computed(() => new Date().getFullYear());

const router = useRouter();
const route = useRoute();

watchEffect(async () => {
  if (route.path && hasElevatedRole.value) await refreshNotifications();
});

const handleLogout = async () => {
  await logout();
  router.push({ name: "Home" });
};
</script>
<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-primary bg-gradient">
    <div class="container-fluid">
      <router-link :to="{ name: 'Home' }" class="navbar-brand clickable">
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
                <router-link :to="{ name: 'Live' }" class="dropdown-item"
                  ><i class="bi bi-activity me-1"></i>Live Flüge</router-link
                >
              </li>
              <li><hr class="dropdown-divider" /></li>

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
              <li>
                <router-link
                  :to="{
                    name: 'ResultsClasses',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >
                  <i class="bi bi-trophy-fill me-1"></i
                  >Klassenwertung</router-link
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
              <li v-if="false">
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
              <li>
                <router-link
                  :to="{
                    name: 'ResultsReynoldsClass',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                >
                  <FeatherIcon />
                  Leichtgewichtswertung</router-link
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
                  ><i class="bi bi-flag-fill me-1"></i>Rheinland-Pfalz
                  Pokal</router-link
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
              <li>
                <router-link
                  :to="{
                    name: 'ResultsHes',
                    params: { year: currentYear },
                  }"
                  class="dropdown-item"
                  ><i class="bi bi-flag-fill me-1"></i>Hessencup</router-link
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
              >Info</a
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
                <router-link :to="{ name: 'ListUsers' }" class="dropdown-item"
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
              <li>
                <router-link
                  :to="{ name: 'InfoAirspaces' }"
                  class="dropdown-item"
                  >Luftr&auml;ume</router-link
                >
              </li>
              <li>
                <router-link
                  :to="{ name: 'InfoAutoUpload' }"
                  class="dropdown-item"
                  >Automatischer Upload</router-link
                >
              </li>
              <li>
                <router-link :to="{ name: 'Rules' }" class="dropdown-item"
                  >Ausschreibung</router-link
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
        </ul>
        <!-- Login button -->

        <router-link
          v-if="!loggedIn"
          :to="{ name: 'Login' }"
          class="no-line-break"
        >
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
            class="btn btn-outline-light btn-sm m-1 dropdown-toggle position-relative"
            data-bs-toggle="dropdown"
          >
            <i class="bi bi-person me-1"></i>{{ getAuthData?.firstName }}
            <span
              v-if="getNotifications > 0"
              class="position-absolute top-0 start-0 translate-middle badge rounded-pill bg-danger"
            >
              {{ getNotifications }}
            </span>
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
