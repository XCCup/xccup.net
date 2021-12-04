<template>
  <nav aria-label="Flights pagination">
    <ul class="pagination pagination-sm justify-content-end align-items-center">
      <li class="page-item me-2">
        <select
          v-model="numberFlightsPerPage"
          class="form-select form-select-sm hide-on-xs border-primary"
        >
          <option disabled value="" selected>Anzahl Flüge pro Seite</option>
          <option v-for="option in LIMIT_OPTIONS" :key="option" :value="option">
            {{ option }}
          </option>
        </select>
      </li>
      <li class="page-item me-2">
        {{ currentRange.start }}-{{ currentRange.end }}
        von
        {{ numberOfTotalFlights }}
      </li>
      <li
        class="page-item"
        :class="disableIfNoPreviousEntriesAvailable"
        @click="onFirst"
      >
        <a class="page-link border-primary" href="#" aria-label="First">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
      <li
        class="page-item"
        :class="disableIfNoPreviousEntriesAvailable"
        @click="onPrevious"
      >
        <a class="page-link border-primary" href="#" aria-label="Previous">
          <span aria-hidden="true">&lsaquo;</span>
        </a>
      </li>
      <li
        class="page-item"
        :class="disableIfNoNextEntriesAvailable"
        @click="onNext"
      >
        <a
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
        <a class="page-link border-primary" href="#" aria-label="Last">
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
