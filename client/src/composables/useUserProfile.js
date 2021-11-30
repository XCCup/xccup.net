import { ref, computed, readonly } from "vue";
import ApiService from "@/services/ApiService";
import { cloneDeep } from "lodash";
const fetchedData = ref(null);

const state = ref({
  firstName: "",
  lastName: "",
  birthday: "",
  gender: "",
  clubId: "",
  club: { name: "" },
  email: "",
  address: { street: "", country: "", state: "", zip: "", city: "" },
  emailNewsletter: true,
  tshirtSize: "",
  defaultGlider: "",
  emailInformIfComment: false,
  emailTeamSearch: false,
});

const modifiedUserData = ref(null);

export default () => {
  // Getters
  // const userData = computed(() => fetchedData);

  const profileDataHasChanged = computed(
    () => JSON.stringify(modifiedUserData.value) != JSON.stringify(state.value)
  );
  // Mutations
  const updateState = (data) => {
    state.value = { ...data };
    modifiedUserData.value = cloneDeep(state.value);
  };
  // Actions
  const fetchProfile = async () => {
    const res = await ApiService.getUserDetails();
    if (res.status != 200) throw res.statusText;
    updateState(res.data);
    fetchedData.value = res.data;
  };

  const updateProfile = async () => {
    const res = await ApiService.updateUserProfile(modifiedUserData.value);
    if (res.status != 200) throw res.statusText;
    await fetchProfile();
  };

  return {
    userData: readonly(state),
    fetchProfile,
    updateProfile,
    modifiedUserData,
    profileDataHasChanged,
    state,
  };
};
