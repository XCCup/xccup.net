import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Flight from "@/views/Flight.vue";
import NotFound from "@/components/NotFound.vue";
import NetworkError from "@/components/NetworkError.vue";
import store from "@/store/index";

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
    component: Flight,
  },
  {
    path: "/fluege/",
    name: "Flights",
    component: () => import(/* webpackChunkName: "" */ "../views/Flights.vue"),
  },
  {
    path: "/upload",
    name: "UploadFlight",
    props: true,
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "" */ "../views/UploadFlight.vue"),
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
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
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
    path: "/:catchAll(.*)",
    name: "NotFound",
    component: NotFound,
  },
  {
    path: "/404/:resource",
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

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
  scrollBehavior(to) {
    const scroll = {};
    if (to.meta.toTop) scroll.top = 0;
    if (to.meta.smoothScroll) scroll.behavior = "smooth";
    return scroll;
  },
});

router.beforeEach((to, from, next) => {
  console.log(store.getters["auth/getAuthData"].token);
  if (!store.getters["auth/getAuthData"].token) {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    if (accessToken) {
      const data = {
        accessToken: accessToken,
        refreshToken: refreshToken,
      };
      store.commit("auth/saveTokenData", data);
    }
  }
  const auth = store.getters["auth/isTokenActive"];

  if (to.fullPath == "/") {
    return next();
  } else if (auth && !to.meta.requiredAuth) {
    return next({ path: "/profil" });
  } else if (!auth && to.meta.requiredAuth) {
    return next({ path: "/login" });
  }

  return next();
});
export default router;
