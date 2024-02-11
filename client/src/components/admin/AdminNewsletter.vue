<template>
  <div id="adminNewsletterPanel" class="pb-3">
    <h5>Newsletter</h5>
    <div class="form-check mt-3">
      <input
        id="checkNewsLetterIncludeAll"
        v-model="includeAllUserEmails"
        class="form-check-input"
        type="checkbox"
        @change="onIncludeAllChanged"
      />
      <label class="form-check-label" for="checkNewsLetterIncludeAll">
        Sende Nachricht an alle Nutzer anstatt nur Newsletter Abonennten
      </label>
    </div>
    <a
      class="btn btn-outline-primary btn-sm mt-3"
      :class="disableNewsLetter ? 'disabled' : 'bi bi-envelope'"
      :href="`mailto:?subject=XCCup Newsletter&body=${emailBody}`"
    >
      <BaseSpinner v-if="disableNewsLetter" />
      Starte einen Newsletter
    </a>
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { chunk } from "lodash-es";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const userEmails = ref([]);
const includeAllUserEmails = ref(false);
const disableNewsLetter = ref(true);

const fetchEmails = async () => {
  try {
    disableNewsLetter.value = true;
    const res = await ApiService.getUserEmails(includeAllUserEmails.value);
    userEmails.value = res.data;
  } catch (error) {
    console.log(error);
    router.push({
      name: "NetworkError",
    });
  } finally {
    disableNewsLetter.value = false;
  }
};

await fetchEmails();

const emailBody = computed(() => {
  const maxDay = 6;
  const maxHour = 3;

  const chunksHour = chunk(userEmails.value, maxHour);
  const chunksDay = chunk(chunksHour, maxDay / maxHour);

  console.log(chunksHour);
  console.log(chunksDay);

  const linebreak = "%0D%0A";

  let message = `Mit Stand 11.02.2024 ermöglicht unser Webhosting nur den Versand von ${maxHour} E-Mails pro Stunde und ${maxDay} E-Mails pro Tag.${linebreak}
D.h. Newsletter-Mails müssen in mehreren Chargen versendet werden.${linebreak}
Nachfolgend finden sich alle E-Mail-Adressen entsprechend der obigen Vorgaben in Gruppen aufgetrennt.${linebreak}${linebreak}
`;

  const mailGroups = chunksDay.map(
    (cD, i) =>
      "Tag " + (i + 1) + ":" + linebreak + cD.join(linebreak) + linebreak
  );

  return message + mailGroups;
});

const onIncludeAllChanged = () => {
  fetchEmails();
};
</script>
