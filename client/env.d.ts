/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BASE_TZ: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
interface ImportMeta {
  readonly VITE_SENTRY_URL: string;
}
