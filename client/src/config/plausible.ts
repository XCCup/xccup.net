import { createPlausible } from "v-plausible/vue";

export const plausible = createPlausible({
  init: {
    domain: "xccup.net",
    apiHost: import.meta.env.VITE_PLAUSIBLE_API_HOST,
    trackLocalhost: false,
  },
  settings: {
    enableAutoOutboundTracking: true,
    enableAutoPageviews: true,
  },
  partytown: false,
});
