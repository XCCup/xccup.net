<template>
  <slot-dialog :narrow="true">
    <h3>Teammeldung</h3>
    <div v-if="submitSuccessful" data-cy="team-submit-successful">
      <p>
        Deine Meldung war erfolgreich.
        <router-link
          :to="{
            name: 'ResultsTeams',
            params: { year: new Date().getFullYear() },
          }"
        >
          Hier
        </router-link>
        findest Du die aktuellen Teams mit all ihren Mitgliedern.
      </p>
    </div>
    <div
      v-if="!loggedInUserIsAlreadyInATeam && !submitSuccessful"
      data-cy="team-submit-panel"
    >
      <ul class="mb-3">
        <li>Ein Team besteht immer aus 5 Mitgliedern</li>
        <li>Der Teamname muss einmalig sein</li>
        <li>Teammitglieder können immer nur einem Team angehören</li>
      </ul>
      <BaseInput
        v-model="newTeamName"
        label="Teamname"
        :external-validation-result="nameIsAlreadyInUse"
        data-cy="team-input-team"
      />
      <hr />
      <!-- <BaseSelect
        v-model="selectedUser"
        label="Pilot ohne Team"
        :options="userNamesWithoutTeam"
        data-cy="team-select-member"
      /> -->
      <!-- <label for="team-select-member" class="form-label">Name</label> -->
      <input
        id="team-select-member"
        v-model="selectedUser"
        class="form-control mb-3"
        list="datalistOptions"
        placeholder="Pilot ohne Team suchen..."
        data-cy="team-select-member"
      />
      <datalist id="datalistOptions">
        <option v-for="user in userNamesWithoutTeam" :key="user" :value="user">
          {{ user }}
        </option>
      </datalist>
      <button
        class="mb-3 btn btn-primary btn"
        type="submit"
        :disabled="!selectedUser || teamIsCompleted"
        @click.prevent="onAddMember"
      >
        Mitglied hinzufügen
      </button>
      <ul class="list-group list-unstyled" data-cy="team-list-members">
        <li>
          <p>{{ submitterName }}</p>
        </li>
        <li v-for="member in newTeamMembers" :key="member">
          <p>
            <a href="#">
              <i class="bi bi-trash" @click="onRemoveMember(member)"></i
            ></a>

            {{ member }}
          </p>
        </li>
      </ul>
      <hr />
      <button
        class="mt-3 btn btn-primary btn"
        type="submit"
        :disabled="nameIsAlreadyInUse || !teamIsCompleted"
        @click.prevent="onSubmit"
      >
        Teammeldung absenden <BaseSpinner v-if="showSpinner" />
      </button>
    </div>
    <div
      v-if="loggedInUserIsAlreadyInATeam && !submitSuccessful"
      data-cy="team-submit-already-associated"
    >
      <p>
        Du bist bereits in einem Team angemeldet. Deshalb kannst du kein neues
        Team melden.
        <router-link
          :to="{
            name: 'ResultsTeams',
            params: { year: new Date().getFullYear() },
          }"
        >
          Hier
        </router-link>
        findest Du die aktuellen Teams mit all ihren Mitgliedern.
      </p>
    </div>
  </slot-dialog>
</template>

<script setup>
import { computed, ref } from "vue";
import useUser from "../composables/useUser";
import ApiService from "../services/ApiService";

const { authData, getUserId } = useUser();

const submitterName = authData.value.firstName + " " + authData.value.lastName;
const submitterId = getUserId.value;

const newTeamName = ref("");
const newTeamMembers = ref([]);
const selectedUser = ref("");

const teamNames = ref([]);
const userNamesWithoutTeam = ref([]);
const usersWithoutTeamData = ref([]);

const showSpinner = ref(false);
const submitSuccessful = ref(false);

try {
  const [teamNamesRes, usersWithoutTeamRes] = await Promise.all([
    ApiService.getTeamNames(),
    ApiService.getUserWithoutTeam(),
  ]);

  teamNames.value = teamNamesRes.data.map((t) => t.name);
  usersWithoutTeamData.value = usersWithoutTeamRes.data;
  userNamesWithoutTeam.value = usersWithoutTeamRes.data.map(
    (u) => u.firstName + " " + u.lastName
  );
  userNamesWithoutTeam.value = userNamesWithoutTeam.value.filter(
    (item) => item !== submitterName
  );
} catch (error) {
  console.error(error);
}

const onAddMember = () => {
  newTeamMembers.value.push(selectedUser.value);
  userNamesWithoutTeam.value = userNamesWithoutTeam.value.filter(
    (item) => item !== selectedUser.value
  );
  selectedUser.value = "";
};

const onRemoveMember = (member) => {
  newTeamMembers.value = newTeamMembers.value.filter((item) => item !== member);
  userNamesWithoutTeam.value.push(member);
};

const onSubmit = async () => {
  try {
    showSpinner.value = true;
    const res = await ApiService.addTeam({
      name: newTeamName.value,
      memberIds: retrieveIdsOfMembers(),
    });
    if (res.status != 200) throw res.statusText;
    submitSuccessful.value = true;
  } catch (error) {
    console.error(error);
  } finally {
    showSpinner.value = false;
  }
};

function retrieveIdsOfMembers() {
  const memberIds = newTeamMembers.value.map((memberFullname) => {
    const found = usersWithoutTeamData.value.find(
      (user) => user.firstName + " " + user.lastName == memberFullname
    );
    if (!found)
      return console.error("No ID found for member " + memberFullname);
    return found.id;
  });
  memberIds.push(submitterId);
  return memberIds;
}

const loggedInUserIsAlreadyInATeam = computed(() => {
  return !usersWithoutTeamData.value.filter((e) => e.id == submitterId).length;
});

const nameIsAlreadyInUse = computed(() => {
  return teamNames.value.includes(newTeamName.value);
});

const teamIsCompleted = computed(() => {
  return newTeamMembers.value.length == 4;
});
</script>

<style scoped></style>
