<template>
  <div
    id="addEditNewsModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="addEditNewsModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="addEditNewsModalLabel" class="modal-title">
            Nachricht hinzufügen
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <!-- TODO: Fix modification of props -->
          <BaseInput v-model="newsObject.title" label="Titel" />
          <BaseTextarea v-model="newsObject.message" label="Nachricht" />
          <!-- <BaseInput v-model="newsObject.from" label="Gültig ab" />
          <BaseInput v-model="newsObject.till" label="Gültig bis" />-->
          <BaseDatePicker v-model="newsObject.from" label="Gültig ab" />
          <BaseDatePicker v-model="newsObject.till" label="Gültig bis" />
          <div class="form-check">
            <input
              id="sendToAll"
              v-model="newsObject.sendByMail"
              class="form-check-input"
              type="checkbox"
              value
            />
            <label class="form-check-label" for="flexCheckDefault"
              >Per E-Mail an Alle senden</label
            >
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-primary"
            :disabled="!saveButtonIsEnabled"
            data-bs-dismiss="modal"
            @click="onSaveNews"
          >
            Speichern
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from "vue";
import { isIsoDateWithoutTime } from "@/helper/utils";

const props = defineProps({
  newsObject: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["save-news"]);

const saveButtonIsEnabled = computed(() => {
  return (
    props.newsObject.title.length > 3 &&
    props.newsObject.message.length > 3 &&
    isIsoDateWithoutTime(props.newsObject.from) &&
    isIsoDateWithoutTime(props.newsObject.till)
  );
});

const onSaveNews = () => {
  emit("save-news", props.newsObject);
};
</script>
