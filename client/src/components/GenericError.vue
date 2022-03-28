<template>
  <div class="container mt-2">
    <h1>Uh-Oh!</h1>

    <h3>
      {{ GENERIC_ERROR }} <br />
      <a href="#" @click.prevent="$router.go(0)">Hier klicken</a> um es noch mal
      zu probieren
    </h3>
    <button
      class="btn btn-primary btn-sm col-5 me-3 mb-3"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#debugCollapse"
      aria-expanded="false"
      aria-controls="debugCollapse"
    >
      Debug Informationen anzeigen
    </button>

    <a
      class="btn btn-primary btn-sm col-5 mb-3"
      :href="`mailto:${ADMIN_EMAIL}?body=${plainTextError}&subject=ErrorDebug`"
      >Debug Informationen per E-Mail versenden</a
    >
    <div id="debugCollapse" class="collapse">
      <div class="card card-body">
        {{ plainTextError }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { GENERIC_ERROR, ADMIN_EMAIL } from "@/common/Constants";
import { computed } from "vue";
const props = defineProps({ error: { type: Object, default: null } });

const plainTextError = computed(() => JSON.stringify(props.error));
</script>

<style scoped></style>
