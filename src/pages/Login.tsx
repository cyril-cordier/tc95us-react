import { useState, type FormEvent } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import { useLocation, useNavigate } from 'react-router-dom'
import { requestPasswordReset } from '@/api/auth'
import { useAuth } from '@/auth/useAuth'
import { PasswordInput } from '@/components/ui/PasswordInput'

interface LoginLocationState {
  from?: string
}

export default function Login() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [isResetting, setResetting] = useState(false)

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')

  const [error, setError] = useState<string | null>(null)
  const [isSent, setSent] = useState(false)
  const [isSubmitting, setSubmitting] = useState(false)

  function switchMode(next: boolean) {
    setResetting(next)
    setError(null)
    setSent(false)
  }

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

  async function handleReset(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      await requestPasswordReset(email)
      setSent(true)
    } catch {
      // Parse renvoie un succès même pour une adresse inconnue : un échec ici
      // est forcément technique, jamais « compte introuvable ».
      setError("L'envoi a échoué. Réessayez dans un instant.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container className="login-page">
      <div className="login-card">
        {isResetting ? (
          <Form onSubmit={handleReset}>
            <h1 className="h4 text-center mb-2">Mot de passe oublié</h1>
            <p className="text-center text-white-50">
              Indiquez l'adresse email de votre compte : vous recevrez un lien
              pour choisir un nouveau mot de passe.
            </p>

            {error ? <Alert variant="danger">{error}</Alert> : null}

            {isSent ? (
              // Confirmation volontairement neutre : Parse ne nous dit pas si
              // l'adresse correspond à un compte, et l'afficher renseignerait
              // un attaquant sur les comptes existants.
              <Alert variant="success">
                Si un compte correspond à cette adresse, un email vient d'être
                envoyé. Pensez à regarder vos indésirables.
              </Alert>
            ) : (
              <>
                <Form.Group className="mb-4" controlId="reset-email">
                  <Form.Label>Adresse email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    autoComplete="email"
                    required
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Form.Group>

                <div className="d-grid">
                  <Button type="submit" variant="success" disabled={isSubmitting}>
                    {isSubmitting ? 'Envoi…' : 'Envoyer le lien'}
                  </Button>
                </div>
              </>
            )}

            <div className="text-center mt-3">
              <Button variant="link" className="text-white" onClick={() => switchMode(false)}>
                Retour à la connexion
              </Button>
            </div>
          </Form>
        ) : (
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

            <div className="text-center mt-3">
              <Button variant="link" className="text-white" onClick={() => switchMode(true)}>
                Mot de passe oublié ?
              </Button>
            </div>
          </Form>
        )}
      </div>
    </Container>
  )
}
