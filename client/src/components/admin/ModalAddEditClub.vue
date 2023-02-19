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
            v-model="club.shortName"
            label="Kurzname (wird z.B. in Links genutzt werden)"
            data-cy="inputClubShortName"
          />
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
              Verein nimmt an aktueller Saison teil
            </label>
          </div>
          <div
            v-for="(contact, index) in club.contacts"
            :key="contact.name"
            :item="contact"
            :index="index"
          >
            <hr />
            <p>{{ index + 1 }}. Kontakt</p>
            <div v-if="club.contacts && club.contacts[index]">
              <BaseInput
                :id="'clubContactNameInput' + index"
                v-model="club.contacts[index].name"
                label="Name"
              />
              <BaseInput
                :id="'clubContactAddressInput' + index"
                v-model="club.contacts[index].address"
                label="Adresse"
              />
              <BaseInput
                :id="'clubContactEmailInput' + index"
                v-model="club.contacts[index].email"
                label="E-Mail"
              />
              <BaseInput
                :id="'clubContactPhoneInput' + index"
                v-model="club.contacts[index].phone"
                label="Tel."
              />
              <BaseInput
                v-model="club.contacts[index].phone2"
                label="Tel. (2)"
              />
            </div>
            <button
              v-if="index !== 0"
              class="btn btn-sm btn-outline-danger mb-3"
              @click="onDeleteContact(index)"
            >
              Kontakt löschen
            </button>
          </div>
          <div>
            <button
              class="btn btn-sm btn-outline-primary"
              @click="onAddContact"
            >
              Kontakt ergänzen
            </button>
          </div>
          <hr />
          <!-- Logos aren't currently used anywhere on the frontend for clubs -->
          <!-- <LogoHandler
            v-if="club.id"
            :logo-id="club.logo?.id"
            :reference-id="club.id"
            reference-type="Club"
            @logo-updated="onLogoUpdated"
          />
          <p v-else>
            Du musst zuerst den Eintrag speichern, bevor du ein Logo hinzufügen
            kannst
          </p> -->
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

console.log("Club Modal received:", props.clubObject);

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
  return (
    club.value.name.length > 1 &&
    club.value.shortName.length > 1 &&
    club.value.website.length > 1
  );
});

const onSaveClub = () => {
  emit("save-club", club.value);
};

const onDeleteContact = (index: number) => {
  if (!club.value.contacts) return;
  club.value.contacts.splice(index, 1);
};

const onAddContact = () => {
  if (!club.value.contacts) return;
  club.value.contacts.push({
    name: "",
    address: "",
    email: "",
    phone: "",
    phone2: "",
  });
};

// const onLogoUpdated = (type: string) => {
//   emit("logo-updated", type);
// };
</script>

<style scoped>
.club-box {
  border: 1px;
  height: 120px;
}
</style>
