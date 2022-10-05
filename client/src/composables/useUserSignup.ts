import { reactive } from "vue";

// This is a simple state with no actions/getters as it's only used by one component. (Signup)

const initialDate = new Date();
initialDate.setFullYear(initialDate.getFullYear() - 16);

/**
 * Defaults for gender & shirt size are a workaround for the safari
 * selects bug in BaseSelect.vue
 */
const state = reactive({
  firstName: "",
  lastName: "",
  birthday: null,
  gender: "M",
  password: "",
  passwordConfirm: "",
  clubId: "",
  email: "",
  address: { country: "Deutschland", state: "" },
  emailNewsletter: true,
  tshirtSize: "L",
  emailInformIfComment: true,
  emailTeamSearch: false,
});

export default () => {
  // Getters

  // Mutations

  // Actions

  return { userData: state, initialDate };
};
