/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PARSE_API_URL: string
  readonly VITE_PARSE_APPLICATION_ID: string
  readonly VITE_PARSE_REST_API_KEY: string
  readonly VITE_PARSE_JAVASCRIPT_KEY: string
  readonly VITE_FILESTACK_API_KEY: string
  readonly VITE_GA_MEASUREMENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
