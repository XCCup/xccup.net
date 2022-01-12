<template>
  <slot-dialog>
    <!-- TODO: Prevent short display of the heading before redirecting -->
    <div class="container mb-3">
      <h3>Nutzerprofilaktivierung</h3>
      <div v-if="state == 'incompleted'">
        Es wurde kein Konto zur Aktivierung gefunden…
      </div>
      <div v-if="state == 'fail'">
        <p>
          Es gab leider ein Problem mit der Aktivierung. <br />
          Probiere es erneut oder wende Dich bitte an einen <BaseAdmin />
        </p>
      </div>
    </div>
  </slot-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import ApiService from "../services/ApiService";
import useUser from "@/composables/useUser";
const { saveTokenData } = useUser();

const route = useRoute();
const router = useRouter();

const { userId, token } = route.query;

const state = ref("fail");

if (!(userId && token)) {
  // state.value = "incompleted";
} else {
  try {
    const res = await ApiService.activate(userId, token);
    if (res.status != 200 && res.status != 404) throw res.statusText;

    if (res.status == 200) {
      saveTokenData(res.data);
      router.push({ name: "Profile" });
    }

    if (res.status == 404) {
      state.value = "fail";
    }
  } catch (error) {
    state.value = "fail";
    console.error(error);
  }
}
</script>
