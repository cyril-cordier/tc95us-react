import { useState } from 'react'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

interface PasswordInputProps {
  value: string
  onChange: (value: string) => void
  /** Oriente les gestionnaires de mots de passe : `current-password` ou `new-password`. */
  autoComplete?: string
  required?: boolean
}

/**
 * Champ mot de passe avec bascule d'affichage.
 *
 * L'`id` n'est pas passé explicitement : react-bootstrap le récupère du
 * `controlId` du `<Form.Group>` englobant, à travers le contexte, donc
 * l'étiquette reste associée au champ.
 */
export function PasswordInput({
  value,
  onChange,
  autoComplete,
  required,
}: PasswordInputProps) {
  const [isVisible, setVisible] = useState(false)

  return (
    <InputGroup>
      <Form.Control
        type={isVisible ? 'text' : 'password'}
        value={value}
        autoComplete={autoComplete}
        required={required}
        onChange={(event) => onChange(event.target.value)}
      />

      <Button
        // `type="button"` est indispensable : le champ vit dans un <form>, et
        // un bouton sans type soumet le formulaire au lieu de basculer l'œil.
        type="button"
        variant="light"
        onClick={() => setVisible((current) => !current)}
        aria-label={
          isVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'
        }
        aria-pressed={isVisible}
      >
        <i className={isVisible ? 'fas fa-eye-slash' : 'fas fa-eye'} aria-hidden />
      </Button>
    </InputGroup>
  )
}
