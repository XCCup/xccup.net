<template>
  <h5>Standard Gerät wählen</h5>
  <!-- <ul class="list-group">
    <li v-for="glider in gliders" :key="glider.id" class="list-group-item">
      {{ formatGlider(glider) }}
      <i class="bi bi-pencil-square mx-1"></i>
      <i class="bi bi-trash"></i>
    </li>
  </ul> -->

  <div v-for="glider in gliders" :key="glider.id" class="form-check mt-2">
    <input
      class="form-check-input"
      type="radio"
      name="exampleRadios"
      :id="glider.id"
      value="option1"
      checked
    />
    <label class="form-check-label" :for="glider.id">
      {{ formatGlider(glider) }}
      <i class="bi bi-pencil-square mx-1"></i>
      <i class="bi bi-trash"></i
    ></label>
  </div>
  <button type="button" class="btn btn-primary mt-2 me-2">Speichern</button>
  <button
    type="button"
    class="btn btn-outline-primary mt-2"
    data-bs-toggle="modal"
    data-bs-target="#addGliderModal"
  >
    <i class="bi bi-plus"></i> Gerät hinzufügen
  </button>
</template>

<script>
export default {
  name: "GliderSelect",

  props: {
    gliders: {
      type: Array,
    },
  },

  setup() {
    const formatGlider = (glider) =>
      glider.brand + " " + glider.model + " (" + glider.shortDescription + ")";
    return { formatGlider };
  },
};
</script>
