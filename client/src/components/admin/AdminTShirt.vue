<template>
  <div id="adminTShirtPanel" class="py-3">
    <button
      class="col-2 btn btn-outline-primary btn-sm bi bi-list-columns me-3"
      @click="onFetch"
    >
      Statistik anfordern
    </button>
    <button
      type="button"
      class="col-2 btn btn-outline-primary bi bi-file-earmark-arrow-down btn-sm"
      @click="onExport"
    >
      Liste exportieren
    </button>
    <div v-if="entries.length">
      <h5>Statistik</h5>
      <p data-cy="tshirt-overall-count">
        Zur Zeit haben sich {{ entries.length }} Piloten für ein T-Shirt
        qualifiziert. Dies teilt sich wie folgt auf.
      </p>
      <table class="table table-striped table-hover text-sm">
        <thead>
          <th>Größe</th>
          <th>Geschlecht</th>
          <th>Anzahl</th>
        </thead>
        <tbody>
          <tr v-for="stat in stats" :key="stat" :item="stat">
            <td>{{ stat.tshirtSize }}</td>
            <td>{{ stat.gender }}</td>
            <td>{{ stat.amount }}</td>
          </tr>
        </tbody>
      </table>
      <ul></ul>
      <div class="table-responsive">
        <h5>Gesamtübersicht</h5>
        <table class="table table-striped table-hover text-sm">
          <thead>
            <th>Verein</th>
            <th>Name</th>
            <th>Größe</th>
            <th>Geschlecht</th>
            <th>E-Mail</th>
            <th>Adresse</th>
          </thead>
          <tbody>
            <tr v-for="entry in entries" :key="entry.id" :item="entry">
              <td>{{ entry.club?.name }}</td>
              <td>{{ entry.fullName }}</td>
              <td>{{ entry.tshirtSize }}</td>
              <td>{{ entry.gender }}</td>
              <td>
                <a
                  class="btn btn-outline-primary btn-sm"
                  :href="`mailto:${entry.email}?subject=Dein XCCup T-Shirt`"
                >
                  <i class="bi bi-envelope"></i>
                </a>
              </td>
              <td>
                {{ entry.address?.country }}<br />{{ entry.address?.zip }}
                {{ entry.address?.city }}<br />{{ entry.address?.street }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const entries = ref([]);
const stats = ref([]);

const onExport = () => {
  //TODO: Implement an CSV export
  alert(
    "Diese Funktion ist noch nicht implementiert! Wir sollten zuerst absprechen, welche Daten wirklich alle benötigt werden"
  );
};

const onFetch = async () => {
  try {
    const res = await ApiService.getTShirtList();
    entries.value = res.data;
    calcStats();
  } catch (error) {
    console.log(error);
    router.push({
      name: "NetworkError",
    });
  }
};

function calcStats() {
  entries.value.forEach((e) => {
    const found = stats.value.find(
      (s) => s.tshirtSize == e.tshirtSize && s.gender == e.gender
    );
    if (found) {
      found.amount++;
    } else {
      stats.value.push({
        tshirtSize: e.tshirtSize,
        gender: e.gender,
        amount: 1,
      });
    }
  });
  stats.value.sort((a, b) => a.amount < b.amount);
}
</script>
