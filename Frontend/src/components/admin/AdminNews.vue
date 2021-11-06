<template>
  <section class="pb-3">
    <div class="container-fluid">
      <div class="table-responsive">
          <h5>Nachrichten Redaktion</h5>
          <table class="table table-striped table-hover text-sm">
            <thead>
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
                    data-bs-target="#addEditNewsModal"
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
            @click="addNews"
            type="button"
            class="news-create-btn btn btn-primary btn-outline-light btn-sm m-1"
            data-bs-toggle="modal"
            data-bs-target="#addEditNewsModal"
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
    addNews() {
      this.selectedNews = createEmptyNewsObject();
    },
    editNews(news) {
      //Clone object, otherwise a change to a value in the dialog has also an effect to the same value in the table
      this.selectedNews = Object.assign({}, news);
    },
    async saveNews(news) {
      try {
        const res = news.id ? await ApiService.editNews(news) : await ApiService.addNews(news);
        if (res.status != 200) throw res.statusText;
        this.fetchNews();
      } catch (error) {
        console.error(error);
      }
    },
    async deleteNews(news) {
      if (confirm("Bist du Dir wirklich sicher diese Nachricht zu löschen?")) {
        const res = await ApiService.deleteNews(news.id);
        await this.fetchNews();
      }
    },
  },
  async created() {
    await this.fetchNews();
  },
};
function createEmptyNewsObject() {
  return {
    title: "",
    message: "",
    from: new Date().toISOString().substring(0,10),
    till: null,
    sendByMail: false,
  };
}
</script>