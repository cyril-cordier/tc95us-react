import { useState } from 'react'
import Button from 'react-bootstrap/Button'

/**
 * Masque une coordonnée derrière un clic (anti-collecte automatisée).
 * Remplace les paires de booléens `x_toggle` / `x_button_toggle` de la version Vue.
 */
export function RevealButton({
  label,
  href,
  value,
  variant = 'outline-light',
}: {
  label: string
  href: string
  value: string
  variant?: string
}) {
  const [revealed, setRevealed] = useState(false)

  if (revealed) {
    return (
      <a href={href} className="footer-link d-inline-block my-2">
        {value}
      </a>
    )
  }

  return (
    <Button variant={variant} className="my-2" onClick={() => setRevealed(true)}>
      {label}
    </Button>
  )
}
