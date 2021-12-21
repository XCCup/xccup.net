import { createRouter, createWebHistory } from "vue-router";
import useUser from "@/composables/useUser";
import { Routes } from "./routes";

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes: Routes,
  scrollBehavior(to) {
    const scroll = {};

    if (to.meta.toTop) scroll.top = 0;
    if (to.meta.smoothScroll) scroll.behavior = "smooth";

    return scroll;
  },
});

const {
  saveTokenData,
  isTokenActive,
  updateTokens,
  authData,
  hasElevatedRole,
} = useUser();

router.beforeEach(async (to, from, next) => {
  // It would be possible to check for a non guarded route first and skip all auth methods
  // The downside would be that the token is not observed regularly.

  // If no token is present in state check if there is token information in local storage
  // TODO: Make this a method of useUser or leave it here?
  if (!authData.value.token) {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    // If there was token information in local storage => update state
    if (accessToken && refreshToken)
      saveTokenData({ accessToken, refreshToken });
  }
  // Refresh if token is expired and refresh token existent
  if (!isTokenActive() && authData.value.refreshToken) await updateTokens();

  // Always allow to go to home
  if (to.fullPath == "/") return next();

  // Redirect non elevated users (admins and mods) to home when they try to access protected views (e.g. AdminDashboard)
  if (to.meta.requiredElevated && !hasElevatedRole.value) return next("/");

  // TODO: Prevent access of login page if user is already logged in

  // If a route needs auth and there is no active token => login
  // A redirect query is added. The calling component itself decides wether to use it or not
  if (!isTokenActive() && to.meta.requiredAuth) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }
  // In all other cases just go on to not freeze routing. Just pray.
  return next();
});
export default router;
