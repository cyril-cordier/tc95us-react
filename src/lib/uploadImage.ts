const FILESTACK_KEY = import.meta.env.VITE_FILESTACK_API_KEY ?? ''

/**
 * Envoie un fichier sur Filestack et renvoie son URL publique.
 * La clé était en dur dans deux composants Vue ; elle vient maintenant de l'env.
 */
export async function uploadImage(file: File): Promise<string> {
  if (!FILESTACK_KEY) {
    throw new Error(
      "Upload indisponible : VITE_FILESTACK_API_KEY n'est pas configurée.",
    )
  }

  const body = new FormData()
  body.append('fileUpload', file)

  const response = await fetch(
    `https://www.filestackapi.com/api/store/S3?key=${FILESTACK_KEY}`,
    { method: 'POST', body },
  )

  if (!response.ok) throw new Error("L'envoi de l'image a échoué.")

  const result = (await response.json()) as { url?: string }
  if (!result.url) throw new Error("Filestack n'a pas renvoyé d'URL.")

  return result.url
}
