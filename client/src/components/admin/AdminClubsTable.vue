<template>
  <table class="table table-striped table-hover text-sm">
    <thead>
      <th>Name</th>
      <th>Website</th>
      <th>Kontakt</th>
      <th>Club in</th>
      <th>Letzte Änderung</th>
      <th></th>
    </thead>
    <tbody>
      <tr v-for="club in props.clubs" :key="club.id" :item="club">
        <td>{{ club.name }}</td>
        <td style="max-width: 15vw; word-wrap: break-word">
          {{ club.website }}
        </td>
        <td>
          <p
            v-for="line in beautifyContactForTable(club.contacts)"
            :key="line"
            :value="line"
          >
            {{ line }}
          </p>
        </td>
        <td>{{ beautifySeasonsForTable(club.participantInSeasons) }}</td>
        <td>
          <BaseDate :timestamp="club.updatedAt" />
        </td>
        <td>
          <button
            class="btn btn-outline-primary m-1 btn-sm bi bi-pencil-square"
            data-cy="edit-club"
            @click="$emit('editClub', club)"
          ></button>
          <button
            class="btn btn-outline-danger m-1 btn-sm bi bi-trash"
            @click="$emit('deleteClub', club)"
          ></button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import BaseDate from "../BaseDate.vue";
import type { Club } from "@/types/Club";
import type { Contact } from "@/types/Contact";

interface Props {
  clubs: Club[];
}
const props = withDefaults(defineProps<Props>(), {});

defineEmits(["editClub", "deleteClub"]);

function beautifyContactForTable(contacts?: Contact[]) {
  if (!contacts) return "";

  let lines: string[] = [];

  contacts.forEach((contact) => {
    lines = lines.concat(Object.values(contact).filter((v) => v?.length > 0));
  });
  return lines;
}

function beautifySeasonsForTable(seasons?: number[]) {
  if (!seasons) return "";
  return seasons.join(", ");
}
</script>
