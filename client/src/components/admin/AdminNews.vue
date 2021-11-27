<template>
  <section class="pb-3">
    <div id="adminNewsPanel" class="container-fluid">
      <div class="table-responsive">
        <h5>Nachrichten Redaktion</h5>
        <p>Hier dargestellte Nachrichten werden auf der Startseite angezeigt</p>
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Titel</th>
            <th>Nachricht</th>
            <th>Gültig ab</th>
            <th>Gültig bis</th>
            <th
              title="Falls der Haken gesetzt wird, wird automatische eine Rundmail mit dem Inhalt der Nachricht an alle Nutzer versendet"
            >
              Nachricht versenden
            </th>
            <th>Geändert am</th>
            <th></th>
          </thead>
          <tbody>
            <tr v-for="entry in news" :key="entry.id" :item="entry">
              <td>
                <strong>{{ entry.title }}</strong>
              </td>
              <td>{{ entry.message }}</td>
              <td>
                <BaseDate :timestamp="entry.from" />
              </td>
              <td>
                <BaseDate :timestamp="entry.till" />
              </td>
              <td v-if="entry.sendByMail && entry.mailalreadySent">
                <i class="bi bi-check2-all"></i>
              </td>
              <td v-else-if="entry.sendByMail && !entry.mailalreadySent">
                <i class="bi bi-check2"></i>
              </td>
              <td v-else>
                <i class="bi bi-x"></i>
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
    },
  },
};
function createEmptyNewsObject() {
  return {
    title: "",
    message: "",
    from: new Date().toISOString().substring(0, 10),
    till: null,
    sendByMail: false,
  };
}
</script>
