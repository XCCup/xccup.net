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
            v-if="adminFlights?.count > 0"
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
            v-if="adminSites?.count > 0"
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
          v-if="authData.role == 'Administrator'"
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
          v-if="authData.role == 'Administrator'"
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
          v-if="authData.role == 'Administrator'"
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
        v-if="authData.role == 'Administrator'"
        id="nav-cache"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-cache-tab"
      >
        <AdminCache />
      </div>
      <div
        v-if="authData.role == 'Administrator'"
        id="nav-newsletter"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-newsletter-tab"
      >
        <AdminNewsletter />
      </div>
      <div
        v-if="authData.role == 'Administrator'"
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

<script setup>
import { setWindowName } from "../helper/utils";
import { ref } from "vue";
import useUser from "../composables/useUser";

const { authData } = useUser();

setWindowName("Admin");

const adminFlights = ref(null);
const adminSites = ref(null);
</script>

<style scoped></style>
