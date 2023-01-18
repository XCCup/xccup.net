<script>
const storedTheme = localStorage.getItem("theme");
const getPreferredTheme = () => {
  if (storedTheme) {
    return storedTheme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};
const setTheme = function (theme) {
  if (
    theme === "auto" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  ) {
    document.documentElement.setAttribute("data-bs-theme", "dark");
  } else {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }
};
setTheme(getPreferredTheme());
const showActiveTheme = (theme) => {
  const activeThemeIcon = document.querySelector(".theme-icon-active use");
  const btnToActive = document.querySelector(
    `[data-bs-theme-value="${theme}"]`
  );
  const svgOfActiveBtn = btnToActive
    .querySelector("svg use")
    .getAttribute("href");
  document.querySelectorAll("[data-bs-theme-value]").forEach((element) => {
    element.classList.remove("active");
  });
  btnToActive.classList.add("active");
  activeThemeIcon.setAttribute("href", svgOfActiveBtn);
};
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", () => {
    if (storedTheme !== "light" || storedTheme !== "dark") {
      setTheme(getPreferredTheme());
    }
  });
window.addEventListener("load", () => {
  showActiveTheme(getPreferredTheme());
  document.querySelectorAll("[data-bs-theme-value]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const theme = toggle.getAttribute("data-bs-theme-value");
      localStorage.setItem("theme", theme);
      setTheme(theme);
      showActiveTheme(theme);
    });
  });
});
</script>
<template>
  <li class="nav-item dropdown">
    <button
      id="bd-theme"
      class="btn btn-link nav-link py-2 px-0 px-lg-2 dropdown-toggle d-flex align-items-center"
      type="button"
      aria-expanded="false"
      data-bs-toggle="dropdown"
      data-bs-display="static"
    >
      Color mode

      <svg class="bi my-1 theme-icon-active">
        <use href="#circle-half"></use>
      </svg>
      <span class="d-lg-none ms-2">Toggle theme</span>
    </button>
    <ul
      class="dropdown-menu dropdown-menu-end"
      aria-labelledby="bd-theme"
      style="--bs-dropdown-min-width: 8rem"
    >
      <li>
        <button
          type="button"
          class="dropdown-item d-flex align-items-center"
          data-bs-theme-value="light"
        >
          <svg class="bi me-2 opacity-50 theme-icon">
            <use href="#sun-fill"></use>
          </svg>
          Light
          <svg class="bi ms-auto d-none">
            <use href="#check2"></use>
          </svg>
        </button>
      </li>
      <li>
        <button
          type="button"
          class="dropdown-item d-flex align-items-center"
          data-bs-theme-value="dark"
        >
          <svg class="bi me-2 opacity-50 theme-icon">
            <use href="#moon-stars-fill"></use>
          </svg>
          Dark
          <svg class="bi ms-auto d-none">
            <use href="#check2"></use>
          </svg>
        </button>
      </li>
      <li>
        <button
          type="button"
          class="dropdown-item d-flex align-items-center active"
          data-bs-theme-value="auto"
        >
          <svg class="bi me-2 opacity-50 theme-icon">
            <use href="#circle-half"></use>
          </svg>
          Auto
          <svg class="bi ms-auto d-none">
            <use href="#check2"></use>
          </svg>
        </button>
      </li>
    </ul>
  </li>
  <ul
    class="dropdown-menu dropdown-menu-end"
    aria-labelledby="bd-theme"
    style="--bs-dropdown-min-width: 8rem"
  >
    <li>
      <button
        type="button"
        class="dropdown-item d-flex align-items-center"
        data-bs-theme-value="light"
      >
        <svg class="bi me-2 opacity-50 theme-icon">
          <!-- <use href="#sun-fill"></use> -->
        </svg>
        <i class="bi bi-brightness-high"></i>
        Light
        <svg class="bi ms-auto d-none">
          <use href="#check2"></use>
        </svg>
      </button>
    </li>
    <li>
      <button
        type="button"
        class="dropdown-item d-flex align-items-center active"
        data-bs-theme-value="dark"
      >
        <svg class="bi me-2 opacity-50 theme-icon">
          <use href="#moon-stars-fill"></use>
        </svg>
        Dark
        <svg class="bi ms-auto d-none">
          <use href="#check2"></use>
        </svg>
      </button>
    </li>
    <li>
      <button
        type="button"
        class="dropdown-item d-flex align-items-center"
        data-bs-theme-value="auto"
      >
        <svg class="bi me-2 opacity-50 theme-icon">
          <use href="#circle-half"></use>
        </svg>
        Auto
        <svg class="bi ms-auto d-none">
          <use href="#check2"></use>
        </svg>
      </button>
    </li>
  </ul>
</template>
