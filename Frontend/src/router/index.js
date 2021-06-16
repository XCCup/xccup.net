import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/Home.vue";
import Flight from "@/views/Flight.vue";
import NotFound from "@/components/NotFound.vue";
import NetworkError from "@/components/NetworkError.vue";
import store from "@/store/index";
import axios from "axios";

const routes = [
  {
    path: "/",
    name: "Home",
    meta: { requiredAuth: false },
    component: Home,
  },
  {
    path: "/flug/:flightId",
    name: "Flight",
    props: true,
    meta: { requiredAuth: false },
    component: Flight,
  },
  {
    path: "/fluege/",
    name: "Flights",
    meta: { requiredAuth: false },
    component: () => import(/* webpackChunkName: "" */ "../views/Flights.vue"),
  },
  {
    path: "/upload",
    name: "UploadFlight",
    props: true,
    meta: { requiredAuth: true },

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
    meta: { requiredAuth: true },

    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "" */ "../views/Profile.vue"),
  },
  {
    path: "/sandbox/:flightId",
    name: "Sandbox",
    props: true,
    meta: { requiredAuth: false },
    component: () => import(/* webpackChunkName: "" */ "../views/Sandbox.vue"),
  },
  {
    path: "/login/",
    name: "Login",
    meta: { requiredAuth: false },
    component: () => import(/* webpackChunkName: "" */ "../views/Login.vue"),
  },
  {
    path: "/:catchAll(.*)",
    name: "NotFound",
    meta: { requiredAuth: false },
    component: NotFound,
  },
  {
    path: "/404/:resource",
    name: "404Resource",
    component: NotFound,
    meta: { requiredAuth: false },
    props: true,
  },
  {
    path: "/network-error",
    name: "NetworkError",
    meta: { requiredAuth: false },
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

router.beforeEach(async (to, from, next) => {
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
  let auth = store.getters["auth/isTokenActive"];

  if (!auth) {
    const authData = store.getters["auth/getAuthData"];
    if (authData.token) {
      const payload = {
        token: authData.refreshToken,
      };
      try {
        const refreshResponse = await axios.post(
          "http://localhost:3000/users/token",
          payload
        );
        store.commit("auth/saveTokenData", {
          accessToken: refreshResponse.data.accessToken,
          refreshToken: authData.refreshToken,
        });
        auth = true;
        store.commit("auth/setLoginStatus", "success");
      } catch (error) {
        store.dispatch("auth/logout");
        console.log(error);
      }
    }
  } else {
    store.commit("auth/setLoginStatus", "success");
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
