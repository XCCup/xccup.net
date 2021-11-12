<template>
  <label v-if="showLabel">{{ label }}</label>
  <select
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
    <option v-if="!showLabel" disabled value="" selected>{{ label }}</option>
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
        glider.gliderClassShortDescription +
        ")"
      }}
    </option>
  </select>
</template>

<script setup>
const props = defineProps({
  isDisabled: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
  },
  modelValue: {
    type: String,
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
