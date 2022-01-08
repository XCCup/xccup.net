<template>
  <div :class="showLabelOnTop ? 'form mb-3' : 'form-floating mb-3'">
    <label v-if="label && showLabelOnTop">{{ label }}</label>
    <input
      v-bind="$attrs"
      :id="id"
      :value="modelValue"
      :placeholder="showLabelOnTop ? '' : label"
      :class="formClass"
      invalid="true"
      :type="type"
      :disabled="isDisabled"
      data-bs-toggle="tooltip"
      data-bs-placement="top"
      :title="tooltipValue"
      :data-cy="dataCy"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <label v-if="label && !showLabelOnTop">{{ label }}</label>
    <!-- <p v-if="isInvalid">{{ validationText }}</p> -->
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { isEmail, isStrongPassword } from "../helper/utils";
defineEmits(["update:modelValue"]);

const isFocused = ref(false);

const props = defineProps({
  showLabelOnTop: {
    type: Boolean,
    default: false,
  },
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
  // TODO: Remove note
  // NOTE: Emtpy strings will add the attribute with value "" which can cause duplicate ids
  // Null does not add the attribute
  id: {
    type: [String, null],
    default: null,
  },
  dataCy: {
    type: [String, null],
    default: null,
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
    (props.isRequired && props.modelValue?.length == 0) ||
    (props.isEmail && !isEmail(props.modelValue)) ||
    (props.isPassword && !isStrongPassword(props.modelValue))
  );
});

const formClass = computed(() => {
  let classValue = "form-control";

  if (isInvalid.value && isFocused.value) classValue += " is-invalid";

  return classValue;
});

const tooltipValue = computed(() =>
  isInvalid.value ? props.validationText : ""
);
</script>
