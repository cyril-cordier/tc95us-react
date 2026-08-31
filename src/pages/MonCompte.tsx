import { useEffect, useState, type FormEvent } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateUser } from '@/api/auth'
import { useAuth } from '@/auth/useAuth'
import { ChallengeResults } from '@/components/public/ChallengeResults'
import { ChallengeStandings } from '@/components/public/ChallengeStandings'
import { ProductGrid } from '@/components/public/ProductGrid'
import { PageHeader } from '@/components/ui/PageHeader'
import { PasswordInput } from '@/components/ui/PasswordInput'
import type { User } from '@/types'

const TABS = [
  { key: 'infos', label: 'Mes informations' },
  { key: 'produits', label: 'Les produits du club' },
  { key: 'joueurs', label: 'Les joueurs du challenge' },
  { key: 'resultats', label: 'Résultats du challenge' },
]

function ProfileForm({ user }: { user: User }) {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState(user)

  useEffect(() => setDraft(user), [user])

  const mutation = useMutation({
    mutationFn: (patch: Partial<User>) => updateUser(user.objectId, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['me'] }),
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    mutation.mutate({
      firstname: draft.firstname,
      lastname: draft.lastname,
      email: draft.email,
      challengename: draft.challengename,
    })
  }

  return (
    <Form onSubmit={handleSubmit} className="admin-panel">
      {mutation.isSuccess ? (
        <Alert variant="success">Vos informations ont été enregistrées.</Alert>
      ) : null}
      {mutation.error ? (
        <Alert variant="danger">{mutation.error.message}</Alert>
      ) : null}

      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="profile-firstname">
            <Form.Label>Prénom</Form.Label>
            <Form.Control
              value={draft.firstname ?? ''}
              onChange={(event) =>
                setDraft({ ...draft, firstname: event.target.value })
              }
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="profile-lastname">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              value={draft.lastname ?? ''}
              onChange={(event) =>
                setDraft({ ...draft, lastname: event.target.value })
              }
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="profile-email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={draft.email ?? ''}
              onChange={(event) => setDraft({ ...draft, email: event.target.value })}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="profile-challengename">
            <Form.Label>Pseudo pour le challenge</Form.Label>
            <Form.Control
              value={draft.challengename ?? ''}
              onChange={(event) =>
                setDraft({ ...draft, challengename: event.target.value })
              }
            />
          </Form.Group>
        </Col>
      </Row>

      <Button type="submit" className="mt-4" disabled={mutation.isPending}>
        {mutation.isPending ? 'Enregistrement…' : 'Enregistrer'}
      </Button>
    </Form>
  )
}

/**
 * Changement de mot de passe, séparé du formulaire de profil.
 *
 * Deux formulaires distincts et non un seul : l'enregistrement des
 * informations ne doit jamais transporter de mot de passe, ne serait-ce que
 * vide — Parse le prendrait au mot et écraserait celui du compte.
 */
function PasswordForm({ user }: { user: User }) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [mismatch, setMismatch] = useState(false)

  const mutation = useMutation({
    mutationFn: (next: string) => updateUser(user.objectId, { password: next }),
    onSuccess: () => {
      setPassword('')
      setConfirmation('')
    },
  })

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    mutation.reset()

    // La confirmation est vérifiée ici : une faute de frappe enfermerait le
    // compte derrière un mot de passe que personne ne connaît.
    if (password !== confirmation) {
      setMismatch(true)
      return
    }

    setMismatch(false)
    mutation.mutate(password)
  }

  return (
    <Form onSubmit={handleSubmit} className="admin-panel mt-4">
      <h2 className="h5 mb-3">Changer mon mot de passe</h2>

      {mutation.isSuccess ? (
        <Alert variant="success">Votre mot de passe a été modifié.</Alert>
      ) : null}
      {mismatch ? (
        <Alert variant="danger">Les deux saisies ne correspondent pas.</Alert>
      ) : null}
      {mutation.error ? (
        <Alert variant="danger">{mutation.error.message}</Alert>
      ) : null}

      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="profile-password">
            <Form.Label>Nouveau mot de passe</Form.Label>
            <PasswordInput
              value={password}
              autoComplete="new-password"
              required
              onChange={setPassword}
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="profile-password-confirmation">
            <Form.Label>Confirmation</Form.Label>
            <PasswordInput
              value={confirmation}
              autoComplete="new-password"
              required
              onChange={setConfirmation}
            />
          </Form.Group>
        </Col>
      </Row>

      <Button type="submit" className="mt-4" disabled={mutation.isPending}>
        {mutation.isPending ? 'Modification…' : 'Modifier le mot de passe'}
      </Button>
    </Form>
  )
}

export default function MonCompte() {
  const { user } = useAuth()

  return (
    <Container fluid>
      <PageHeader title="Mon compte">
        {user ? `Connecté en tant que ${user.firstname} ${user.lastname}` : null}
      </PageHeader>

      <Tab.Container defaultActiveKey="infos">
        <Row className="g-4">
          <Col md={3}>
            <Nav variant="pills" className="flex-column">
              {TABS.map((tab) => (
                <Nav.Item key={tab.key}>
                  <Nav.Link eventKey={tab.key}>{tab.label}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>

          <Col md={9}>
            <Tab.Content>
              <Tab.Pane eventKey="infos">
                {user ? (
                  <>
                    <ProfileForm user={user} />
                    <PasswordForm user={user} />
                  </>
                ) : null}
              </Tab.Pane>
              <Tab.Pane eventKey="produits" mountOnEnter>
                <ProductGrid />
              </Tab.Pane>
              <Tab.Pane eventKey="joueurs" mountOnEnter>
                <ChallengeStandings />
              </Tab.Pane>
              <Tab.Pane eventKey="resultats" mountOnEnter>
                <ChallengeResults />
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  )
}
