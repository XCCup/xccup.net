<template>
  <div class="form-floating mb-3">
    <input
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="label"
      @input="$emit('update:modelValue', $event.target.value)"
      class="form-control"
      :disabled="isDisabled"
    />
    <label v-if="label">{{ label }}</label>
  </div>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      default: "",
    },
    modelValue: {
      type: [String, Number],
      default: "",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
