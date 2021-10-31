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
      v-for="glider in gliders"
      :value="glider.id"
      :key="glider.id"
      :selected="glider.id === modelValue"
    >
      {{ glider.brand + " " + glider.model }}
    </option>
  </select>
</template>

<script>
export default {
  name: "GliderSelect",
  data() {
    return {
      label: "Fluggerät",
    };
  },
  props: {
    isDisabled: {
      type: Boolean,
      default: false,
    },
    modelValue: {
      type: String,
    },
    gliders: {
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
