<template>
  <div class="container">
    <h5 data-cy="admin-headline">Admin Dashboard</h5>
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
        <AdminSites />
      </div>
      <div
        id="nav-news"
        class="tab-pane fade"
        role="tabpanel"
        aria-labelledby="nav-news-tab"
      >
        <AdminNews />
      </div>
    </div>
  </div>
</template>

<script setup>
import { setWindowName } from "../helper/utils";
import { ref } from "vue";

setWindowName("Admin");

const adminFlights = ref(null);
</script>

<style scoped></style>
