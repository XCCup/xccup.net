import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Flight from "@/views/Flight.vue";
import NotFound from "@/components/NotFound.vue";
import NetworkError from "@/components/NetworkError.vue";
import useUser from "@/composables/useUser";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/flug/:flightId",
    name: "Flight",
    props: true,
    beforeEnter: validateRouteParamFlightId,
    meta: { toTop: true },
    component: Flight,
  },
  {
    path: "/:year/fluege/",
    name: "FlightsAll",
    props: true,
    beforeEnter: validateRouteParamYear,
    meta: { toTop: true },

    component: () =>
      import(/* webpackChunkName: "" */ "../views/FlightsAll.vue"),
  },
  {
    path: "/:year/einzelwertung/",
    name: "ResultsOverall",
    props: (route) => ({ category: "overall", year: route.params.year }),
    beforeEnter: validateRouteParamYear,

    component: () => import(/* webpackChunkName: "" */ "../views/Results.vue"),
  },
  {
    path: "/:year/newcomer/",
    name: "ResultsNewcomer",
    props: (route) => ({ category: "newcomer", year: route.params.year }),
    beforeEnter: validateRouteParamYear,

    component: () => import(/* webpackChunkName: "" */ "../views/Results.vue"),
  },
  {
    path: "/:year/seniorenwertung/",
    name: "ResultsSeniors",
    props: (route) => ({ category: "seniors", year: route.params.year }),
    beforeEnter: validateRouteParamYear,

    component: () => import(/* webpackChunkName: "" */ "../views/Results.vue"),
  },
  {
    path: "/:year/damenwertung/",
    name: "ResultsLadies",
    props: (route) => ({ category: "ladies", year: route.params.year }),
    beforeEnter: validateRouteParamYear,

    component: () => import(/* webpackChunkName: "" */ "../views/Results.vue"),
  },
  {
    path: "/:year/teamwertung/",
    name: "ResultsTeams",
    props: true,
    beforeEnter: validateRouteParamYear,

    component: () =>
      import(/* webpackChunkName: "" */ "../views/ResultsTeams.vue"),
  },
  {
    path: "/:year/vereinswertung/",
    name: "ResultsClubs",
    props: true,
    beforeEnter: validateRouteParamYear,

    component: () =>
      import(/* webpackChunkName: "" */ "../views/ResultsClubs.vue"),
  },
  {
    path: "/upload",
    name: "FlightUpload",
    props: true,
    meta: { requiredAuth: true },

    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "" */ "../views/FlightUpload.vue"),
  },
  {
    path: "/flug-bearbeiten",
    name: "FlightEdit",
    // props: true,
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
    component: () =>
      import(/* webpackChunkName: "" */ "../views/FlightEdit.vue"),
  },
  {
    path: "/profil",
    name: "Profile",
    props: true,
    meta: { toTop: true, smoothScroll: true, requiredAuth: true },
    component: () => import(/* webpackChunkName: "" */ "../views/Profile.vue"),
  },
  {
    path: "/profil/bearbeiten",
    name: "ProfileEdit",
    props: { edit: true },
    meta: { requiredAuth: true },

    component: () => import(/* webpackChunkName: "" */ "../views/Profile.vue"),
  },
  {
    path: "/sandbox/:flightId",
    name: "Sandbox",
    props: true,
    component: () => import(/* webpackChunkName: "" */ "../views/Sandbox.vue"),
  },
  {
    path: "/login/",
    name: "Login",
    component: () => import(/* webpackChunkName: "" */ "../views/Login.vue"),
  },
  {
    path: "/impressum",
    name: "Imprint",
    component: () => import(/* webpackChunkName: "" */ "../views/Imprint.vue"),
  },
  {
    path: "/datenschutz",
    name: "Privacy",
    component: () => import(/* webpackChunkName: "" */ "../views/Privacy.vue"),
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

// function castRouteParamId(route) {
//   return {
//     id: Number(route.params.id),
//   };
// }

function validateRouteParamYear(to, from, next) {
  if (isNaN(Number(to.params.year))) {
    return next({
      name: "404Resource",
      params: { resource: "Dies ist kein gültiges Jahr" },
    });
  }
  next();
}

function validateRouteParamFlightId(to, from, next) {
  if (isNaN(Number(to.params.flightId))) {
    return next({
      name: "404Resource",
      params: { resource: "Dies ist keine gültige Flugnummer" },
    });
  }
  next();
}

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
  scrollBehavior(to) {
    const scroll = {};
    if (to.meta.toTop) scroll.top = 0;
    if (to.meta.smoothScroll) scroll.behavior = "smooth";
    return scroll;
  },
});

const { saveTokenData, isTokenActive, setLoginStatus, refresh, authData } =
  useUser();

router.beforeEach(async (to, from, next) => {
  if (!authData.value.token) {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (accessToken) {
      const data = {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      saveTokenData(data);
    }
  }
  let auth = isTokenActive.value;

  if (!auth) {
    auth = await refresh();
  } else {
    setLoginStatus("success");
  }

  if (to.fullPath == "/") {
    return next();
  } else if (auth && !to.meta.requiredAuth) {
    // TODO: Redirect after login?
    // return next({ path: "/profil" });
    return next();
  } else if (!auth && to.meta.requiredAuth) {
    return next({ path: "/login" });
  }

  return next();
});
export default router;
