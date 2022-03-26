<template>
  <div class="container mt-2">
    <h1>Uh-Oh!</h1>

    <h3>
      {{ GENERIC_ERROR }} <br />
      <a href="#" @click.prevent="$router.go(0)">Hier klicken</a> um es noch mal
      zu probieren
    </h3>
    <p>
      <button
        class="btn btn-primary btn-sm me-2 mb-2"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#debugCollapse"
        aria-expanded="false"
        aria-controls="debugCollapse"
      >
        Debug Informationen anzeigen
      </button>

      <a
        class="btn btn-primary btn-sm"
        :href="`mailto:${ADMIN_EMAIL}?body=${plainTextError}&subject=ErrorDebug`"
        >Debug Informationen per e-mail versenden</a
      >
    </p>
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
