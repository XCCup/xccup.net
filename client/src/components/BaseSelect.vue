<template>
  <label v-if="showLabel">{{ label }}</label>
  <select
    :id="id"
    class="form-select mb-3"
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
    <option v-if="showLabel && addEmptyOption" value="" selected></option>
    <!-- TODO: Safari selects the first item even if selected is "false". Evaluate! -->
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
  addEmptyOption: {
    type: Boolean,
    default: false,
  },
});
</script>
