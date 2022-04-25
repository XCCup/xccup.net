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
  <div v-else><h5 class="text-danger">Emoji Picker disabled</h5></div>
  <div :class="$attrs.placeholder?.length ? 'form-floating' : ''">
    <textarea
      id="textarea"
      ref="ta"
      :value="modelValue"
      class="form-control mb-2"
      :placeholder="$attrs.placeholder as string"
      :style="$attrs.style as string"
      :rows="4"
      data-cy="text-editor-textarea"
      @input="onInput(($event.target as HTMLInputElement).value)"
    >
    </textarea>
    <label v-if="$attrs.placeholder?.length" for="textarea">{{
      $attrs.placeholder
    }}</label>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { VuemojiPicker, type EmojiClickEventDetail } from "vuemoji-picker";
import useAuth from "@/composables/useAuth";

const { getAuthData } = useAuth();

// Exclude emoji picker in ci build because in causes test errors in cypress
const excludeEmojiPicker = import.meta.env.VITE_EXCLUDE_EMOJI_PICKER;

const emit = defineEmits(["update:modelValue", "change"]);

const props = defineProps<{ modelValue: string }>();

// Sanitize textarea from male boomer-speech
const onInput = (text: string) => {
  let sanitizedText = text;
  if (getAuthData.value.gender != "F")
    sanitizedText = text.replace(/hausfrau/gi, "Hausmann");

  emit("update:modelValue", sanitizedText);
  emit("change");
};

// Emoji Picker
const ta = ref<HTMLInputElement | null>(null);
const handleEmojiClick = (detail: EmojiClickEventDetail) => {
  if (!detail.unicode || !ta.value || !ta.value.selectionEnd) return;
  try {
    ta.value.focus();
    const newValue =
      props.modelValue.substring(0, ta.value.selectionStart ?? undefined) +
      detail.unicode +
      props.modelValue.substring(ta.value.selectionEnd);
    emit("update:modelValue", newValue);
  } catch (error) {
    console.log(error);
  }
};
</script>
