<!-- TODO: It may be possible to replace this modal with BaseModal and slots -->
<template>
  <div
    :id="modalId"
    class="modal fade"
    tabindex="-1"
    aria-labelledby="sendMailModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 id="sendMailModalLabel" class="modal-title">
            Nachricht an {{ user?.fullName }}
          </h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
            @click="onClose"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3"></div>
          <div v-if="!mailSent">
            <p>
              Deine Nachricht wird über uns per Mail direkt an
              {{ user?.firstName }} gesendet. {{ user?.firstName }} erhält zur
              Kontaktaufnahme mit Dir deine persönliche E-Mail-Adresse.
            </p>
            <br />
            <BaseInput v-model="mailSubject" label="Betreff" />
            <BaseTextarea v-model="mailMessage" label="Inhalt" />
          </div>
          <div v-else>
            {{ afterMessage }}
            <!-- TODO Replace with BaseSpinner; Problem: Current BaseSpinner causes that modal-body will grow dramastically in heigth. -->
            <div
              v-if="showSpinner"
              class="spinner-border spinner-border-sm"
              role="status"
            >
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            v-if="!mailSent"
            type="button"
            class="btn btn-primary"
            :disabled="!saveButtonIsEnabled"
            @click="onSendMail"
          >
            Senden
          </button>
          <button
            type="button"
            class="btn btn-outline-danger"
            data-bs-dismiss="modal"
            @click="onClose"
          >
            <div v-if="!mailSent">Abbrechen</div>
            <div v-else>Schließen</div>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import ApiService from "@/services/ApiService";

import { computed, ref } from "vue";

const mailSent = ref(false);
const showSpinner = ref(false);
const afterMessage = ref("");

const props = defineProps({
  modalId: {
    type: String,
    required: true,
  },
  user: {
    type: [Object, null],
    required: true,
  },
});
const mailSubject = ref("");
const mailMessage = ref("");

const saveButtonIsEnabled = computed(() => {
  return mailSubject.value.length > 2 && mailMessage.value.length > 2;
});

const onClose = () => {
  mailSent.value = false;
  afterMessage.value = "";
  mailSubject.value = "";
  mailMessage.value = "";
};

const onSendMail = async () => {
  mailSent.value = true;
  showSpinner.value = true;

  const mail = {
    toUserId: props.user.id,
    content: {
      title: mailSubject.value,
      text: mailMessage.value,
    },
  };

  try {
    const res = await ApiService.sendMailToSingleUser(mail);
    if (res.status != 200) throw res.statusText;
    // TODO: Show sweetalert instead
    afterMessage.value = "Deine Nachricht wurde versendet";
  } catch (error) {
    afterMessage.value = "Es gab ein Problem beim senden Deiner Nachricht";
  }
  showSpinner.value = false;
};
</script>
