<template>
  <div class="form">
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
    />
  </div>
</template>

<script setup>
// Add the possibility to define a year where the picker should start.
// No one born in 2021 will enter the comp
import Datepicker from "vue3-datepicker";
import { de } from "date-fns/locale";
import { ref, watch, onMounted } from "vue";
import { parseISO } from "date-fns";
const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  modelValue: {
    type: [String, null],
    required: true,
  },
  initialDate: {
    type: [String, null],
    default: null,
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
});
const emits = defineEmits(["update:modelValue"]);
const pickedDate = ref(null);
// Ensure that a inital property change won't cause an unwanted update
// TODO: Is all this formatting really necessary? Also: possible race condition with "externalChange" in two different watchers?
let externalChange = false;
// Watch the incoming data property to set the correct inital value in the correct format
watch(
  () => props.modelValue,
  (newVal) => {
    externalChange = true;
    pickedDate.value = parseISO(newVal);
  }
);

// Todo: This is a workaround to show the initial date.
// It will be unnecessary as soon as the compnnet ist set up "correctly"
onMounted(() => {
  pickedDate.value = parseISO(props.initialDate);
});

// Watch the internal data property to update the surrounding component with the correct format
watch(pickedDate, () => {
  if (externalChange == true) return (externalChange = false);
  const dateValue = pickedDate.value;
  if (dateValue) {
    const year = dateValue.getFullYear();
    const month =
      dateValue.getMonth() + 1 < 10
        ? "0" + (dateValue.getMonth() + 1)
        : dateValue.getMonth() + 1;
    const day =
      dateValue.getDate() < 10
        ? "0" + dateValue.getDate()
        : dateValue.getDate();
    const res = `${year}-${month}-${day}`;
    emits("update:modelValue", res);
  }
});
</script>
