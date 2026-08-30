import { useState } from 'react'
import Form from 'react-bootstrap/Form'
import Spinner from 'react-bootstrap/Spinner'
import { uploadImage } from '@/lib/uploadImage'

export function ImageField({
  value,
  onChange,
  label,
}: {
  value: string
  onChange: (url: string) => void
  label: string
}) {
  const [isUploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)

    try {
      onChange(await uploadImage(file))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "L'envoi a échoué.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Form.Group className="mb-3">
      <Form.Label>{label}</Form.Label>
      <Form.Control type="file" accept="image/*" onChange={handleChange} />

      {isUploading ? (
        <p className="small text-muted mt-2">
          <Spinner animation="border" size="sm" /> Envoi en cours…
        </p>
      ) : null}

      {error ? <p className="small text-danger mt-2">{error}</p> : null}

      {value ? (
        <img src={value} alt="" className="admin-preview mt-2" />
      ) : null}
    </Form.Group>
  )
}
