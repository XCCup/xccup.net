<template>
  <th :class="headClass" @click="onSort">{{ content }}</th>
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

const headClass = ref(undefined);

let sortOrder = undefined;

// Remove sorting icon if sorting is active on differnt column
watch(
  () => props.currentSortColumnKey,
  () => {
    if (props.currentSortColumnKey != props.columnObjectKey) {
      headClass.value = undefined;
      sortOrder = undefined;
    }
  }
);

const onSort = () => {
  // sort order (DESC -> ASC -> Reset)

  switch (sortOrder) {
    case undefined:
      sortOrder = "DESC";
      headClass.value = "sort-desc";
      emitSortChange();
      break;
    case "DESC":
      sortOrder = "ASC";
      headClass.value = "sort-asc";
      emitSortChange();
      break;
    case "ASC":
      sortOrder = undefined;
      headClass.value = undefined;
      emitSortChange();
      break;

    default:
      break;
  }

  console.log("Sort: ", sortOrder);
};

function emitSortChange() {
  emit("head-sort-changed", {
    order: sortOrder,
    key: props.columnObjectKey,
  });
}
</script>

<style scoped>
th:hover {
  cursor: pointer;
}

th.sort-desc::after {
  content: "\25BC";
}
th.sort-asc::after {
  content: "\25B2";
}
</style>
