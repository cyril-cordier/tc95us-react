import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
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

/**
 * Expose une valeur calculée au build sous forme de module virtuel.
 *
 * Un `define` ne conviendrait pas : le plugin `vite:define` de Vite sort sans
 * rien remplacer en dev côté client (`consumer === 'client' && !isBuild`), et
 * le `/@vite/env` qui poserait le global n'est injecté que dans les workers.
 * L'identifiant resterait libre et lèverait un ReferenceError au chargement.
 * Un module virtuel, lui, suit la résolution normale et se comporte pareil en
 * dev et au build.
 */
function virtualModule(id: string, source: () => string): Plugin {
  const resolved = `\0${id}`

  return {
    name: `tc-${id.replace(/[^a-z0-9]+/gi, '-')}`,
    resolveId: (imported) => (imported === id ? resolved : null),
    load: (loaded) => (loaded === resolved ? source() : null),
  }
}

/**
 * Version et date affichées en pied de page.
 *
 * La date est celle du dernier commit — la vraie date de modification du site,
 * qui avance donc d'elle-même à chaque publication. Repli sur l'heure du build
 * si l'historique git n'est pas disponible, ce qui arrive sur une archive
 * déployée sans dépôt.
 */
function buildInfo() {
  const { version } = JSON.parse(readFileSync('./package.json', 'utf8')) as {
    version: string
  }

  let modifiedAt: string
  try {
    modifiedAt = execSync('git log -1 --format=%cI', { encoding: 'utf8' }).trim()
  } catch {
    modifiedAt = new Date().toISOString()
  }

  return { version, modifiedAt }
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
    plugins: [
      react(),
      virtualModule(
        'virtual:cloudinary-cloud',
        () =>
          `export const CLOUD_NAME = ${JSON.stringify(
            cloudinaryCloudName(env.CLOUDINARY_URL ?? ''),
          )}\n`,
      ),
      virtualModule('virtual:build-info', () => {
        const { version, modifiedAt } = buildInfo()

        return (
          `export const VERSION = ${JSON.stringify(version)}\n` +
          `export const MODIFIED_AT = ${JSON.stringify(modifiedAt)}\n`
        )
      }),
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
  }
})
