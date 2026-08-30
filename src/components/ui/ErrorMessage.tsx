import Alert from 'react-bootstrap/Alert'

/**
 * Les erreurs réseau finissaient toutes en `console.log` dans la version Vue :
 * l'utilisateur voyait une page vide sans savoir pourquoi.
 */
export function ErrorMessage({ error }: { error: unknown }) {
  const message =
    error instanceof Error ? error.message : 'Une erreur inattendue est survenue.'

  return (
    <Alert variant="danger" className="my-4">
      {message}
    </Alert>
  )
}
