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
      v-for="option in options"
      :value="option"
      :key="option"
      :selected="option === modelValue"
    >
      {{ option }}
    </option>
  </select>
</template>

<script>
export default {
  name: "BaseSelect",
  props: {
    label: {
      type: String,
      default: "",
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: [String, Number],
      default: "",
    },
    options: {
      type: Array,
      required: true,
    },
    showLabel: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
