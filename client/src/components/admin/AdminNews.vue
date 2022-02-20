<template>
  <div id="adminNewsPanel" class="py-3">
    <div class="table-responsive">
      <table class="table table-striped table-hover text-sm">
        <thead>
          <th>Titel</th>
          <th>Icon</th>

          <th>Text</th>
          <th>Von</th>
          <th>bis</th>
          <th>Geändert</th>
          <th></th>
        </thead>
        <tbody>
          <tr v-for="entry in news" :key="entry.id" :item="entry">
            <td>
              <strong>{{ entry.title }}</strong>
            </td>
            <td>
              <i class="bi fs-2" :class="entry.icon"></i>
            </td>
            <!-- eslint-disable vue/no-v-html -->
            <td
              class="allow-white-spaces"
              data-cy="news-text"
              v-html="activateHtmlLinks(snipText(entry.message))"
            ></td>
            <!--eslint-enable-->

            <td>
              <BaseDate :timestamp="entry.from" />
            </td>
            <td>
              <BaseDate :timestamp="entry.till" />
            </td>

            <td>
              <BaseDate :timestamp="entry.updatedAt" />
            </td>
            <td>
              <button
                class="btn btn-outline-primary m-1 btn-sm bi bi-pencil-square"
                @click="onEditNews(entry)"
              ></button>
              <button
                class="btn btn-outline-danger m-1 btn-sm bi bi-trash"
                @click="onDeleteNews(entry)"
              ></button>
            </td>
          </tr>
        </tbody>
      </table>
      <button
        type="button"
        class="btn btn-outline-primary btn-sm m-1"
        @click="onAddNews"
      >
        Erstelle eine neue Nachricht
      </button>
    </div>
  </div>
  <!-- Modals -->
  <ModalAddEditNews
    :news-object="selectedNews"
    :show-spinner="showSpinner"
    :error-message="errorMessage"
    @save-news="saveNews"
  />
  <BaseModal
    modal-title="News löschen?"
    :modal-body="deleteMessage"
    confirm-button-text="Löschen"
    modal-id="modalNewsConfirm"
    :confirm-action="deleteNews"
    :is-dangerous-action="true"
    :show-spinner="showSpinner"
    :error-message="errorMessage"
  />
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { MAX_NEWS_CHARACTERS } from "@/common/Constants";
import { GENERIC_ERROR } from "@/common/Constants";
import { Modal } from "bootstrap";
import { adjustDateToLocal, activateHtmlLinks } from "../../helper/utils";

import { cloneDeep } from "lodash-es";

const router = useRouter();

const showSpinner = ref(false);
const errorMessage = ref(null);

const createEmptyNewsObject = () => {
  return {
    title: "",
    message: "",
    icon: "bi-megaphone",
    from: new Date(),
    till: new Date(),
  };
};

const news = ref([]);

const fetchNews = async () => {
  try {
    const res = await ApiService.getAllNews();
    news.value = res.data;
    transfromToDateObjects(news.value);
  } catch (error) {
    console.log(error);
    router.push({
      name: "NetworkError",
    });
  }
};
// Base-date-picker needs this
const transfromToDateObjects = (news) => {
  news.forEach((element) => {
    element.from = adjustDateToLocal(element.from);
    element.till = adjustDateToLocal(element.till);
  });
};

await fetchNews();

// Modals
const addEditNewsModal = ref(null);
const confirmModal = ref(null);
onMounted(() => {
  addEditNewsModal.value = new Modal(
    document.getElementById("addEditNewsModal")
  );
  confirmModal.value = new Modal(document.getElementById("modalNewsConfirm"));
});

// Add / edit news
const selectedNews = ref(createEmptyNewsObject());

const onAddNews = () => {
  errorMessage.value = null;
  selectedNews.value = createEmptyNewsObject();
  addEditNewsModal.value.show();
};
const onEditNews = (news) => {
  errorMessage.value = null;
  selectedNews.value = cloneDeep(news);
  addEditNewsModal.value.show();
};
const saveNews = async (news) => {
  selectedNews.value = createEmptyNewsObject();
  try {
    showSpinner.value = true;
    const res = news.id
      ? await ApiService.editNews(news)
      : await ApiService.addNews(news);
    if (res.status != 200) throw res.statusText;
    await fetchNews();
    addEditNewsModal.value.hide();
    errorMessage.value = null;
  } catch (error) {
    console.error(error);
    errorMessage.value = GENERIC_ERROR;
  } finally {
    showSpinner.value = false;
  }
};

// Delete News
const newsToDelete = ref("");
const deleteMessage = ref("");

const onDeleteNews = async (news) => {
  errorMessage.value = null;
  newsToDelete.value = news.id;
  deleteMessage.value = `Willst du die News "${news.title}" wirklich löschen?`;
  confirmModal.value.show();
};

const deleteNews = async () => {
  try {
    await ApiService.deleteNews(newsToDelete.value);
    await fetchNews();
    confirmModal.value.hide();
    errorMessage.value = null;
  } catch (error) {
    console.log(error);
    errorMessage.value = GENERIC_ERROR;
  }
};

// Snip text helper
const snipText = (text) => {
  if (text.length > MAX_NEWS_CHARACTERS) {
    return text.substring(0, MAX_NEWS_CHARACTERS - 80) + "…";
  } else {
    return text;
  }
};
</script>
