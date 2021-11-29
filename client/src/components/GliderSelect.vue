<template>
  <label v-if="showLabel" class="form-label">{{ label }}</label>
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
        glider.gliderClass.shortDescription +
        ")"
      }}
    </option>
  </select>
</template>

<script setup>
defineEmits(["update:modelValue"]);
defineProps({
  isDisabled: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    required: true,
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
