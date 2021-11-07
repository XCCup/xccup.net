<template>
  <div class="form-floating mb-3">
    <datepicker
      v-model="modelValue"
      :locale="de"
      :placeholder="label"
      class="form-select"
      :disabled="isDisabled"
    />
    <label v-if="label">{{ label }}</label>
  </div>
</template>

<script setup>

/**
 * 
 * This component is not ready for use
 * 
 * 
 */



import Datepicker from 'vue3-datepicker'
import { de } from "date-fns/locale"
import { ref, computed } from 'vue';
import { parseISO } from 'date-fns';

const props = defineProps({
  label: {
    type: String,
    default: "",
  },
  modelValue: {
    type: String,
    default: "",
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
});

const compPicked = computed(() => {
  console.log("modelValuePick: ", props.modelValue);
  return parseISO(props.modelValue)
})

</script>

