<template>
  <div class="form-floating mb-3">
    <input
      v-bind="$attrs"
      :id="id"
      :value="modelValue"
      :placeholder="label"
      :class="formClass"
      invalid="true"
      :type="type"
      :disabled="isDisabled"
      data-bs-toggle="tooltip"
      data-bs-placement="top"
      :title="tooltipValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <label v-if="label">{{ label }}</label>
    <!-- <p v-if="isInvalid">{{ validationText }}</p> -->
  </div>
</template>

<script setup>
import { computed } from "vue";
import { isEmail, isStrongPassword } from "../helper/utils";
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
  externalValidationResult: {
    type: Boolean,
    default: false,
  },
  isRequired: {
    type: Boolean,
    default: true,
  },
  validationText: {
    type: String,
    default: "Das Feld darf nicht leer sein",
  },
  id: {
    type: String,
    default: "",
  },
});

const type = computed(() => {
  if (props.isPassword) return "password";
  if (props.isEmail) return "email";
  return "text";
});

const isInvalid = computed(() => {
  return (
    props.externalValidationResult ||
    (props.isRequired && props.modelValue.length == 0) ||
    (props.isEmail && !isEmail(props.modelValue)) ||
    (props.isPassword && !isStrongPassword(props.modelValue))
  );
});

const formClass = computed(() => {
  let classValue = "form-control";

  if (isInvalid.value) classValue += " is-invalid";

  return classValue;
});

const tooltipValue = computed(() =>
  isInvalid.value ? props.validationText : ""
);
</script>
