<template>
  <!-- FAI -->
  <i
    v-if="flightType === `FAI`"
    ref="icon"
    class="bi bi-triangle me-1"
    data-bs-placement="top"
    title="FAI Dreieck"
  ></i>
  <!-- Flat -->
  <svg
    v-if="flightType === `FLAT`"
    ref="icon"
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    fill="currentColor"
    viewBox="0 0 487.047 487.047"
    style="enable-background: new 0 0 487.047 487.047"
    class="me-1"
    data-bs-placement="top"
    title="Flaches Dreieck"
  >
    <path
      d="M468.616,93.218c-3.098-0.208-6.241,0.759-9.151,2.838c-62.956,45.13-142.625,86.988-219.655,127.465
			c-80.443,42.267-163.62,85.962-228.852,133.843c-1.444,1.056-2.676,2.311-3.732,3.813c-5.675,3.447-8.475,10.841-6.693,17.869
			c1.742,6.876,7.279,11.141,14.652,11.141c18.969-0.213,39.321-0.31,60.626-0.31c82.428,0,180.474,1.412,266.978,2.65
			c42.426,0.6,82.725,1.184,118.225,1.56h0.203c8.664,0,13.122-5.794,14.473-11.385c1.482-2.382,2.244-5.099,2.255-8.109
			c0.142-51.064,2.422-98.478,4.616-144.319c1.863-38.899,3.793-79.12,4.483-122.14c0.071-4.253-1.32-7.945-4.017-10.684
			C479.559,93.924,473.953,92.281,468.616,93.218z M62.012,358.73c56.312-39.882,128.247-76.327,197.904-111.608
			c68.634-34.767,139.553-70.686,195.238-109.804c-0.924,33.352-2.412,64.498-3.85,94.669c-2.066,43.246-4.017,84.14-4.438,130.72
			c-27.975-0.335-59.768-0.772-93.45-1.239c-93.521-1.29-199.524-2.747-280.335-2.747C69.327,358.72,65.641,358.725,62.012,358.73z"
    />
  </svg>
  <!-- Free -->
  <i
    v-if="flightType === `FREE`"
    ref="icon"
    class="bi bi-arrow-up-right"
    data-bs-placement="top"
    title="Freie Strecke"
  ></i>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from "vue";
import { Tooltip } from "bootstrap";

defineProps({
  flightType: {
    type: [String, null],
    required: true,
  },
});

const icon = ref(null);
let tooltip = null;

onMounted(() => {
  if (icon.value) tooltip = new Tooltip(icon.value);
});

onUnmounted(() => {
  if (tooltip) {
    tooltip.dispose();
    tooltip = null;
  }
});
</script>

<style scoped></style>
