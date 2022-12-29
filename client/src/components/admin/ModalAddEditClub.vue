<template>
  <div
    id="addEditClubModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="addEditClubModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="addEditClubModalLabel" class="modal-title">
            {{ club.id ? "Verein bearbeiten" : "Verein hinzufügen" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <BaseInput v-model="club.name" label="Name" data-cy="inputClubName" />
          <BaseInput
            v-model="club.website"
            label="Website"
            data-cy="inputClubWebsite"
          />
          <div class="form-check mb-3">
            <input
              id="currentClubCheck"
              v-model="isActiveClub"
              class="form-check-input"
              type="checkbox"
              value=""
              data-cy="checkClubCurrentSeason"
            />
            <label class="form-check-label" for="currentClubCheck">
              Verein aktuelle Saison
            </label>
          </div>
          <!--  This prevents the client from crashing if the contact field does not contain an object.
                Updating then is not possible, as there is no object to bind to. Instead it is obligatory to 
                delete the club and add it again. This seems counterintuitive but will only happen on badly imported clubs.
                It could be handled more elegant but with much more code. And again: This is very unlikely 
          -->
          <div v-if="club.contact">
            <BaseInput v-model="club.contact[0].address" label="Adresse" />
            <BaseInput v-model="club.contact[0].email" label="E-Mail" />
            <BaseInput v-model="club.contact[0].phone" label="Tel." />
            <BaseInput v-model="club.contact[0].phone2" label="Tel. (2)" />
          </div>
          <div v-else class="text-danger">
            Der Eintrag dieses Clubs ist fehlerhaft und muss neu angelegt
            werden.
          </div>

          <LogoHandler
            v-if="club.id"
            :logo-id="club.logo?.id"
            :reference-id="club.id"
            reference-type="Club"
            @logo-updated="onLogoUpdated"
          />
          <p v-else>
            Du musst zuerst den Eintrag speichern, bevor du ein Logo hinzufügen
            kannst
          </p>
        </div>
        <div class="modal-footer">
          <BaseError :error-message="errorMessage" />

          <button
            type="button"
            class="btn btn-primary"
            :disabled="!saveButtonIsEnabled"
            @click="onSaveClub"
          >
            Speichern
            <BaseSpinner v-if="showSpinner" />
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { Club } from "@/types/Club";
import { cloneDeep } from "lodash-es";
import { computed, ref, watch, watchEffect, type Ref } from "vue";

interface Props {
  clubObject: Club;
  showSpinner: boolean;
  errorMessage: string;
}
const props = withDefaults(defineProps<Props>(), {
  showSpinner: false,
  errorMessage: "",
});

const emit = defineEmits(["save-club", "logo-updated"]);

const currentYear = new Date().getFullYear();
const club: Ref<Club> = ref(cloneDeep(props.clubObject));
const isActiveClub = ref(
  club.value.participantInSeasons?.includes(currentYear)
);

watch(
  () => props.clubObject,
  () => {
    club.value = cloneDeep(props.clubObject);
    isActiveClub.value = club.value.participantInSeasons?.includes(currentYear);
  }
);

watchEffect(() => {
  if (
    isActiveClub.value &&
    !club.value.participantInSeasons?.includes(currentYear)
  ) {
    club.value.participantInSeasons?.push(new Date().getFullYear());
  } else if (!isActiveClub.value) {
    club.value.participantInSeasons = club.value.participantInSeasons?.filter(
      (y) => !(y == currentYear)
    );
  }
});

const saveButtonIsEnabled = computed(() => {
  if (!club.value.website) return false;
  return club.value.name.length > 1 && club.value.website.length > 1;
});

const onSaveClub = () => {
  emit("save-club", club.value);
};

const onLogoUpdated = (type: string) => {
  emit("logo-updated", type);
};
</script>

<style scoped>
.club-box {
  border: 1px;
  height: 120px;
}
</style>
