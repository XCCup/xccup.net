<template>
  <div class="container">
    <h3 data-cy="admin-headline">Admin Dashboard</h3>
    <nav>
      <div
        id="nav-tab"
        class="nav nav-tabs flex-column flex-sm-row"
        role="tablist"
      >
        <button
          id="nav-flights-tab"
          class="nav-link active"
          data-bs-toggle="tab"
          data-bs-target="#nav-flights"
          type="button"
          role="tab"
          aria-controls="nav-flights"
          aria-selected="true"
        >
          Flüge
          <span
            v-if="adminFlights && adminFlights?.count > 0"
            class="badge rounded-pill bg-danger"
            >{{ adminFlights?.count }}</span
          >
        </button>
        <button
          id="nav-sites-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-sites"
          type="button"
          role="tab"
          aria-controls="nav-sites"
          aria-selected="false"
        >
          Fluggebiete
          <span
            v-if="adminSites && adminSites?.count > 0"
            class="badge rounded-pill bg-danger"
            >{{ adminSites?.count }}</span
          >
        </button>
        <button
          id="nav-news-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-news"
          type="button"
          role="tab"
          aria-controls="nav-news"
          aria-selected="false"
        >
          News
        </button>
        <button
          id="nav-tshirt-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-tshirt"
          type="button"
          role="tab"
          aria-controls="nav-tshirt"
          aria-selected="false"
        >
          T-Shirts
        </button>
        <button
          id="nav-sponsors-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-sponsors"
          type="button"
          role="tab"
          aria-controls="nav-sponsors"
          aria-selected="false"
        >
          Sponsoren
        </button>
        <button
          id="nav-clubs-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-clubs"
          type="button"
          role="tab"
          aria-controls="nav-clubs"
          aria-selected="false"
        >
          Vereine
        </button>
        <button
          id="nav-photos-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-photos"
          type="button"
          role="tab"
          aria-controls="nav-photos"
          aria-selected="false"
        >
          Fotos
        </button>
        <button
          v-if="isAdmin"
          id="nav-cache-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-cache"
          type="button"
          role="tab"
          aria-controls="nav-cache"
          aria-selected="false"
        >
          Cache
        </button>
        <button
          v-if="isAdmin"
          id="nav-season-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-season"
          type="button"
          role="tab"
          aria-controls="nav-season"
          aria-selected="false"
        >
          Saison
        </button>
        <button
          v-if="isAdmin"
          id="nav-newsletter-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-newsletter"
          type="button"
          role="tab"
          aria-controls="nav-newsletter"
          aria-selected="false"
        >
          Newsletter
        </button>
        <button
          v-if="isAdmin"
          id="nav-flight-upload-tab"
          class="nav-link"
          data-bs-toggle="tab"
          data-bs-target="#nav-flight-upload"
          type="button"
          role="tab"
          aria-controls="nav-flight-upload"
          aria-selected="false"
        >
          Flug Upload
        </button>
      </div>
    </nav>
    <div id="nav-tabContent" class="tab-content">
      <div
        id="nav-flights"
        class="tab-pane fade show active"
        role="tabpanel"
        aria-labelledby="nav-flights-tab"
      >
        <AdminFlights ref="adminFlights" />
      </div>
      <div
        id="nav-sites"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-sites-tab"
      >
        <AdminSites ref="adminSites" />
      </div>
      <div
        id="nav-news"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-news-tab"
      >
        <AdminNews />
      </div>
      <div
        id="nav-tshirt"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-tshirt-tab"
      >
        <AdminTShirt />
      </div>
      <div
        id="nav-sponsors"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-sponsors-tab"
      >
        <AdminSponsors />
      </div>
      <div
        id="nav-clubs"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-clubs-tab"
      >
        <AdminClubs />
      </div>
      <div
        id="nav-photos"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-photos-tab"
      >
        <AdminPhotos />
      </div>
      <div
        v-if="isAdmin"
        id="nav-cache"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-cache-tab"
      >
        <AdminCache />
      </div>
      <div
        v-if="isAdmin"
        id="nav-season"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-season-tab"
      >
        <AdminSeason />
      </div>
      <div
        v-if="isAdmin"
        id="nav-newsletter"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-newsletter-tab"
      >
        <AdminNewsletter />
      </div>
      <div
        v-if="isAdmin"
        id="nav-flight-upload"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-flight-upload-tab"
      >
        <AdminFlightUpload />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { setWindowName } from "../helper/utils";
import { ref } from "vue";
import useAuth from "../composables/useAuth";
import type AdminFlightsVue from "@/components/admin/AdminFlights.vue";
import type AdminSitesVue from "@/components/admin/AdminSites.vue";
import AdminPhotos from "../components/admin/AdminPhotos.vue";
import AdminSponsors from "../components/admin/AdminSponsors.vue";

const { isAdmin } = useAuth();

setWindowName("Admin");

const adminFlights = ref<InstanceType<typeof AdminFlightsVue> | null>(null);
const adminSites = ref<InstanceType<typeof AdminSitesVue> | null>(null);
</script>

<style scoped></style>
