<template>
  <!-- <div class="row d-flex align-items-end"> -->
  <div class="">
    <label v-if="showLabel" class="form-label">Fluggerät</label>
    <select
      id="glider-select"
      class="form-select"
      :value="modelValue"
      :disabled="isDisabled"
      v-bind="{
        ...$attrs,
        onChange: ($event) => {
          $emit('update:modelValue', $event.target.value);
        },
      }"
    >
      <option v-if="!showLabel" disabled value="" selected>
        {{ label }}
      </option>
      <option
        v-for="glider in gliders"
        :key="glider.id"
        :value="glider.id"
        :selected="glider.id === modelValue"
      >
        {{
          glider.brand +
          " " +
          glider.model +
          " (" +
          glider.gliderClass.shortDescription +
          ")"
        }}
      </option>
    </select>
    <div class="fw-light mt-2">Du kannst deine Geräte im Profil verwalten</div>
  </div>
  <!-- TODO: Remove this or make it work -->
  <div v-if="false" class="col-md-5 mt-3">
    <router-link :to="{ name: 'ProfileHangar' }" class="d-grid gap-2">
      <button type="button" class="btn btn-primary">Liste bearbeiten</button>
    </router-link>
  </div>
  <!-- </div> -->
</template>

<script setup>
defineEmits(["update:modelValue"]);
defineProps({
  isDisabled: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: String,
    required: true,
  },
  gliders: {
    type: Array,
    required: true,
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
});
</script>
