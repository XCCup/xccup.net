<template>
  <!-- TODO: Save reply drafts to local storage as well -->
  <TextEditor v-model="message" />

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
const saveButtonIsDisabled = computed(() => message.value.length < 1);

const onCancel = () => emit("closeEditor");
</script>
