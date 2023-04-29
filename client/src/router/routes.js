import NotFound from "@/components/NotFound.vue";
import NetworkError from "@/components/NetworkError.vue";

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

    component: () => import("../views/Home.vue"),
  },
  {
    path: "/flug/:flightId",
    alias: ["/FlugDetails/:flightId"],
    name: "Flight",
    beforeEnter: validateRouteParamFlightId,
    meta: { toTop: true },
    component: () => import("../views/FlightView.vue"),
  },
  {
    path: "/flug/:id/bearbeiten",
    name: "FlightEdit",
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
    component: () => import("../views/FlightEdit.vue"),
  },
  {
    path: "/:year?/fluege/",
    name: "FlightsAll",
    meta: { toTop: true },
    component: () => import("../views/FlightsAll.vue"),
  },
  {
    path: "/:year/einzelwertung/",
    name: "ResultsOverall",
    beforeEnter: validateRouteParamYear,
    component: () => import("../views/ResultsOverall.vue"),
  },
  {
    path: "/:year/newcomer/",
    name: "ResultsNewcomer",
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsNewcomer.vue"),
  },
  {
    path: "/:year/seniorenwertung/",
    name: "ResultsSeniors",
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsSeniors.vue"),
  },
  {
    path: "/:year/klassenwertung/",
    name: "ResultsClasses",
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsClasses.vue"),
  },
  {
    path: "/:year/damenwertung/",
    name: "ResultsLadies",
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsLadies.vue"),
  },
  {
    path: "/:year/leichtgewichtswertung/",
    name: "ResultsReynoldsClass",
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsReynoldsClass.vue"),
  },
  {
    path: "/:year/lux-championat/",
    name: "ResultsLux",
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsLux.vue"),
  },
  {
    path: "/:year/rlp-pokal/",
    name: "ResultsRlp",
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsRlp.vue"),
  },
  {
    path: "/:year/hes-pokal/",
    name: "ResultsHes",
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsHes.vue"),
  },
  {
    path: "/:year/teamwertung/",
    name: "ResultsTeams",
    beforeEnter: validateRouteParamYear,

    component: () => import("../views/ResultsTeams.vue"),
  },
  {
    path: "/:year/vereinswertung/",
    name: "ResultsClubs",
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
    path: "/profil",
    name: "Profile",
    props: true,
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
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
    component: () => import("@/views/UserLogin.vue"),
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
    path: "/ausschreibung",
    name: "Rules",
    meta: { smoothScroll: true },
    component: () => import("../views/ListRules.vue"),
  },
  {
    path: "/info-luftraeume",
    name: "InfoAirspaces",
    meta: { smoothScroll: true },
    component: () => import("../views/InfoAirspaces.vue"),
  },
  {
    path: "/info-upload",
    name: "InfoAutoUpload",
    meta: { smoothScroll: true },
    component: () => import("../views/InfoAutoUpload.vue"),
  },
  {
    path: "/vereine",
    name: "Clubs",
    component: () => import("../views/ListClubs.vue"),
  },
  {
    path: "/news",
    name: "News",
    component: () => import("../views/ListNews.vue"),
  },
  {
    path: "/der-neue-xccup",
    name: "NewXccup",
    component: () => import("../views/ListNewXccup.vue"),
  },
  {
    path: "/piloten",
    name: "ListUsers",
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
    component: () => import("../views/ListUsers.vue"),
  },
  {
    path: "/teammeldung",
    name: "SubmitTeam",
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
    component: () => import("../views/SubmitTeam.vue"),
  },
  {
    path: "/fluggebietsmeldung",
    name: "SubmitFlyingSite",
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
    component: () => import("../views/SubmitFlyingSite.vue"),
  },
  {
    path: "/fluggebiete",
    name: "FlyingSites",
    meta: { toTop: true, smoothScroll: true },
    component: () => import("../views/ListFlyingSites.vue"),
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
    meta: {
      toTop: true,
      smoothScroll: true,
      requiredAuth: true,
      requiredElevated: true,
    },
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
    path: "/sandbox/:flightId",
    name: "Sandbox",
    beforeEnter: validateRouteParamFlightId,
    meta: { toTop: true },
    component: () => import("../views/TheSandbox.vue"),
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
