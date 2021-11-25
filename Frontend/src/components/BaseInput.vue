<template>
  <div class="form-floating mb-3">
    <input
      v-bind="$attrs"
      :value="modelValue"
      :placeholder="label"
      class="form-control"
      :type="type"
      :disabled="isDisabled"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <label v-if="label">{{ label }}</label>
  </div>
</template>

<script setup>
import { computed } from "vue";
defineEmits(["update:modelValue"]);

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, Number],
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  isPassword: {
    type: Boolean,
    default: false,
  },
  isEmail: {
    type: Boolean,
    default: false,
  },
});

const type = computed(() => {
  if (props.isPassword) return "password";
  if (props.isEmail) return "email";
  return "text";
});
</script>
