<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-primary bg-gradient">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">
        <img src="../assets/images/xccup_white.svg" alt="XCCup" height="50" />
      </a>
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarSupportedContent"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarSupportedContent">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
              Ergebnisse
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Eingereichte Flüge</a></li>
              <li><a class="dropdown-item" href="#">Gesamtliste</a></li>
              <li><a class="dropdown-item" href="#">Gerätewertung</a></li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li><a class="dropdown-item" href="#">…</a></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a
              class="nav-link dropdown-toggle"
              href="#"
              id="navbarDropdown"
              role="button"
              data-bs-toggle="dropdown"
            >
              Listen
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="#">Sponsoren</a></li>
              <li><a class="dropdown-item" href="#">Vereine</a></li>
              <li>
                <a class="dropdown-item" href="#">Registrierte Piloten</a>
              </li>
              <li><a class="dropdown-item" href="#">Teams 2021</a></li>
            </ul>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link active" href="#">Kontakt / Impressum</a>
          </li>
          <li class="nav-item dropdown">
            <a class="nav-link active" href="#">Datenschutz</a>
          </li>
        </ul>
        <!-- Login dropdown  -->
        <div class="dropdown">
          <button
            type="button"
            class="btn btn-outline-light btn-sm m-1 dropdown-toggle"
            id="dropdownMenuButton1"
            data-bs-toggle="dropdown"
          >
            <i class="bi bi-person"></i>
            {{ authUser.name }}
          </button>
          <div class="dropdown-menu" style="width: 250px">
            <form class="px-4 py-3">
              <div class="mb-3">
                <h6 class="fst-italic">
                  Führt angemeldete Nutzer direkt zu ihrem
                  <router-link :to="{ name: 'Profile' }"> Profil</router-link>
                </h6>
                <!-- <label for="exampleDropdownFormEmail1" class="form-label">E-Mail</label> -->
                <input
                  type="email"
                  class="form-control"
                  id="exampleDropdownFormEmail1"
                  placeholder="E-Mail"
                />
              </div>
              <div class="mb-3">
                <!-- <label for="exampleDropdownFormPassword1" class="form-label">Passwort</label> -->
                <input
                  type="password"
                  class="form-control"
                  id="exampleDropdownFormPassword1"
                  placeholder="Passwort"
                />
              </div>
              <div class="mb-3">
                <div class="form-check">
                  <input
                    type="checkbox"
                    class="form-check-input"
                    id="dropdownCheck"
                  />
                  <label class="form-check-label" for="dropdownCheck">
                    Angemeldet bleiben
                  </label>
                </div>
              </div>
              <button type="submit" class="btn btn-primary">Anmelden</button>
            </form>
            <div class="dropdown-divider"></div>
            <a class="dropdown-item" href="#">Registrieren</a>
            <a class="dropdown-item" href="#">Password vergessen?</a>
          </div>
        </div>
        <router-link
          class="btn btn-danger btn-sm m-1"
          :to="{ name: 'UploadFlight' }"
          >Flug hochladen
        </router-link>
      </div>
    </div>
  </nav>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "TheNavbar",
  computed: {
    ...mapGetters(["authUser"]),
  },
};
</script>

<style scoped></style>
