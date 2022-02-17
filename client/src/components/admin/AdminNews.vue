<template>
  <section class="pb-3">
    <div id="adminNewsPanel">
      <div class="table-responsive">
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Titel</th>
            <th>Icon</th>

            <th>Nachricht</th>
            <th>Von</th>
            <th>bis</th>
            <th>Geändert am</th>
            <th></th>
          </thead>
          <tbody>
            <tr v-for="entry in news" :key="entry.id" :item="entry">
              <td>
                <strong>{{ entry.title }}</strong>
              </td>
              <td>
                <i class="bi fs-2" :class="entry.icon ?? 'bi-megaphone'"></i>
              </td>
              <td>{{ entry.message }}</td>
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
  </section>
  <!-- Modal -->
  <ModalAddEditNews :news-object="selectedNews" @save-news="saveNews" />
  <BaseModal
    modal-title="News löschen?"
    :modal-body="deleteMessage"
    confirm-button-text="Löschen"
    :modal-id="modalId"
    :confirm-action="deleteNews"
    :is-dangerous-action="true"
  />
</template>

<script>
import ApiService from "@/services/ApiService";
import { Modal } from "bootstrap";
import { adjustDateToLocal } from "../../helper/utils";

export default {
  data() {
    return {
      news: [],
      selectedNews: createEmptyNewsObject(),
      addEditNewsModal: null,
      confirmModal: null,
      deleteMessage: "",
      modalId: "modalNewsConfirm",
    };
  },
  async mounted() {
    await this.fetchNews();
    this.addEditNewsModal = new Modal(
      document.getElementById("addEditNewsModal")
    );
    this.confirmModal = new Modal(document.getElementById(this.modalId));
  },
  methods: {
    async fetchNews() {
      try {
        const res = await ApiService.getAllNews();
        this.news = res.data;
        transfromToDateObjects(this.news);
      } catch (error) {
        console.log(error);
      }
    },
    onAddNews() {
      this.selectedNews = createEmptyNewsObject();
      this.addEditNewsModal.show();
    },
    onEditNews(news) {
      //Clone object, otherwise a change to a value in the dialog has also an effect to the same value in the table
      this.selectedNews = Object.assign({}, news);
      this.addEditNewsModal.show();
    },
    async saveNews(news) {
      this.selectedNews = createEmptyNewsObject();
      try {
        const res = news.id
          ? await ApiService.editNews(news)
          : await ApiService.addNews(news);
        if (res.status != 200) throw res.statusText;
        this.fetchNews();
      } catch (error) {
        console.error(error);
      }
    },
    onDeleteNews(news) {
      this.selectedNews = news;
      this.deleteMessage = `Willst du die Nachricht ${news.title} wirklich löschen?`;
      this.confirmModal.show();
    },
    async deleteNews() {
      await ApiService.deleteNews(this.selectedNews.id);
      await this.fetchNews();
      this.confirmModal.hide();
    },
  },
};
function createEmptyNewsObject() {
  return {
    title: "",
    message: "",
    icon: "",
    from: new Date(),
    till: new Date(),
  };
}

function transfromToDateObjects(news) {
  news.forEach((element) => {
    element.from = adjustDateToLocal(element.from);
    element.till = adjustDateToLocal(element.till);
  });
}
</script>
