import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

/**
 * Extrait le nom du cloud de `cloudinary://<api_key>:<api_secret>@<cloud_name>`
 * (la forme du seul nom nu est acceptée telle quelle).
 *
 * `CLOUDINARY_URL` est délibérément sans préfixe `VITE_` : Vite ne l'expose
 * donc jamais à `import.meta.env`, et l'api_secret qu'elle contient ne peut pas
 * atterrir dans le bundle par inadvertance. Seul le nom du cloud, extrait ici
 * au build, franchit la frontière vers le navigateur.
 */
function cloudinaryCloudName(value: string): string {
  const trimmed = value.trim()
  return trimmed.match(/@([^@/]+)\/?$/)?.[1] ?? trimmed
}

const CLOUDINARY_MODULE_ID = 'virtual:cloudinary-cloud'
const RESOLVED_CLOUDINARY_MODULE_ID = `\0${CLOUDINARY_MODULE_ID}`

/**
 * Publie le nom du cloud sous forme de module virtuel.
 *
 * Un `define` ne conviendrait pas : le plugin `vite:define` de Vite sort sans
 * rien remplacer en dev côté client (`consumer === 'client' && !isBuild`), et
 * le `/@vite/env` qui poserait le global n'est injecté que dans les workers.
 * L'identifiant resterait donc libre et lèverait un ReferenceError au
 * chargement de l'admin. Un module virtuel, lui, suit la résolution normale et
 * se comporte pareil en dev et au build.
 */
function cloudinaryCloud(cloudName: string): Plugin {
  return {
    name: 'tc-cloudinary-cloud',
    resolveId(source) {
      return source === CLOUDINARY_MODULE_ID ? RESOLVED_CLOUDINARY_MODULE_ID : null
    },
    load(id) {
      return id === RESOLVED_CLOUDINARY_MODULE_ID
        ? `export const CLOUD_NAME = ${JSON.stringify(cloudName)}\n`
        : null
    },
  }
}

export default defineConfig(({ mode }) => {
  // Préfixe vide : `loadEnv` ne filtre plus sur `VITE_` et voit donc
  // `CLOUDINARY_URL`. Ce que cet objet contient reste côté build — seul le
  // module virtuel ci-dessous atteint le navigateur.
  const env = loadEnv(mode, process.cwd(), '')

  if (!env.CLOUDINARY_URL && env.VITE_CLOUDINARY_URL) {
    console.warn(
      '[cloudinary] VITE_CLOUDINARY_URL est ignorée : renommez la variable en ' +
        'CLOUDINARY_URL (sans préfixe), ici et dans les variables Netlify.',
    )
  }

  return {
    plugins: [react(), cloudinaryCloud(cloudinaryCloudName(env.CLOUDINARY_URL ?? ''))],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  }
})
