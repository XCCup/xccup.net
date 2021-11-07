<template>
  <section class="pb-3">
    <div class="container-fluid">
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
            <tr v-for="entry in news" v-bind:item="entry" v-bind:key="entry.id">
              <td>
                <strong> {{ entry.title }} </strong>
              </td>
              <td>
                {{ entry.message }}
              </td>
              <td>
                <BaseDate :timestamp="entry.from" />
              </td>
              <td>
                <BaseDate :timestamp="entry.till" />
              </td>
              <td v-if="entry.sendByMail && entry.mailAlreadySend">
                <i class="bi bi-check2-all"></i>
              </td>
              <td v-else-if="entry.sendByMail && !entry.mailAlreadySend">
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
                  @click="onEditNews(entry)"
                  class="btn btn-outline-primary m-1 btn-sm bi bi-pencil-square"
                ></button>
                <button
                  @click="onDeleteNews(entry)"
                  class="btn btn-outline-danger m-1 btn-sm bi bi-trash"
                ></button>
              </td>
            </tr>
          </tbody>
        </table>
        <button
          @click="onAddNews"
          type="button"
          class="btn btn-outline-primary btn-sm m-1"
        >
          Erstelle eine neue Nachricht
        </button>
      </div>
    </div>
  </section>
  <!-- Modal -->
  <ModalAddEditNews @save-news="saveNews" :newsObject="selectedNews" />
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
    };
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
    async onDeleteNews(news) {
      if (confirm("Bist du Dir wirklich sicher diese Nachricht zu löschen?")) {
        const res = await ApiService.deleteNews(news.id);
        await this.fetchNews();
      }
    },
  },
  mounted() {},
  async created() {
    await this.fetchNews();
    this.addEditNewsModal = new Modal(
      document.getElementById("addEditNewsModal")
    );
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
