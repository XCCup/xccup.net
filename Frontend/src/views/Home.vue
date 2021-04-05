<template>
  <Infobox />
  <Tageswertung :maxRows="5" />
  <Gesamtwertung />
  <Sponsoren />
</template>

<script>
import Tageswertung from "@/components/rankings/Tageswertung.vue";
import Infobox from "@/components/Infobox.vue";
import Gesamtwertung from "@/components/Gesamtwertung.vue";
import Sponsoren from "@/components/Sponsoren.vue";

export default {
  name: "Home",
  components: {
    Tageswertung,
    Infobox,
    Gesamtwertung,
    Sponsoren,
  },
};
</script>
