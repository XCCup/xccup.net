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
          <BaseInput v-model="news.title" label="Titel" />
          <BaseTextarea v-model="news.message" label="Nachricht" />
          <!-- TODO: Icon select. For now just paste the name of an icon as this component needs refactoring anyway 
          Later a picker would be nice -->
          <BaseInput v-model="news.icon" :is-required="false" label="Icon" />
          <BaseDatePicker
            v-model="news.from"
            :lower-limit="new Date()"
            label="Gültig ab"
          />
          <BaseDatePicker
            v-model="news.till"
            :lower-limit="news.from"
            label="Gültig bis"
          />
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
import { computed, ref, watchEffect } from "vue";

const props = defineProps({
  newsObject: {
    type: Object,
    required: true,
  },
});

const news = ref(null);

watchEffect(() => {
  news.value = props.newsObject;
});

const emit = defineEmits(["save-news"]);

const saveButtonIsEnabled = computed(() => {
  return (
    news.value.title.length > 3 &&
    news.value.message.length > 3 &&
    news.value.from &&
    news.value.till
  );
});

const onSaveNews = () => {
  emit("save-news", news.value);
};
</script>
