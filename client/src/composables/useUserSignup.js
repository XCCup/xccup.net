import { reactive } from "@vue/reactivity";

// This is a simple state with no actions/getters as it's only used by one component. (Signup)

const initialDate = new Date();
initialDate.setFullYear(initialDate.getFullYear() - 16);

const state = reactive({
  firstName: "",
  lastName: "",
  birthday: null,
  gender: "",
  password: "",
  passwordConfirm: "",
  clubId: "",
  email: "",
  address: { country: "Deutschland", state: "" },
  emailNewsletter: true,
  tshirtSize: "",

  // Set this options as defaults
  // TODO: Maybe do this in backend?

  emailInformIfComment: true,
  emailTeamSearch: false,
});

export default () => {
  // Getters

  // Mutations

  // Actions

  return { userData: state, initialDate };
};
