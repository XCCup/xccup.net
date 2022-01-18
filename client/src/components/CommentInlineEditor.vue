<template>
  <div class="dropend my-2">
    <button
      id="dropdownMenuButton1"
      class="btn btn-secondary btn-sm dropdown-toggle"
      type="button"
      data-bs-toggle="dropdown"
      data-bs-auto-close="outside"
      aria-expanded="false"
    >
      <i class="bi bi-emoji-smile"></i>
    </button>
    <div class="dropdown-menu">
      <VuemojiPicker @emoji-click="handleEmojiClick" />
    </div>
  </div>
  <textarea
    id="reply-editor"
    ref="ta"
    v-model="message"
    class="form-control mb-2"
  ></textarea>
  <span v-if="errorMessage" class="text-danger">{{ errorMessage }}</span>
  <div>
    <button
      class="btn btn-primary me-2"
      :disabled="saveButtonIsDisabled"
      @click.prevent="onSaveMessage"
    >
      {{ useEditLabels ? "Speichern" : "Senden" }}
      <BaseSpinner v-if="showSpinner" />
    </button>
    <button class="btn btn-outline-danger" @click.prevent="onCancel">
      Abbrechen
    </button>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import BaseSpinner from "./BaseSpinner.vue";
import { VuemojiPicker } from "vuemoji-picker";

const props = defineProps({
  textareaContent: {
    type: String,
    required: true,
  },
  useEditLabels: {
    type: Boolean,
    default: false,
  },
  showSpinner: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: [null, String],
    default: null,
  },
});
const message = ref(props.textareaContent);

const emit = defineEmits(["saveMessage", "closeEditor"]);

const onSaveMessage = () => emit("saveMessage", message.value);
const saveButtonIsDisabled = computed(() => message.value.length < 3);

const onCancel = () => emit("closeEditor");

// Emoji Picker
const ta = ref(null);
const handleEmojiClick = (detail) => {
  if (!detail.unicode) return;
  try {
    ta.value.focus();
    ta.value.setRangeText(
      detail.unicode,
      ta.value.selectionStart,
      ta.value.selectionEnd,
      "end"
    );
    // Somehow changing the value of the textarea does not update the ref value
    message.value = ta.value.value;
  } catch (error) {
    console.log(error);
  }
};
</script>
