<template>
  <section class="bg-light">
    <div class="container py-5 h-100">
      <div class="row justify-content-center align-items-center h-100">
        <div class="col-12 col-lg-9 col-xl-7">
          <div class="card shadow-2-strong" style="border-radius: 15px">
            <div class="card-body p-4 p-md-5">
              <h3 class="mb-4 pb-2">Anmelden</h3>
              <form>
                <div class="row">
                  <div class="col-md-6 mb-4">
                    <BaseInput v-model="userData.firstName" label="Vorname" />
                  </div>
                  <div class="col-md-6 mb-4">
                    <BaseInput v-model="userData.lastName" label="Nachname" />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-4">
                    <BaseDatePicker
                      v-model="userData.birthday"
                      label="Geburstag"
                    />
                  </div>

                  <div class="col-md-6 mb-4">
                    <BaseInput
                      v-model="userData.email"
                      label="Email"
                      :is-email="true"
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-4">
                    <BaseSelect
                      v-model="userData.gender"
                      label="Geschlecht"
                      :show-label="true"
                      :options="['M', 'W', 'D']"
                    />
                  </div>
                  <div class="col-md-6 mb-4">
                    <BaseSelect
                      v-model="userData.clubId"
                      label="Verein"
                      :show-label="true"
                      :options="listOfClubs"
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-4">
                    <label>Land</label>
                    <select
                      v-model="userData.address.country"
                      class="form-select"
                    >
                      <option
                        v-for="option in listOfCountries"
                        :key="option.countryCode"
                        :value="option.countryCode"
                        :selected="option.key === userData.address.country"
                      >
                        {{ option.countryName }}
                      </option>
                    </select>

                    <!-- <BaseSelect
                      v-model="userData.address.country"
                      label="Land"
                      :show-label="true"
                      :options="listOfCountries"
                    /> -->
                  </div>
                  <div class="col-md-6 mb-4">
                    <BaseSelect
                      v-model="userData.clubId"
                      label="Verein"
                      :show-label="true"
                      :options="listOfClubs"
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-4">
                    <BaseInput
                      v-model="userData.password"
                      label="Passwort"
                      :is-password="true"
                    />
                  </div>
                  <div class="col-md-6 mb-4">
                    <BaseInput
                      v-model="passwordConfirm"
                      label="Passwort wiederholen"
                      :is-password="true"
                    />
                  </div>
                </div>
                <div class="form-check mb-3">
                  <input
                    id="flexCheckDefault"
                    v-model="rulesAccepted"
                    class="form-check-input"
                    type="checkbox"
                  />
                  <label class="form-check-label" for="flexCheckDefault">
                    Ich erkenne ich die
                    <!-- TODO: Add links -->
                    <a href="#">Ausschreibung</a> und
                    <a href="#">Datenschutzbestimmungen</a>
                    an.
                  </label>
                </div>
                <div class="mt-4 pt-2">
                  <button
                    class="btn btn-primary btn-lg"
                    type="submit"
                    :disabled="registerButtonIsDisabled"
                    @click.prevent="onSubmit"
                  >
                    Anmelden
                  </button>
                  <p v-if="errorMessage" class="text-danger mt-4">
                    {{ errorMessage }}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, reactive, computed } from "vue";
import apiService from "@/services/apiService";
import { setWindowName } from "../helper/utils";

setWindowName("Anmelden");

const userData = reactive({
  firstName: "Foo",
  lastName: "Bar",
  birthday: "1986-02-02",
  gender: "M",
  password: "foo2!Bar",
  clubId: "",
  email: "sschoepe@gmail.com",
  address: { country: "" },

  // Todo: Add inputs

  tshirtSize: "S",
  emailInformIfComment: "true",
  emailNewsletter: "true",
  emailTeamSearch: "false",
});

const errorMessage = ref(null);

const listOfClubs = ref([]);
const listOfCountries = ref([]);

const passwordConfirm = ref("");

// TODO: Change to false
const rulesAccepted = ref(true);

const registerButtonIsDisabled = computed(() => !rulesAccepted.value);

try {
  // Get clubs
  let res = await apiService.getClubs();
  if (res.status != 200) throw res.statusText;
  listOfClubs.value = res.data;

  // Get countries
  res = await apiService.getCountries();
  if (res.status != 200) throw res.statusText;
  listOfCountries.value = Object.keys(res.data).map(function (i) {
    return { countryCode: i, countryName: res.data[i] };
  });

  // Todo: remove this
  userData.clubId = listOfClubs.value[0].id;
} catch (error) {
  console.log(error);
}

const onSubmit = async () => {
  try {
    const res = await apiService.register(userData);
    if (res.status != 200) throw res.statusText;
    errorMessage.value = null;
  } catch (error) {
    if (error.response?.data === "email must be unique")
      return (errorMessage.value = "Diese Email existiert bereits");
    console.log(error);
  }
};
</script>

<style scoped></style>
