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
          <label>Icon</label>
          <div class="row">
            <div class="col-md-1">
              <i class="bi fs-3" :class="news.icon"></i>
            </div>
            <div class="col-md-11">
              <select
                id="newsIconPicker"
                v-model="news.icon"
                class="form-select mb-3"
              >
                <option selected></option>
                <option v-for="icon in newsIcons" :key="icon" :value="icon">
                  {{ icon }}
                </option>
              </select>
            </div>
          </div>
          <a
            href="https://icons.getbootstrap.com"
            target="_blank"
            rel="noopener noreferrer"
            >List of icons</a
          >
          <BaseInput
            v-model="news.icon"
            :is-required="false"
            label="Custom icon"
          />

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
          <BaseError :error-message="errorMessage" />

          <button
            type="button"
            class="btn btn-primary"
            :disabled="!saveButtonIsEnabled"
            @click="onSaveNews"
          >
            Speichern
            <BaseSpinner v-if="showSpinner" />
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
  showSpinner: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: [String, null],
    default: null,
  },
});

const news = ref(null);
const newsIcons = ["bi-alarm", "bi-megaphone", "bi-exclamation-octagon"];

watchEffect(() => {
  news.value = props.newsObject;
});

const emit = defineEmits(["save-news"]);

const saveButtonIsEnabled = computed(() => {
  return (
    news.value.title.length > 3 &&
    news.value.message.length > 3 &&
    news.value.from &&
    news.value.till &&
    news.value.icon.length > 6
  );
});

const onSaveNews = () => {
  emit("save-news", news.value);
};
</script>
