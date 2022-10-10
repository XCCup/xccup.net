<template>
  <table class="table table-striped table-hover text-sm">
    <thead>
      <th>Name</th>
      <th>Website</th>
      <th>Tagline</th>
      <th>Kontakt</th>
      <th></th>
      <th>Sponsor in</th>
      <th>Letzte Änderung</th>
      <th></th>
    </thead>
    <tbody>
      <tr v-for="sponsor in props.sponsors" :key="sponsor.id" :item="sponsor">
        <td>{{ sponsor.name }}</td>
        <td style="max-width: 15vw; word-wrap: break-word">
          {{ sponsor.website }}
        </td>
        <td>{{ sponsor.tagline }}</td>
        <td>
          <p
            v-for="line in beautifyContactForTable(sponsor.contact)"
            :key="line"
            :value="line"
          >
            {{ line }}
          </p>
        </td>
        <td>
          <i
            v-if="sponsor.isGoldSponsor"
            class="bi bi bi-coin text-warning"
          ></i>
        </td>
        <td>{{ beautifySeasonsForTable(sponsor.sponsorInSeasons) }}</td>
        <td>
          <BaseDate :timestamp="sponsor.updatedAt" />
        </td>
        <td>
          <button
            class="btn btn-outline-primary m-1 btn-sm bi bi-pencil-square"
            @click="$emit('editSponsor', sponsor)"
          ></button>
          <button
            class="btn btn-outline-danger m-1 btn-sm bi bi-trash"
            @click="$emit('deleteSponsor', sponsor)"
          ></button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import BaseDate from "../BaseDate.vue";
import type { Sponsor, Contact } from "@/types/Sponsor";

interface Props {
  sponsors: Sponsor[];
}
const props = withDefaults(defineProps<Props>(), {});

defineEmits(["editSponsor", "deleteSponsor"]);

function beautifyContactForTable(contact?: Contact) {
  if (!contact || Object.keys(contact).length == 0) return "";
  const nonEmptyValues = Object.values(contact).filter((v) => v?.length > 0);
  return nonEmptyValues;
}

function beautifySeasonsForTable(seasons?: number[]) {
  if (!seasons) return "";
  return seasons.join(", ");
}
</script>
