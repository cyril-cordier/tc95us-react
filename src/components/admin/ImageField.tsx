import { useEffect, useRef, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Spinner from 'react-bootstrap/Spinner'
import { uploadImage } from '@/lib/uploadImage'

export function ImageField({
  value,
  onChange,
  label,
  accept,
}: {
  value: string
  onChange: (url: string) => void
  label: string
  /** Types de fichiers proposés dans le sélecteur. */
  accept?: string
}) {
  const [isUploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCopied, setCopied] = useState(false)
  const urlInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!isCopied) return
    const timer = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timer)
  }, [isCopied])

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    setCopied(false)

    try {
      onChange(await uploadImage(file))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L'envoi a échoué.")
    } finally {
      setUploading(false)
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
    } catch {
      // Presse-papiers indisponible (contexte non sécurisé, permission
      // refusée) : on sélectionne l'URL pour que le Ctrl+C reste possible.
      urlInput.current?.select()
    }
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control type="file" accept={accept} onChange={handleChange} />

      {isUploading ? (
        <p className="small text-muted mt-2">
          <Spinner animation="border" size="sm" /> Envoi en cours…
        </p>
      ) : null}

      {error ? <p className="small text-danger mt-2">{error}</p> : null}

      {value ? (
        <>
          <InputGroup size="sm" className="mt-2">
            <Form.Control
              ref={urlInput}
              readOnly
              value={value}
              aria-label="URL du fichier envoyé"
              onFocus={(event) => event.currentTarget.select()}
            />
            <Button variant="outline-secondary" onClick={handleCopy}>
              {isCopied ? 'Copié !' : 'Copier'}
            </Button>
          </InputGroup>

          {/* L'URL peut désigner un PDF autant qu'une photo. On tente l'aperçu
              et on l'efface s'il échoue, plutôt que de deviner d'après
              l'extension — un PDF ne laisse donc pas d'image cassée. */}
          <img
            key={value}
            src={value}
            alt=""
            className="admin-preview mt-2"
            onError={(event) => {
              event.currentTarget.hidden = true
            }}
          />
        </>
      ) : null}
    </Form.Group>
  )
}
