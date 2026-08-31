/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PARSE_API_URL: string
  readonly VITE_PARSE_APPLICATION_ID: string
  readonly VITE_PARSE_REST_API_KEY: string
  readonly VITE_PARSE_JAVASCRIPT_KEY: string
  readonly VITE_CLOUDINARY_UPLOAD_PRESET: string
  readonly VITE_GA_MEASUREMENT_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'virtual:cloudinary-cloud' {
  /** Nom du cloud Cloudinary, extrait de `CLOUDINARY_URL` par `vite.config.ts`. */
  export const CLOUD_NAME: string
}
