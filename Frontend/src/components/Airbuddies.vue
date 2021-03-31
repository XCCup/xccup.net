<template>
  <!-- Airbuddy Checkboxes -->
  <div class="container">
    <div class="airbuddies mt-2">
      <button
        class="btn btn-primary btn-sm dropdown-toggle"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#collapseAirbuddies"
        aria-expanded="false"
        aria-controls="collapseAirbuddies"
      >
        Airbuddies
      </button>
      <div
        class="collapse mt-2"
        id="collapseAirbuddies"
        v-for="(pilot, index) in this.airbuddies"
        :key="index"
      >
        <div class="form-check">
          <input
            class="form-check-input"
            type="checkbox"
            value="{{index}}"
            id="flexCheckChecked"
          />
          <label class="form-check-label" for="flexCheckChecked">
            <span class="badge" style="background-color: darkblue">
              {{ pilot }}
            </span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "Airbuddies",
  props: {
    airbuddies: {
      type: Array,
      required: true,
    },
  },
};
</script>

<style scoped></style>
