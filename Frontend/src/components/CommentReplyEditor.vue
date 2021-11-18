<template>
  <textarea
    id="reply-editor"
    v-model="message"
    class="form-control mb-2"
  ></textarea>
  <button
    class="btn btn-primary me-2"
    :disabled="saveButtonIsDisabled"
    @click.prevent="onSaveMessage"
  >
    Speichern
  </button>
  <button class="btn btn-outline-danger" @click.prevent="onCancel">
    Abbrechen
  </button>
</template>

<script setup>
import { computed, ref } from "vue";

const props = defineProps({
  textareaContent: {
    type: String,
    required: true,
  },
});
const message = ref(props.textareaContent);

const emit = defineEmits(["saveMessage", "closeEditor"]);

const onSaveMessage = () => emit("saveMessage", message.value);
const saveButtonIsDisabled = computed(() => message.value.length < 3);

const onCancel = () => emit("closeEditor");
</script>
