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

const { saveTokenData, isTokenActive, setLoginStatus, refreshToken, authData } =
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
    auth = await refreshToken();
  } else {
    setLoginStatus("success");
  }

  if (to.fullPath == "/") {
    return next();
  } else if (auth && !to.meta.requiredAuth) {
    // This is another place to redirect after login.
    // Current implemantation redirects in BaseLogin Component
    return next();
  } else if (!auth && to.meta.requiredAuth) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }

  return next();
});
export default router;
