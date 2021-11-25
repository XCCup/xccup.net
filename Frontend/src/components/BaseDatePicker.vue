<template>
  <div class="form mb-3">
    <label class="form-check-label">{{ label }}</label>
    <datepicker
      v-model="pickedDate"
      :locale="de"
      :placeholder="label"
      class="form-select"
      :disabled="isDisabled"
      input-format="dd.MM.yyyy"
    />
  </div>
</template>

<script setup>
import Datepicker from "vue3-datepicker";
import { de } from "date-fns/locale";
import { ref, watch } from "vue";
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
  isDisabled: {
    type: Boolean,
    default: false,
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
