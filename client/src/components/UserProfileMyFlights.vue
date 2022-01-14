<template>
  <!-- TODO: Add filter spinner when loading -->
  <!-- TODO: Only show flights of current season -->
  <div class="row mt-3">
    <div class="col-6"></div>
    <div class="col-6">
      <PaginationPanel component-name="Profile" entry-name="Flüge" />
    </div>
  </div>
  <UserProfileMyFlightsTable />
</template>

<script setup></script>
