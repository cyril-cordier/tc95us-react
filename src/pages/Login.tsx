import { useState, type FormEvent } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/useAuth'
import { PasswordInput } from '@/components/ui/PasswordInput'

interface LoginLocationState {
  from?: string
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await signIn(username, password)
      const state = location.state as LoginLocationState | null
      navigate(state?.from ?? '/admin', { replace: true })
    } catch {
      // Message volontairement générique : ne pas révéler si le compte existe.
      setError('Identifiant ou mot de passe invalide.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="login-page">
      <div className="login-card">
        <Form onSubmit={handleSubmit}>
          <h1 className="h4 text-center mb-2">Connexion</h1>
          <p className="text-center text-white-50">
            Accès réservé à l'administration du site
          </p>

          {error ? <Alert variant="danger">{error}</Alert> : null}

          <Form.Group className="mb-3" controlId="login-username">
            <Form.Label>Identifiant</Form.Label>
            <Form.Control
              type="text"
              value={username}
              autoComplete="username"
              required
              onChange={(event) => setUsername(event.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="login-password">
            <Form.Label>Mot de passe</Form.Label>
            <PasswordInput
              value={password}
              autoComplete="current-password"
              required
              onChange={setPassword}
            />
          </Form.Group>

          <div className="d-grid">
            <Button type="submit" variant="success" disabled={isSubmitting}>
              {isSubmitting ? 'Connexion…' : 'Se connecter'}
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  )
}
