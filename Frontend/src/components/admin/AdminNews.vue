<template>
  <section class="pb-3">
    <div class="container-fluid">
      <div class="table-responsive">
          <h5>Nachrichten Redaktion</h5>
  <table class="table table-striped table-hover text-sm">
      <thead>
        <th>ID</th>
        <th>Titel</th>
        <th
          class="table-news-message"
          title="Hier dargestellte Nachrichten werden auf der
            Startseite angezeigt"
        >
          Nachricht
        </th>
        <th>Gültig ab</th>
        <th>Gültig bis</th>
        <th
          title="Falls der Haken gesetzt wird, wird automatische eine Rundmail mit dem Inhalt der Nachricht an alle Nutzer versendet"
        >
          Nachricht versenden
        </th>
        <th>Geändert am</th>
        <th>Bearbeiten</th>
        <th>Löschen</th>
      </thead>
      <tbody>
      <tr v-for="entry in news" v-bind:item="entry" v-bind:key="entry.id">
        <td>
          {{ entry.id }}
        </td>
        <td>
          {{ entry.title }}
        </td>
        <td>
          {{ entry.message }}
        </td>
        <td>
          {{ entry.from }}
        </td>
        <td>
          {{ entry.till }}
        </td>
        <td v-if="entry.sendByMail && entry.mailAlreadySended">
          <i class="bi bi-check2-all"></i>
        </td>
        <td v-else-if="entry.sendByMail && !entry.mailAlreadySended">
          <i class="bi bi-check2"></i>
        </td>
        <td v-else>
          <i class="bi bi-x"></i>
        </td>
        <td>
          {{ entry.updatedAt }}
        </td>
        <td>
          <button
            @click="editNews(entry)"
            class="btn btn-outline-primary btn-sm bi bi-pencil-square"
            data-bs-toggle="modal"
            data-bs-target="#newsModal"
          ></button>
        </td>
        <td>
          <button
            @click="deleteNews(entry)"
            class="btn btn-outline-danger btn-sm bi bi-trash"
          ></button>
        </td>
      </tr>
    </tbody>
  </table>
  <button
    type="button"
    class="news-create-btn btn btn-primary btn-outline-light btn-sm m-1"
    data-bs-toggle="modal"
    data-bs-target="#newsModal"
  >
    Erstelle eine neue Nachricht
  </button>
  <!-- Modal -->
  <AdminNewsModel ref="newsModal" :selectedNews="selectedNews" />
  </div>
  </div>
  </section>
</template>

<script>
import ApiService from "@/services/ApiService";

export default {
  data() {
    return {
      news: [],
      selectedNews: createEmptyNewsObject(),
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
    createNewNews() {
      this.news.push();
    },
    async editNews(news) {
      //Open modal with news object
      console.log("REFS: ", this.$refs.newsModal);
      // this.$refs["newsModal"].show();
      console.log("Title: ", news.title);
      console.log("old: ", this.selectedNews);
      //Warum kann das object nicht direkt gesetzt werden???
      // this.selectedNews = news;
      this.selectedNews.title = news.title;
      // this.selectedNews.message = news.message;
      // this.selectedNews.from = news.from;
      // this.selectedNews.till = news.till;
      await this.fetchNews();
    },
    async deleteNews(news) {
      if (news.isNew) {
        const index = this.news.indexOf(news);
        this.news.splice(index, 1);
        return;
      }
      if (confirm("Bist du Dir wirklich sicher diese Nachricht zu löschen?")) {
        const res = await ApiService.deleteNews(news.id);
        await this.fetchNews();
      }
      console.log(news);
    },
  },
  async created() {
    await this.fetchNews();
  },
};
function createEmptyNewsObject() {
  console.log("Will create empty news object");
  return {
    title: "",
    message: "",
    from: new Date(),
    till: null,
    sendByMail: false,
    isNew: true,
  };
}
</script>