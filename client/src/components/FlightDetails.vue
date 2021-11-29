<template>
  <section id="flight-details" class="container">
    <h3>Flugeigenschaften</h3>
    <div class="row">
      <div class="col-md-6 col-12 my-1">
        <table id="cyFlightDetailsTable1" class="table table-sm">
          <tbody>
            <tr>
              <th>Pilot</th>
              <td>
                <router-link
                  :to="{
                    name: 'FlightsAll',
                    query: { userId: flight.user.id },
                  }"
                >
                  {{ flight.user.firstName + " " + flight.user.lastName }}
                </router-link>
              </td>
            </tr>
            <tr>
              <th>Verein</th>
              <td>
                <router-link
                  :to="{
                    name: 'FlightsAll',
                    query: { clubId: flight.club.id },
                  }"
                >
                  <div>
                    {{ flight.club.name }}
                  </div>
                </router-link>
              </td>
            </tr>
            <tr>
              <th>Team</th>
              <td>
                <router-link
                  :to="{
                    name: 'FlightsAll',
                    query: { teamId: flight.team?.id },
                  }"
                >
                  <div>
                    {{ flight.team?.name }}
                  </div>
                </router-link>
              </td>
            </tr>
            <tr>
              <th>Fluggerät</th>
              <td>{{ flight.glider.brand }} {{ flight.glider.model }}</td>
            </tr>
            <tr>
              <th>Geräteklasse</th>
              <td>
                <RankingClass
                  :ranking-class="flight.glider.gliderClass"
                  :short="true"
                  :show-description="true"
                />
              </td>
            </tr>
            <tr>
              <th>Hike & Fly</th>
              <td>
                <div v-if="isHikeAndFly">
                  <i class="bi bi-signpost-2 me-1"></i>{{ flight.hikeAndFly }}m
                  Höhenunterschied
                </div>
                <div v-else>-</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="col-md-6 col-12 my-1">
        <table id="cyFlightDetailsTable2" class="table table-sm">
          <tbody>
            <tr>
              <th>Flugzeit</th>
              <td>
                {{ calcFlightDuration(flight.airtime) }}
              </td>
            </tr>
            <tr>
              <th>Strecke</th>
              <td>
                {{ flight.flightDistance?.toFixed(2) ?? "?" }} km
                <FlightTypeIcon :flight-type="flight.flightType" />
              </td>
            </tr>
            <tr>
              <th>Punkte</th>
              <td>{{ flight.flightPoints }}</td>
            </tr>

            <tr>
              <th>Startplatz</th>
              <td>{{ flight.takeoff.name }} {{ flight.takeoff.direction }}</td>
            </tr>
            <tr>
              <th>Uhrzeit</th>
              <td v-if="true">
                <i class="bi bi-arrow-up"></i>
                <BaseDate :timestamp="flight.takeoffTime" date-format="HH:mm" />
                Uhr <i class="bi bi-arrow-down"></i>
                <BaseDate :timestamp="flight.landingTime" date-format="HH:mm" />
                Uhr
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Details -->
    <button
      class="btn btn-primary btn-sm me-2 dropdown-toggle"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#collapseExample"
    >
      Details anzeigen
    </button>
    <a :href="igcDownloadUrl"
      ><button type="button" class="btn btn-sm btn-outline-primary">
        <i class="bi bi-cloud-download"></i> .igc
      </button></a
    >

    <router-link
      :to="{ name: 'FlightEdit', params: { id: flight.externalId } }"
    >
      <button v-if="showEditButton" class="btn btn-outline-primary btn-sm ms-2">
        <i class="bi bi-pencil-square mx-1"></i>Flug bearbeiten
      </button>
    </router-link>
    <div id="collapseExample" class="collapse mt-2">
      <div class="row">
        <div class="col-md-6 col-12">
          <table class="table table-sm">
            <tbody>
              <tr>
                <th>Flugstatus</th>
                <td>
                  {{ flight.flightStatus }}
                  <FlightState :flight-state="flight.flightStatus" />
                </td>
              </tr>
              <tr>
                <th>Höhe min/max (GPS)</th>
                <td>
                  {{ flight.flightStats.minHeightGps }}m /
                  {{ flight.flightStats.maxHeightGps }}m
                </td>
              </tr>
              <tr>
                <th>Max. Steigen</th>
                <td>{{ flight.flightStats.maxClimb }} m/s</td>
              </tr>
              <tr>
                <th>Max. Sinken</th>
                <td>{{ flight.flightStats.maxSink }} m/s</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-md-6 col-12">
          <table class="table table-sm">
            <tbody>
              <tr>
                <th>Landeplatz</th>
                <td>{{ flight.landing }}</td>
              </tr>
              <tr>
                <th>Geschwindigkeit max</th>
                <td>{{ Math.floor(flight.flightStats.maxSpeed) }} km/h</td>
              </tr>
              <tr>
                <th>Aufgaben-Geschwindigkeit</th>
                <td>{{ flight.flightStats.taskSpeed ?? "?" }} km/h</td>
              </tr>
              <tr>
                <th>Eingereicht am</th>
                <td>
                  <BaseDate
                    :timestamp="flight.createdAt"
                    date-format="dd.MM.yyyy HH:mm"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";
import useUser from "@/composables/useUser";
import useFlight from "@/composables/useFlight";
import { getbaseURL } from "@/helper/baseUrlHelper";

const { getUserId } = useUser();
const { flight } = useFlight();

const showEditButton = computed(() => flight.value.userId === getUserId.value);

const igcDownloadUrl = computed(() => {
  const baseURL = getbaseURL();
  return baseURL + "flights/igc/" + flight.value.id;
});

const calcFlightDuration = (duration) => {
  if (!duration) return "";
  const ms = duration * 60 * 1000;
  // let seconds = parseInt((ms / 1000) % 60);
  let minutes = parseInt((ms / (1000 * 60)) % 60);
  let hours = parseInt((ms / (1000 * 60 * 60)) % 24);
  minutes = minutes < 10 ? "0" + minutes : minutes;
  // seconds = seconds < 10 ? "0" + seconds : seconds;
  return hours + ":" + minutes + "h";
};
const isHikeAndFly = computed(() => flight.value.hikeAndFly > 0);
</script>

<style scoped></style>
