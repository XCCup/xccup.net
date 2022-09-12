<template>
  <div
    id="addEditSponsorModal"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="addEditSponsorModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="addEditSponsorModalLabel" class="modal-title">
            {{ sponsor.id ? "Sponsor bearbeiten" : "Sponsor hinzufügen" }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <BaseInput v-model="sponsor.name" label="Name" />
          <BaseInput v-model="sponsor.website" label="Website" />
          <BaseInput v-model="sponsor.tagline" label="Tagline" />
          <div class="form-check mb-3">
            <input
              id="currentSponsorCheck"
              v-model="isActiveSponsor"
              class="form-check-input"
              type="checkbox"
              value=""
            />
            <label class="form-check-label" for="currentSponsorCheck">
              Sponsor aktuelle Saison
            </label>
          </div>
          <div class="form-check mb-3">
            <input
              id="goldSponsorCheck"
              v-model="sponsor.isGoldSponsor"
              class="form-check-input"
              type="checkbox"
              value=""
            />
            <label class="form-check-label" for="goldSponsorCheck">
              Goldsponsor
            </label>
          </div>
          <BaseInput v-model="sponsor.contacts.address" label="Adresse" />
          <BaseInput v-model="sponsor.contacts.email" label="E-Mail" />
          <BaseInput v-model="sponsor.contacts.phone" label="Tel." />
          <BaseInput v-model="sponsor.contacts.phone2" label="Tel. (2)" />
        </div>
        <div class="modal-footer">
          <BaseError :error-message="errorMessage" />

          <button
            type="button"
            class="btn btn-primary"
            :disabled="!saveButtonIsEnabled"
            @click="onSaveSponsor"
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
import type { Sponsor } from "@/types/Sponsor";
import { cloneDeep } from "lodash";
import { computed, ref, watch, watchEffect, type Ref } from "vue";

const props = defineProps({
  sponsorObject: {
    type: Object,
    required: true,
  },
  showSpinner: {
    type: Boolean,
    default: false,
  },
  errorMessage: {
    type: [String, null],
    default: null,
  },
});

const currentYear = new Date().getFullYear();
const sponsor: Ref<Sponsor> = ref(cloneDeep(props.sponsorObject));
const isActiveSponsor = ref(
  sponsor.value.sponsorInSeasons.includes(currentYear)
);

watch(
  () => props.sponsorObject,
  () => {
    sponsor.value = cloneDeep(props.sponsorObject);
    isActiveSponsor.value =
      sponsor.value.sponsorInSeasons.includes(currentYear);
  }
);

watchEffect(() => {
  if (
    isActiveSponsor.value &&
    !sponsor.value.sponsorInSeasons.includes(currentYear)
  ) {
    sponsor.value.sponsorInSeasons.push(new Date().getFullYear());
  } else if (!isActiveSponsor.value) {
    sponsor.value.sponsorInSeasons = sponsor.value.sponsorInSeasons.filter(
      (y) => !(y == currentYear)
    );
  }
});

const emit = defineEmits(["save-sponsor"]);

const saveButtonIsEnabled = computed(() => {
  return sponsor.value.name.length > 1 && sponsor.value.website.length > 1;
});

const onSaveSponsor = () => {
  emit("save-sponsor", sponsor.value);
};
</script>
