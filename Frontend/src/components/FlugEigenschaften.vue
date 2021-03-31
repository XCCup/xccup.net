<template>
  <section class="flug-eigenschaften container">
    <h3>Flugeigenschaften</h3>
    <div class="row">
      <div class="col-md-6 col-12 my-1">
        <table class="table table-sm">
          <thead></thead>
          <tbody>
            <tr>
              <th>Pilot:</th>
              <td>
                <a href="#">{{ flight.pilot }}</a>
              </td>
            </tr>
            <tr>
              <th>Verein:</th>
              <td>
                <a href="#">{{ pilot.club }}</a>
              </td>
            </tr>
            <tr>
              <th>Team:</th>
              <td>
                <a href="#">{{ pilot.team }}</a>
              </td>
            </tr>
            <tr>
              <th>Fluggerät:</th>
              <td>{{ flight.gliderType }}</td>
            </tr>
            <tr>
              <th>Geräteklasse:</th>
              <td>
                <i class="bi bi-trophy gs-performance"></i> GS Performance low
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Backup 
           <tr>
                  <th>Flugstatus:</th>
                  <td>😃 (In Wertung)</td>
                </tr>
          -->
      </div>
      <div class="col-md-6 col-12 my-1">
        <table class="table table-sm">
          <thead></thead>
          <tbody>
            <tr>
              <th>Flugzeit:</th>
              <td>{{ flight.flightDuration }}</td>
            </tr>
            <tr>
              <th>Strecke:</th>
              <td>{{ flight.distance }} km <i class="bi bi-triangle"></i></td>
            </tr>
            <tr>
              <th>Punkte:</th>
              <td>{{ flight.points }}</td>
            </tr>

            <tr>
              <th>Startplatz:</th>
              <td>{{ flight.takeoff }}</td>
            </tr>
            <tr>
              <th>Uhrzeit:</th>
              <td>
                <i class="bi bi-arrow-up"></i> {{ flight.takeoffTime }} Uhr
                <i class="bi bi-arrow-down"></i> {{ flight.landingTime }} Uhr
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Details -->
    <button
      class="btn btn-primary btn-sm dropdown-toggle"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#collapseExample"
      aria-expanded="false"
      aria-controls="collapseExample"
    >
      Details anzeigen
    </button>
    <button type="button" class="btn btn-sm btn-outline-primary">
      <i class="bi bi-cloud-download"></i> .igc
    </button>
    <div class="collapse" id="collapseExample">
      <div class="row">
        <div class="col-md-6 col-12">
          <table class="table table-sm">
            <thead></thead>
            <tbody>
              <tr>
                <th>Flugstatus:</th>
                <td>😃 (In Wertung)</td>
              </tr>
              <tr>
                <th>Höhe min/max (GPS):</th>
                <td>359m / 2665m</td>
              </tr>
              <tr>
                <th>Steigen min/max:</th>
                <td>-10,0m/s / 7,0m/s</td>
              </tr>
              <tr>
                <th>Geschwindigkeit max:</th>
                <td>124,0km/h</td>
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
                <td>Bremm - DE[~1,29km]</td>
              </tr>
              <tr>
                <th>Ø Geschwindigkeit:</th>
                <td>38,0km/h</td>
              </tr>
              <tr>
                <th>Aufgaben-Geschwindigkeit:</th>
                <td>16,9km/h</td>
              </tr>
              <tr>
                <th>Eingereicht am:</th>
                <td>23.07.2020 18:50:23</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: "FlugEigenschaften",
  props: {
    flight: {
      type: Object,
      required: true,
    },
    pilot: {
      type: Object,
      required: true,
    },
  },
};
</script>

<style scoped></style>
