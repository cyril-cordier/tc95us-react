/**
 * Télécharge un fichier distant et le propose à l'enregistrement.
 *
 * La version Vue laissait le lien et l'object URL dans le document à chaque
 * clic : la mémoire n'était jamais libérée et les liens s'empilaient.
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url)
  if (!response.ok) throw new Error('Le téléchargement a échoué.')

  const objectUrl = URL.createObjectURL(await response.blob())

  try {
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = filename
    document.body.append(link)
    link.click()
    link.remove()
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
