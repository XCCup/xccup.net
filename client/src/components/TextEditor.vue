<template>
  <div v-if="!excludeEmojiPicker" class="dropend my-2">
    <button
      id="dropdownMenuButton1"
      class="btn btn-secondary btn-sm dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      aria-expanded="false"
      data-cy="text-editor-emoji-dropdown"
    >
      <i class="bi bi-emoji-smile"></i>
    </button>
    <div class="dropdown-menu">
      <!-- TODO: Self host emoji DB? -->
      <VuemojiPicker @emoji-click="handleEmojiClick" />
    </div>
  </div>
  <div :class="$attrs.placeholder?.length ? 'form-floating' : ''">
    <textarea
      id="textarea"
      ref="ta"
      :value="modelValue"
      class="form-control mb-2"
      :placeholder="$attrs.placeholder"
      :style="$attrs.style"
      :rows="4"
      data-cy="text-editor-textarea"
      @input="$emit('update:modelValue', $event.target.value), $emit('change')"
    ></textarea>
    <label v-if="$attrs.placeholder?.length" for="textarea">{{
      $attrs.placeholder
    }}</label>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { VuemojiPicker } from "vuemoji-picker";

// Exclude emoji picker in ci build because in causes test errors in cypress
const excludeEmojiPicker = import.meta.env.VITE_EXCLUDE_EMOJI_PICKER;

const emit = defineEmits(["update:modelValue", "change"]);

const props = defineProps({
  modelValue: {
    type: [String, Number],
    required: true,
  },
});

// Emoji Picker
const ta = ref(null);
const handleEmojiClick = (detail) => {
  if (!detail.unicode) return;
  try {
    ta.value.focus();
    const newValue =
      props.modelValue.substring(0, ta.value.selectionStart) +
      detail.unicode +
      props.modelValue.substring(ta.value.selectionEnd);
    emit("update:modelValue", newValue);
  } catch (error) {
    console.log(error);
  }
};
</script>