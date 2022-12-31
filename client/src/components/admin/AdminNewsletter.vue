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
      :href="`mailto:?bcc=${userEmails.join(',')}&amp;subject=XCCup Newsletter`"
    >
      <BaseSpinner v-if="disableNewsLetter" />
      Starte einen Newsletter
    </a>
  </div>
</template>

<script setup>
import ApiService from "@/services/ApiService";
import { ref } from "vue";
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

const onIncludeAllChanged = () => {
  fetchEmails();
};
</script>
