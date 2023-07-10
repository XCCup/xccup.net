<template>
  <div class="dropend my-2">
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
      <EmojiPicker
        :native="true"
        theme="auto"
        :display-recent="true"
        @select="handleEmojiClick"
      />
    </div>
  </div>
  <div :class="placeholderIsSet ? 'form-floating' : ''">
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
    <label v-if="placeholderIsSet" for="textarea">{{
      $attrs.placeholder
    }}</label>
  </div>
</template>

<script setup lang="ts">
import { ref, useAttrs, computed } from "vue";
import useAuth from "@/composables/useAuth";

import EmojiPicker from "vue3-emoji-picker";
import "vue3-emoji-picker/css";

const { getAuthData } = useAuth();

const emit = defineEmits(["update:modelValue", "change"]);

const props = defineProps<{ modelValue: string }>();
const attrs = useAttrs();

const placeholderIsSet = computed(() => {
  if (typeof attrs.placeholder == "string" && attrs.placeholder.length)
    return true;
  return false;
});

// Sanitize textarea from male boomer-speech
const onInput = (text: string) => {
  let sanitizedText = text;
  if (getAuthData.value.gender != "F")
    sanitizedText = text.replace(/hausfrau/gi, "Hausmann");

  emit("update:modelValue", sanitizedText);
  emit("change");
};

// Emoji Picker

interface Emoji {
  i: string;
  n: string;
  r: string;
  t: string;
  u: string;
}

const ta = ref<HTMLInputElement | null>(null);
const handleEmojiClick = (emoji: Emoji) => {
  if (!emoji.i || !ta.value) return;
  try {
    ta.value.focus();
    const newValue =
      props.modelValue.substring(0, ta.value.selectionStart ?? undefined) +
      emoji.i +
      props.modelValue.substring(ta.value.selectionEnd ?? 0);
    emit("update:modelValue", newValue);
  } catch (error) {
    console.log(error);
  }
};
</script>
