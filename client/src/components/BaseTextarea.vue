<template>
  <div class="form-floating mb-3">
    <textarea
      rows="3"
      style="height: 100%"
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="label"
      class="form-control"
      :disabled="disabled"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>
    <label v-if="label">{{ label }}</label>
  </div>
</template>

<script setup>
defineEmits(["update:modelValue"]);

defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    required: false,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});
</script>
