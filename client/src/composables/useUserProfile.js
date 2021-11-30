import { ref, reactive, computed } from "@vue/reactivity";
import ApiService from "@/services/ApiService";

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

const modifiedUserData = reactive({
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

export default () => {
  // Getters
  const userData = computed(() => fetchedData);

  const profileDataHasChanged = computed(
    () => JSON.stringify(modifiedUserData) != JSON.stringify(state.value)
  );
  // Mutations
  // TODO: This is very verbose. Is there a better way?
  const updateState = (data) => {
    state.value.firstName = data.firstName;
    state.value.lastName = data.lastName;
    state.value.birthday = data.birthday;
    state.value.gender = data.gender;
    state.value.clubId = data.clubId;
    state.value.club.name = data.club.name;
    state.value.email = data.email;
    state.value.defaultGlider = data.defaultGlider;

    state.value.address.country = data.address.country ?? "";
    state.value.address.state = data.address.state ?? "";
    state.value.address.city = data.address.city ?? "";
    state.value.address.street = data.address.street ?? "";
    state.value.address.zip = data.address.zip ?? "";

    state.value.emailNewsletter = data.emailNewsletter;
    state.value.tshirtSize = data.tshirtSize;
    state.value.emailInformIfComment = data.emailInformIfComment;
    state.value.emailTeamSearch = data.emailTeamSearch;

    modifiedUserData.firstName = data.firstName;
    modifiedUserData.lastName = data.lastName;
    modifiedUserData.birthday = data.birthday;
    modifiedUserData.gender = data.gender;
    modifiedUserData.clubId = data.clubId;
    modifiedUserData.club.name = data.club.name;
    modifiedUserData.email = data.email;
    modifiedUserData.defaultGlider = data.defaultGlider;

    modifiedUserData.address.country = data.address.country ?? "";
    modifiedUserData.address.state = data.address.state ?? "";
    modifiedUserData.address.city = data.address.city ?? "";
    modifiedUserData.address.street = data.address.street ?? "";
    modifiedUserData.address.zip = data.address.zip ?? "";

    modifiedUserData.emailNewsletter = data.emailNewsletter;
    modifiedUserData.tshirtSize = data.tshirtSize;
    modifiedUserData.emailInformIfComment = data.emailInformIfComment;
    modifiedUserData.emailTeamSearch = data.emailTeamSearch;
  };
  // Actions
  const fetchProfile = async () => {
    const res = await ApiService.getUserDetails();
    if (res.status != 200) throw res.statusText;
    updateState(res.data);
    fetchedData.value = res.data;
  };

  const updateProfile = async () => {
    const res = await ApiService.updateUserProfile(modifiedUserData);
    if (res.status != 200) throw res.statusText;
    await fetchProfile();
  };

  return {
    userData,
    fetchProfile,
    updateProfile,
    modifiedUserData,
    profileDataHasChanged,
  };
};
