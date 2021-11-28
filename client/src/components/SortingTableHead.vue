<template>
  <th class="no-line-break" @click="onSort">
    {{ content }} <i :class="chevronClass" class="ps-0"></i>
  </th>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  content: {
    type: String,
    required: true,
  },
  columnObjectKey: {
    type: String,
    required: true,
  },
  currentSortColumnKey: {
    type: [String, null],
    required: true,
  },
});

const emit = defineEmits(["head-sort-changed"]);

const chevronClass = ref("bi bi-chevron-expand");

let sortOrder = undefined;

// Remove sorting icon if sorting is active on differnt column
watch(
  () => props.currentSortColumnKey,
  () => {
    if (props.currentSortColumnKey != props.columnObjectKey) {
      chevronClass.value = "bi bi-chevron-expand";
      sortOrder = undefined;
    }
  }
);

const onSort = () => {
  // sort order (DESC -> ASC -> Reset)

  switch (sortOrder) {
    case undefined:
      sortOrder = "DESC";
      chevronClass.value = "bi bi-chevron-down";
      emitSortChange();
      break;
    case "DESC":
      sortOrder = "ASC";
      chevronClass.value = "bi bi-chevron-up";
      emitSortChange();
      break;
    case "ASC":
      sortOrder = undefined;
      chevronClass.value = "bi bi-chevron-expand";
      emitSortChange();
      break;

    default:
      break;
  }
};

function emitSortChange() {
  emit("head-sort-changed", {
    order: sortOrder,
    key: sortOrder ? props.columnObjectKey : null,
  });
}
</script>

<style scoped>
th:hover {
  cursor: pointer;
}
</style>
