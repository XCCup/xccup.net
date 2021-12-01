import HomeView from "@/views/HomeView.vue";
import FlightView from "@/views/FlightView.vue";
import NotFound from "@/components/NotFound.vue";
import NetworkError from "@/components/NetworkError.vue";
import UserLogin from "@/views/UserLogin.vue";

const validateRouteParamYear = (to, from, next) => {
  if (isNaN(Number(to.params.year))) {
    return next({
      name: "404Resource",
      params: { resource: "Dies ist kein gültiges Jahr" },
    });
  }
  next();
};

const validateRouteParamFlightId = (to, from, next) => {
  if (isNaN(Number(to.params.flightId))) {
    return next({
      name: "404Resource",
      params: { resource: "Dies ist keine gültige Flugnummer" },
    });
  }
  next();
};

export const Routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/flug/:flightId",
    name: "Flight",
    // props: true,
    beforeEnter: validateRouteParamFlightId,
    meta: { toTop: true },
    component: FlightView,
  },
  {
    path: "/:year/fluege/",
    name: "FlightsAllYear",
    props: true,
    beforeEnter: validateRouteParamYear,
    meta: { toTop: true },
    component: () => import("../views/FlightsAll.vue"),
  },
  {
    path: "/fluege/",
    name: "FlightsAll",
    props: true,
    meta: { toTop: true },
    component: () => import("../views/FlightsAll.vue"),
  },
  {
    path: "/:year/einzelwertung/",
    name: "ResultsOverall",
    props: (route) => ({ category: "overall", year: route.params.year }),
    beforeEnter: validateRouteParamYear,
    component: () => import("../views/ResultsView.vue"),
  },
  {
    path: "/:year/newcomer/",
    name: "ResultsNewcomer",
    props: (route) => ({ category: "newcomer", year: route.params.year }),
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsView.vue"),
  },
  {
    path: "/:year/seniorenwertung/",
    name: "ResultsSeniors",
    props: (route) => ({ category: "seniors", year: route.params.year }),
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsView.vue"),
  },
  {
    path: "/:year/damenwertung/",
    name: "ResultsLadies",
    props: (route) => ({ category: "ladies", year: route.params.year }),
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsView.vue"),
  },
  {
    path: "/:year/lux-championat/",
    name: "ResultsLux",
    props: (route) => ({ category: "lux-state", year: route.params.year }),
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsView.vue"),
  },
  {
    path: "/:year/rlp-meisterschaft/",
    name: "ResultsRlp",
    props: (route) => ({ category: "rlp-state", year: route.params.year }),
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsView.vue"),
  },
  {
    path: "/:year/teamwertung/",
    name: "ResultsTeams",
    props: true,
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsTeams.vue"),
  },
  {
    path: "/:year/vereinswertung/",
    name: "ResultsClubs",
    props: true,
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsClubs.vue"),
  },
  {
    path: "/fluggebietsrekorde/",
    name: "SiteRecords",
    props: true,

    component: () => import("../views/ResultsSiteRecords.vue"),
  },
  {
    path: "/upload",
    name: "FlightUpload",
    props: true,
    meta: { requiredAuth: true },
    component: () => import("../views/FlightUpload.vue"),
  },
  {
    path: "/flug/:id/bearbeiten",
    name: "FlightEdit",
    props: true,
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
    component: () => import("../views/FlightEdit.vue"),
  },
  {
    path: "/profil",
    name: "Profile",
    props: true,
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
    component: () => import("../views/UserProfile.vue"),
  },
  {
    path: "/profil/bearbeiten",
    name: "ProfileEdit",
    props: { edit: true },
    meta: { requiredAuth: true },

    component: () => import("../views/UserProfile.vue"),
  },
  {
    path: "/profil/hangar",
    name: "ProfileHangar",
    props: { showHangar: true },
    meta: { requiredAuth: true },

    component: () => import("../views/UserProfile.vue"),
  },
  {
    path: "/login/",
    name: "Login",
    component: UserLogin,
  },
  {
    path: "/registrieren/",
    name: "Register",
    component: () => import("../views/UserRegister.vue"),
  },
  {
    path: "/sponsoren",
    name: "Sponsors",
    component: () => import("../views/ListSponsors.vue"),
  },
  {
    path: "/vereine",
    name: "Clubs",
    component: () => import("../views/ListClubs.vue"),
  },
  {
    path: "/piloten",
    name: "Users",
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
    component: () => import("../views/ListUsers.vue"),
  },
  {
    path: "/impressum",
    name: "Imprint",
    component: () => import("../views/ImprintView.vue"),
  },
  {
    path: "/datenschutz",
    name: "Privacy",
    component: () => import("../views/PrivacyView.vue"),
  },
  {
    path: "/admin",
    name: "AdminDashboard",
    //TODO: Check if logged-in user is a moderator or admin
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
    component: () => import("../views/AdminDashboard.vue"),
  },
  {
    path: "/profil/aktivieren",
    name: "UserActivate",
    component: () => import("../views/UserActivate.vue"),
  },
  {
    path: "/passwort-vergessen/",
    name: "PasswordLost",
    props: (route) => ({ confirm: route.query.confirm }),
    component: () => import("../views/UserPasswordLost.vue"),
  },
  {
    path: "/email-bestaetigen/",
    name: "ConfirmMail",
    props: (route) => ({ confirm: route.query.confirm }),
    component: () => import("../views/UserConfirmMail.vue"),
  },
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: NotFound,
  },
  {
    path: "/404/",
    name: "404Resource",
    component: NotFound,
    props: true,
  },
  {
    path: "/network-error",
    name: "NetworkError",
    component: NetworkError,
  },
];
