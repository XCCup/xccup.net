import { ref, computed, readonly, watchEffect } from "vue";
import ApiService from "@/services/ApiService";

// Create a "prototype" of the user data expected by bindings in UserProfile.vue
// This prevents null cases if the corresponding properties are none existent in API response

const userData = ref({
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
  emailInformIfComment: false,
  emailTeamSearch: false,
});

// Make an editable copy of the userData state
const modifiedUserData = ref({ ...userData.value });

export default () => {
  // Getters

  const profileDataHasChanged = computed(
    () =>
      JSON.stringify(modifiedUserData.value) != JSON.stringify(userData.value)
  );
  // Mutations
  const updateState = (data) => {
    userData.value = { ...data };
    modifiedUserData.value = { ...userData.value };
  };
  // Actions
  const fetchProfile = async () => {
    const res = await ApiService.getUserDetails();
    if (res.status != 200) throw res.statusText;
    updateState(res.data);
  };

  const updateProfile = async () => {
    const res = await ApiService.updateUserProfile(modifiedUserData.value);
    if (res.status != 200) throw res.statusText;
    await fetchProfile();
  };

  // Clear users state if country is not germany
  watchEffect(() => {
    if (modifiedUserData.value.address.country != "Deutschland") {
      modifiedUserData.value.address.state = "";
    }
  });

  return {
    userData: readonly(userData),
    fetchProfile,
    updateProfile,
    modifiedUserData,
    profileDataHasChanged,
  };
};
