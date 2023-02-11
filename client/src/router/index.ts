import { createRouter, createWebHistory } from "vue-router";
import { Routes } from "./routes";
import useAuth from "@/composables/useAuth";

interface Scroll {
  el?: string;
  top?: number;
  behavior?: "smooth";
}

const router = createRouter({
  history: createWebHistory(),
  routes: Routes,
  scrollBehavior(to) {
    const scroll: Scroll = {};

    if (to.hash) scroll.el = to.hash;
    if (to.meta.toTop) scroll.top = 0;
    if (to.meta.smoothScroll) scroll.behavior = "smooth";

    return scroll;
  },
});

const { loggedIn, hasElevatedRole } = useAuth();

router.beforeEach(async (to, from, next) => {
  // Always allow to go to home
  if (to.fullPath == "/") return next();

  // Redirect non elevated users (admins and mods) to home when they try to access protected views (e.g. AdminDashboard)
  if (to.meta.requiredElevated && !hasElevatedRole.value) return next("/");

  // If a route needs auth and there is no active token => login
  // A redirect query is added. The calling component itself decides wether to use it or not
  if (!loggedIn.value && to.meta.requiredAuth) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }
  // In all other cases just go on to not freeze routing. Just pray.
  return next();
});

export default router;
