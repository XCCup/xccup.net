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

const { saveTokenData, isTokenActive, updateTokens, authData } = useUser();

router.beforeEach(async (to, from, next) => {
  let accessToken = null;
  let refreshToken = null;

  console.log(authData.value);

  // If no token is present in state check if there is token information in local storage
  if (!authData.value.token) {
    accessToken = localStorage.getItem("accessToken");
    refreshToken = localStorage.getItem("refreshToken");

    // If there was token information in local storage => update state
    if (accessToken && refreshToken) {
      saveTokenData({ accessToken, refreshToken });
    }
  }

  // Refresh if token is expired
  if (!isTokenActive.value) await updateTokens();

  // If a route doesn't need auth just go on
  if (to.fullPath == "/") return next();

  // If a route needs auth and there is no active token => login
  if (!isTokenActive.value && to.meta.requiredAuth) {
    console.log(refreshToken);
    console.log(isTokenActive.value);
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }
  // In all other cases just go on.
  return next();
});
export default router;
