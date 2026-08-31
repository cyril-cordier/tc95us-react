// Le nom du cloud est extrait de `CLOUDINARY_URL` par `vite.config.ts` et
// servi via ce module virtuel : la variable brute contient l'api_secret et
// n'est jamais exposée au navigateur.
import { CLOUD_NAME } from 'virtual:cloudinary-cloud'

/** Un nom de preset n'est pas un secret : il voyage dans chaque requête d'envoi. */
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? ''

/**
 * Envoie un fichier sur Cloudinary et renvoie son URL publique.
 *
 * Passe par un *upload preset* non signé : c'est le seul mode d'envoi
 * utilisable depuis un navigateur sans exposer de secret. Le preset se crée
 * dans la console Cloudinary (Settings → Upload → Add upload preset, mode
 * « Unsigned ») et se déclare dans `VITE_CLOUDINARY_UPLOAD_PRESET`.
 */
export async function uploadImage(file: File): Promise<string> {
  // Nommer la seule variable fautive : le message précédent citait les deux,
  // ce qui envoyait chercher un problème du mauvais côté.
  const missing = [
    CLOUD_NAME ? null : 'CLOUDINARY_URL',
    UPLOAD_PRESET ? null : 'VITE_CLOUDINARY_UPLOAD_PRESET',
  ].filter(Boolean)

  if (missing.length > 0) {
    throw new Error(
      `Upload indisponible : ${missing.join(' et ')} ${
        missing.length > 1 ? 'ne sont pas configurées' : "n'est pas configurée"
      }.`,
    )
  }

  const body = new FormData()
  body.append('file', file)
  body.append('upload_preset', UPLOAD_PRESET)

  // `auto` laisse Cloudinary classer le fichier : `image` pour les photos,
  // `raw` pour les PDF. Sans ça, l'endpoint `image` refuse les documents.
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
    { method: 'POST', body },
  )

  const result = (await response.json().catch(() => null)) as {
    secure_url?: string
    error?: { message?: string }
  } | null

  // Cloudinary explicite la cause du refus (preset inconnu, type de fichier
  // interdit) : la remonter évite un « l'envoi a échoué » opaque dans l'admin.
  if (!response.ok) {
    throw new Error(result?.error?.message ?? "L'envoi du fichier a échoué.")
  }

  if (!result?.secure_url) throw new Error("Cloudinary n'a pas renvoyé d'URL.")

  return result.secure_url
}
