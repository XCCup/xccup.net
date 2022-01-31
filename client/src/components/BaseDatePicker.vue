<template>
  <div class="form mb-3">
    <label>{{ label }}</label>
    <Datepicker
      v-model="pickedDate"
      :locale="de"
      :placeholder="label"
      :starting-view="startingView"
      class="form-select"
      :disabled="isDisabled"
      input-format="dd.MM.yyyy"
      :upper-limit="upperLimit"
      :lower-limit="lowerLimit"
    />
    <!-- :typeable="true" -->
  </div>
</template>

<script setup>
import Datepicker from "vue3-datepicker";
import { de } from "date-fns/locale";
import { ref, watch, watchEffect } from "vue";
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: Date,
    default: new Date(),
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  startingView: {
    type: String,
    default: "day", //day, month,year
  },
  upperLimit: {
    type: Date,
    default: new Date(new Date().getFullYear() + 1, 11, 30),
  },
  lowerLimit: {
    type: Date,
    default: new Date(1930, 0, 0),
  },
});
const emit = defineEmits(["update:modelValue"]);
const pickedDate = ref(null);

watchEffect(() => {
  pickedDate.value = props.modelValue;
});

watch(
  () => pickedDate.value,
  () => {
    emit("update:modelValue", pickedDate.value);
  }
);
</script>
