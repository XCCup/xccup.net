<template>
  <!-- TODO: Add filter spinner when loading -->
  <!-- TODO: How many flights shall be shown -->
  <div class="row mt-3">
    <div class="col-6"></div>
    <div class="col-6">
      <PaginationPanel
        :api-endpoint="ApiService.getFlights"
        entry-name="Flüge"
      />
    </div>
  </div>
  <UserProfileMyFlightsTable />
</template>

<script setup>
import ApiService from "@/services/ApiService";
</script>
