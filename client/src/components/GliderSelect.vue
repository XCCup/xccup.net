<template>
  <div v-if="gliders" class="row d-flex align-items-end">
    <div class="col-md-8 mt-3">
      <label v-if="showLabel" class="form-label">Fluggerät</label>
      <select
        id="glider-select"
        class="form-select"
        :value="modelValue"
        :disabled="isDisabled || gliders.length == 0"
        v-bind="{
          ...$attrs,
          onChange: ($event) => {
            $emit('update:modelValue', $event.target.value);
          },
        }"
      >
        <option v-if="!showLabel" disabled value="" selected>
          {{ label }}
        </option>
        <option
          v-for="glider in gliders"
          :key="glider.id"
          :value="glider.id"
          :selected="glider.id === modelValue"
        >
          {{
            glider.brand +
            " " +
            glider.model +
            " (" +
            glider.gliderClass.shortDescription +
            ")"
          }}
        </option>
      </select>
    </div>
    <!-- TODO: Automatically select newly added glider or make it default -->
    <div class="col-md-4 mt-3">
      <div class="d-grid gap-2">
        <UserProfileGliderlist
          :hide-list="true"
          @gliders-changed="glidersChanged"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
const emit = defineEmits(["update:modelValue", "gliders-changed"]);
defineProps({
  isDisabled: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: [String, null],
    required: true,
  },
  gliders: {
    type: Array,
    required: true,
  },
  showLabel: {
    type: Boolean,
    default: false,
  },
});
// TODO: Refactor with a composable to prevent nested emiting?
const glidersChanged = () => emit("gliders-changed");
</script>
