import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";

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
    component: () =>
      import(/* webpackChunkName: "flug-details" */ "../views/Flight.vue"),
  },
  // Route old links to the new url scheme
  {
    path: "/FlugDetails/:flightId",
    redirect: () => ({
      name: "Flight",
    }),
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
    meta: { toTop: true, smoothScroll: true },
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
    path: "/sandbox",
    name: "Sandbox",
    props: true,
    component: () => import(/* webpackChunkName: "" */ "../views/Sandbox.vue"),
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

export default router;
