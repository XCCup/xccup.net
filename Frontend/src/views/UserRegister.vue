<template>
  <section class="bg-secondary">
    <div class="container py-5 h-100">
      <div class="row justify-content-center align-items-center h-100">
        <div class="col-12 col-lg-9 col-xl-7">
          <div
            class="card shadow-2-strong card-registration"
            style="border-radius: 15px"
          >
            <div class="card-body p-4 p-md-5">
              <h3 class="mb-4 pb-2 pb-md-0 mb-md-5">Anmelden</h3>
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

  // Todo: Add inputs

  tshirtSize: "S",
  emailInformIfComment: "true",
  emailNewsletter: "true",
  emailTeamSearch: "false",
  address: { country: "GER" },
});

const listOfClubs = ref([]);

const passwordConfirm = ref("");

// TODO: Change to false
const rulesAccepted = ref(true);

const registerButtonIsDisabled = computed(() => !rulesAccepted.value);

try {
  const res = await apiService.getClubs();
  if (res.status != 200) throw res.statusText;
  listOfClubs.value = res.data;
  console.log(listOfClubs.value[0].id);
  userData.clubId = listOfClubs.value[0].id;
} catch (error) {
  console.log(error);
}

const onSubmit = async () => {
  try {
    const res = await apiService.register(userData);
    if (res.status != 200) throw res.statusText;
  } catch (error) {
    console.log(error);
  }
};
</script>

<style scoped>
.gradient-custom {
  /* fallback for old browsers */
  background: #f093fb;

  /* Chrome 10-25, Safari 5.1-6 */
  background: -webkit-linear-gradient(
    to bottom right,
    rgba(240, 147, 251, 1),
    rgba(245, 87, 108, 1)
  );

  /* W3C, IE 10+/ Edge, Firefox 16+, Chrome 26+, Opera 12+, Safari 7+ */
  background: linear-gradient(
    to bottom right,
    rgba(240, 147, 251, 1),
    rgba(245, 87, 108, 1)
  );
}

.card-registration .select-input.form-control[readonly]:not([disabled]) {
  font-size: 1rem;
  line-height: 2.15;
  padding-left: 0.75em;
  padding-right: 0.75em;
}
.card-registration .select-arrow {
  top: 13px;
}
</style>
