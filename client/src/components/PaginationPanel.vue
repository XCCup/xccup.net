<template>
  <nav aria-label="Flights pagination">
    <ul class="pagination pagination-sm justify-content-end align-items-center">
      <li class="me-2">
        <div class="no-line-break pagination-text hide-on-xs">
          Anzahl {{ entryName }} pro Seite
        </div>
      </li>
      <li>
        <select
          id="cyPaginationAmountSelect"
          v-model="numberEntriesPerPage"
          class="form-select form-select-sm hide-on-xs border-primary w-auto"
        >
          <option v-for="option in LIMIT_OPTIONS" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </li>
      <li v-show="multiplePagesExists" class="me-2">
        <div id="cyPaginationInfo" class="no-line-break pagination-text">
          {{ currentRange.start }}-{{ currentRange.end }}
          von
          {{ numberOfTotalEntries }}
        </div>
      </li>
      <li
        v-show="multiplePagesExists"
        class="page-item"
        :class="disableIfNoPreviousEntriesAvailable"
        @click="onFirst"
      >
        <a
          id="cyPaginationFirst"
          class="page-link border-primary"
          href="#"
          aria-label="First"
        >
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      <li
        v-show="multiplePagesExists"
        class="page-item"
        :class="disableIfNoPreviousEntriesAvailable"
        @click="onPrevious"
      >
        <a
          id="cyPaginationPrevious"
          class="page-link border-primary"
          href="#"
          aria-label="Previous"
        >
          <span aria-hidden="true">&lsaquo;</span>
        </a>
      </li>
      <li
        v-show="multiplePagesExists"
        class="page-item"
        :class="disableIfNoNextEntriesAvailable"
        @click="onNext"
      >
        <a
          id="cyPaginationNext"
          class="page-link border-primary"
          :disabled="true"
          href="#"
          aria-label="Next"
        >
          <span aria-hidden="true">&rsaquo;</span>
        </a>
      </li>
      <li
        v-show="multiplePagesExists"
        class="page-item"
        :class="disableIfNoNextEntriesAvailable"
        @click="onLast"
      >
        <a
          id="cyPaginationLast"
          class="page-link border-primary"
          href="#"
          aria-label="Last"
        >
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup>
import useData from "../composables/useData";
import { ref, watch, computed } from "vue";

const props = defineProps({
  apiEndpoint: {
    type: Function,
    required: true,
  },
  entryName: {
    type: String,
    default: "Einträge",
  },
});

const {
  fetchData,
  numberOfTotalEntries,
  DEFAULT_LIMIT,
  LIMIT_OPTIONS,
  currentRange,
} = useData(props.apiEndpoint);

const numberEntriesPerPage = ref(DEFAULT_LIMIT);

watch(numberEntriesPerPage, () => {
  //Don't use watchEffect because this will always run once on setup and cause a second unneccessary request
  fetchData({
    limit: numberEntriesPerPage.value,
    offset: currentRange.value.start - 1,
  });
});

const multiplePagesExists = computed(
  () => numberEntriesPerPage.value < numberOfTotalEntries.value
);

const disableIfNoPreviousEntriesAvailable = computed(() =>
  currentRange.value.start > 1 ? "" : "disabled"
);

const disableIfNoNextEntriesAvailable = computed(() => {
  return currentRange.value.end < numberOfTotalEntries.value ? "" : "disabled";
});

const onFirst = () => {
  if (disableIfNoPreviousEntriesAvailable.value) return;
  fetchData({ limit: numberEntriesPerPage.value, offset: 0 });
};
const onPrevious = () => {
  if (disableIfNoPreviousEntriesAvailable.value) return;
  fetchData({
    limit: numberEntriesPerPage.value,
    offset: currentRange.value.start - numberEntriesPerPage.value - 1,
  });
};
const onNext = () => {
  if (disableIfNoNextEntriesAvailable.value) return;
  fetchData({
    limit: numberEntriesPerPage.value,
    offset: currentRange.value.end,
  });
};
const onLast = () => {
  if (disableIfNoNextEntriesAvailable.value) return;
  fetchData({
    limit: numberEntriesPerPage.value,
    offset: numberOfTotalEntries.value - numberEntriesPerPage.value,
  });
};
</script>

<style scoped>
.pagination-text {
  font-size: small;
}
#cyPaginationFirst {
  border-top-left-radius: 10%;
  border-bottom-left-radius: 10%;
}
</style>
