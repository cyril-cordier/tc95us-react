import BsNavbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import NavDropdown from 'react-bootstrap/NavDropdown'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import logo from '@/assets/LOGO_T_US_RVB.png'
import { useAuth } from '@/auth/useAuth'

const CLUB_LINKS = [
  { to: '/club', label: 'Nos installations' },
  { to: '/contact', label: "Contact et plan d'accès" },
  { to: '/evenements', label: 'Animations et évènements' },
  { to: '/tarifs', label: 'Tarifs et inscription' },
  { to: '/bureau', label: 'Les membres du bureau' },
  { to: '/reglement', label: 'Règlement du club' },
]

const COMPETITION_LINKS = [
  { to: '/championnats', label: 'Les championnats par équipe' },
  { to: '/challenge', label: 'Le challenge' },
]

export function Navbar() {
  const { isAuthenticated, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  // La redirection vit ici et non dans `signOut` : `AuthProvider` enveloppe le
  // `RouterProvider`, il n'a donc pas accès aux hooks de navigation.
  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <BsNavbar expand="lg" fixed="top" className="tc-navbar" collapseOnSelect>
      <Container fluid>
        <BsNavbar.Brand as={Link} to="/">
          <img src={logo} alt="Tennis Club de Us" height={64} />
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="tc-navbar-nav" />

        <BsNavbar.Collapse id="tc-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" end>
              Accueil
            </Nav.Link>

            <NavDropdown title="Le Club" id="nav-club">
              {CLUB_LINKS.map((link) => (
                <NavDropdown.Item key={link.to} as={NavLink} to={link.to}>
                  {link.label}
                </NavDropdown.Item>
              ))}
            </NavDropdown>

            <NavDropdown title="Compétitions" id="nav-competitions">
              {COMPETITION_LINKS.map((link) => (
                <NavDropdown.Item key={link.to} as={NavLink} to={link.to}>
                  {link.label}
                </NavDropdown.Item>
              ))}
            </NavDropdown>
          </Nav>

          {isAuthenticated ? (
            <Nav>
              <Nav.Link as={NavLink} to="/mon-compte">
                Mon compte
              </Nav.Link>
              {isAdmin ? (
                <Nav.Link as={NavLink} to="/admin">
                  Admin
                </Nav.Link>
              ) : null}
              <Nav.Link as="button" onClick={handleSignOut}>
                Déconnexion
              </Nav.Link>
            </Nav>
          ) : null}
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  )
}
