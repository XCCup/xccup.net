<template>
  <label v-if="showLabel">{{ label }}</label>
  <select
    :id="id"
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
      v-for="option in options"
      :key="option"
      :value="option"
      :selected="option === modelValue"
    >
      {{ option }}
    </option>
  </select>
</template>

<script setup>
defineEmits(["update:modelValue"]);

defineProps({
  label: {
    type: String,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [String, Number],
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  id: {
    type: String,
    default: "",
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
});
</script>
