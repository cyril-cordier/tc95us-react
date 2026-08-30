import Container from 'react-bootstrap/Container'
import { Link } from 'react-router-dom'
import ecosport from '@/assets/ecosport_small.jpg'
import technifibre from '@/assets/technifibre_small.jpg'
import clubAffilie from '@/assets/logoclubaffilie.png'
import { RevealButton } from '@/components/ui/RevealButton'

const USEFUL_LINKS = [
  { href: 'https://tenup.fft.fr/', label: 'Mon espace Tennis' },
  { href: 'https://www.fft.fr/', label: 'Site de la FFT' },
  {
    href: 'https://comite.fft.fr/val-d-oise/',
    label: "Le comité du Val d'Oise",
  },
]

export function Footer() {
  return (
    <footer className="global-footer">
      <Container fluid>
        <p className="partenaires">
          Nos partenaires
          <img className="logopart" src={ecosport} alt="Ecosport" />
          <img className="logopart" src={technifibre} alt="Technifibre" />
        </p>

        <div className="footer-grid">
          <section>
            <h2 className="card-title">Contact</h2>
            <p>
              <strong>Tennis Club de Us</strong>
              <br />
              jardin public (RD 28)
              <br />
              95450 Us
            </p>
            <RevealButton
              label="Contacter le club par téléphone"
              href="tel:+33642093035"
              value="06 42 09 30 35"
            />
            <br />
            <RevealButton
              label="Contacter le club par email"
              href="mailto:tc95us@gmail.com"
              value="tc95us@gmail.com"
            />
            <p className="mt-2">
              <Link className="footer-link" to="/contact">
                Itinéraire pour venir au club
              </Link>
            </p>
          </section>

          <section>
            <h2 className="card-title">Informations</h2>
            <p>
              <Link className="footer-link" to="/mentions-legales">
                Mentions légales
              </Link>
            </p>
            <p>
              <Link className="footer-link" to="/reglement">
                Règlement du club
              </Link>
            </p>
            <p>
              <Link className="footer-link" to="/a-propos">
                À propos
              </Link>
            </p>
          </section>

          <section>
            <img src={clubAffilie} alt="Club affilié FFT" height={80} />
          </section>

          <section>
            <h2 className="card-title">Vos liens utiles</h2>
            {USEFUL_LINKS.map((link) => (
              <p key={link.href}>
                <a
                  className="footer-link"
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {link.label}
                </a>
              </p>
            ))}
          </section>

          <section>
            <h2 className="card-title">Restez connectés</h2>
            <p>
              <a
                className="footer-link"
                href="https://www.facebook.com/groups/406488439536879/"
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            </p>
            <p>
              <Link className="footer-link" to="/calendrier">
                Calendrier des évènements
              </Link>
            </p>
          </section>
        </div>
      </Container>

      <div className="footer-baseline">
        <span>Site créé par Cyril CORDIER</span>
        <Link className="footer-link" to="/admin">
          Accès admin
        </Link>
      </div>
    </footer>
  )
}
