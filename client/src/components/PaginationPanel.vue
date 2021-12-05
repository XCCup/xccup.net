<template>
  <nav aria-label="Flights pagination">
    <ul class="pagination pagination-sm justify-content-end align-items-center">
      <li class="me-2">
        <select
          id="cyPaginationAmountSelect"
          v-model="numberFlightsPerPage"
          class="form-select form-select-sm hide-on-xs border-primary"
        >
          <option disabled value="" selected>Anzahl Flüge pro Seite</option>
          <option v-for="option in LIMIT_OPTIONS" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </li>
      <li class="me-2">
        <div id="cyPaginationInfo" class="no-line-break">
          {{ currentRange.start }}-{{ currentRange.end }}
          von
          {{ numberOfTotalFlights }}
        </div>
      </li>
      <li
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
import useFlights from "@/composables/useFlights";
import { ref, watch, computed } from "vue";

const {
  fetchFlights,
  numberOfTotalFlights,
  DEFAULT_LIMIT,
  LIMIT_OPTIONS,
  currentRange,
} = useFlights();

const numberFlightsPerPage = ref(DEFAULT_LIMIT);

watch(numberFlightsPerPage, () => {
  //Don't use watchEffect because this will always run once on setup and cause a second unneccessary request
  fetchFlights({
    limit: numberFlightsPerPage.value,
    offset: currentRange.value.start - 1,
  });
});

const disableIfNoPreviousEntriesAvailable = computed(() =>
  currentRange.value.start > 1 ? "" : "disabled"
);

const disableIfNoNextEntriesAvailable = computed(() => {
  return currentRange.value.end < numberOfTotalFlights.value ? "" : "disabled";
});

const onFirst = () => {
  if (disableIfNoPreviousEntriesAvailable.value) return;
  fetchFlights({ limit: numberFlightsPerPage.value, offset: 0 });
};
const onPrevious = () => {
  if (disableIfNoPreviousEntriesAvailable.value) return;
  fetchFlights({
    limit: numberFlightsPerPage.value,
    offset: currentRange.value.start - numberFlightsPerPage.value - 1,
  });
};
const onNext = () => {
  if (disableIfNoNextEntriesAvailable.value) return;
  fetchFlights({
    limit: numberFlightsPerPage.value,
    offset: currentRange.value.end,
  });
};
const onLast = () => {
  if (disableIfNoNextEntriesAvailable.value) return;
  fetchFlights({
    limit: numberFlightsPerPage.value,
    offset: numberOfTotalFlights.value - numberFlightsPerPage.value,
  });
};
</script>

<style scoped>
#cyPaginationInfo {
  font-size: small;
}
#cyPaginationFirst {
  border-top-left-radius: 10%;
  border-bottom-left-radius: 10%;
}
</style>
