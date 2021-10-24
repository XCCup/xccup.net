<template>
  <section class="container">
    <h3>Flugeigenschaften</h3>
    <div class="row">
      <div class="col-md-6 col-12 my-1">
        <table class="table table-sm">
          <thead></thead>
          <tbody>
            <tr>
              <th>Pilot:</th>
              <td>
                <a href="#">{{
                  flight.User.firstName + " " + flight.User.lastName
                }}</a>
              </td>
            </tr>
            <tr>
              <th>Verein:</th>
              <td>
                <a href="#">{{ flight.Club.name }}</a>
              </td>
            </tr>
            <tr>
              <th>Team:</th>
              <td>
                <a href="#">{{ flight.Team?.name }}</a>
              </td>
            </tr>
            <tr>
              <th>Fluggerät:</th>
              <td>{{ flight.glider.brand }} {{ flight.glider.model }}</td>
            </tr>
            <tr>
              <th>Geräteklasse:</th>
              <td>
                <RankingClass :rankingClass="flight.glider.gliderClass" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="col-md-6 col-12 my-1">
        <table class="table table-sm">
          <thead></thead>
          <tbody>
            <tr>
              <th>Flugzeit:</th>
              <td>
                {{ calcFlightDuration(flight) }}
              </td>
            </tr>
            <tr>
              <th>Strecke:</th>
              <td>
                {{ flight.flightDistance.toFixed(2) }} km
                <FlightType :flightType="flight.flightType" />
              </td>
            </tr>
            <tr>
              <th>Punkte:</th>
              <td>{{ flight.flightPoints }}</td>
            </tr>

            <tr>
              <th>Startplatz:</th>
              <td>{{ flight.takeoff.name }} {{ flight.takeoff.direction }}</td>
            </tr>
            <tr>
              <th>Uhrzeit:</th>
              <td v-if="true">
                <i class="bi bi-arrow-up"></i>
                {{ getTakeoffTime(flight) }}
                Uhr <i class="bi bi-arrow-down"></i>
                {{ getlandingTime(flight) }}
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
    <a v-bind:href="flight.igcUrl"
      ><button type="button" class="btn btn-sm btn-outline-primary">
        <i class="bi bi-cloud-download"></i> .igc
      </button></a
    >

    <router-link :to="{ name: 'EditFlight' }">
      <button v-if="showEditButton" class="btn btn-primary btn-sm ms-2">
        <i class="bi bi-pencil-square mx-1"></i>Flug bearbeiten
      </button>
    </router-link>

    <div class="collapse" id="collapseExample">
      <div class="row">
        <div class="col-md-6 col-12">
          <table class="table table-sm">
            <thead></thead>
            <tbody>
              <tr>
                <th>Flugstatus:</th>
                <td>{{ flight.flightStatus }}</td>
              </tr>
              <tr>
                <th>Höhe min/max (GPS):</th>
                <td>
                  {{ flight.flightStats.minHeightGps }}m /
                  {{ flight.flightStats.maxHeightGps }}m
                </td>
              </tr>
              <tr>
                <th>Steigen min/max:</th>
                <td>
                  {{ flight.flightStats.maxSink }} m/s /
                  {{ flight.flightStats.maxClimb }} m/s
                </td>
              </tr>
              <tr>
                <th>Geschwindigkeit max:</th>
                <td>{{ flight.flightStats.maxSpeed }} km/h</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="col-md-6 col-12">
          <table class="table table-sm">
            <thead></thead>
            <tbody>
              <tr>
                <th>Landeplatz:</th>
                <td>{{ flight.landing }}</td>
              </tr>
              <tr>
                <th>Ø Geschwindigkeit:</th>
                <td></td>
                <!-- 38,0km/h -->
              </tr>
              <tr>
                <th>Aufgaben-Geschwindigkeit:</th>
                <td>{{ flight.flightStats.taskSpeed }} km/h</td>
              </tr>
              <tr>
                <th>Eingereicht am:</th>
                <td>
                  <BaseDate
                    :timestamp="flight.createdAt"
                    dateFormat="dd.MM.yyyy HH:mm"
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

<script>
import { mapGetters } from "vuex";

import { format } from "date-fns";
import RankingClass from "@/components/RankingClass";
import FlightType from "@/components/FlightType";
export default {
  name: "FlightDetails",
  components: {
    RankingClass,
    FlightType,
  },
  data() {
    return {
      format,
    };
  },
  props: {
    flight: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getlandingTime(flight) {
      if (!flight.fixes) return "";

      return format(
        new Date(flight.fixes[flight.fixes.length - 1].timestamp),
        "HH:mm"
      );
    },
    getTakeoffTime(flight) {
      if (!flight.fixes) return "";
      return format(new Date(flight.fixes[0].timestamp), "HH:mm");
    },
    calcFlightDuration(flight) {
      if (!flight.fixes) return "";
      let ms =
        flight.fixes[flight.fixes.length - 1].timestamp -
        flight.fixes[0].timestamp;

      var seconds = parseInt((ms / 1000) % 60),
        minutes = parseInt((ms / (1000 * 60)) % 60),
        hours = parseInt((ms / (1000 * 60 * 60)) % 24);

      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      return hours + ":" + minutes + "h";
    },
  },
  computed: {
    ...mapGetters(["getUserId", "getLoginStatus", "isTokenActive"]),

    showEditButton() {
      return this.flight.userId === this.getUserId;
    },
  },
};
</script>

<style scoped></style>
