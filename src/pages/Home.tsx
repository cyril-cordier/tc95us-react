import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import { CONTENT_SLOTS, MEDIA_SLOTS, useSlotUrls } from '@/api/contents'
import banner from '@/assets/bg-tennis5.jpg'
import illustrationParDefaut from '@/assets/bureau_small.jpg'
import logoAnime from '@/assets/GIF_TC_Us.gif'
import { ContentSlot } from '@/components/content/ContentSlot'
import { ResponsiveEmbed } from '@/components/ui/ResponsiveEmbed'

export default function Home() {
  const { slotUrl } = useSlotUrls()

  // L'image livrée avec le site sert de repli : la page garde son illustration
  // tant qu'aucun bloc n'a été créé en admin, et n'attend pas la réponse du
  // réseau pour l'afficher.
  //
  // L'`alt` est vide à dessein : l'emplacement accueille une illustration
  // libre, et décrire une image qu'on ne connaît pas vaut moins que de la
  // laisser ignorer des lecteurs d'écran. Rendre ce texte éditable serait la
  // bonne réponse si l'image devait un jour porter de l'information.
  const illustration =
    slotUrl(MEDIA_SLOTS.illustrationAccueil) ?? illustrationParDefaut

  return (
    <>
      <img src={banner} alt="" className="home-banner" />

      <Container fluid className="mt-4">
        <div className="text-center mb-4">
          <img src={logoAnime} alt="" width={192} />
          <h1 className="page-title">Bienvenue sur le site du TC Us</h1>
        </div>

        <Row className="g-4">
          <Col xs={12} lg={8}>
            <Card>
              <Card.Body>
                <Card.Title as="h2">Actualités</Card.Title>
                <ContentSlot slot={CONTENT_SLOTS.home} />
              </Card.Body>
            </Card>
          </Col>

          <Col xs={12} lg={4}>
            <Card className="mb-4">
              <Card.Body>
                <Card.Title as="h2" className="h5">
                  <a
                    href="https://www.facebook.com/groups/406488439536879"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Rejoignez le Tennis Club de Us sur Facebook
                  </a>
                </Card.Title>
              </Card.Body>
            </Card>

            <Card>
              <Card.Body>
                <Card.Title as="h2" className="h5">
                  Quel temps fait-il sur nos courts ?
                </Card.Title>
                <div className="weather-embed">
                  <ResponsiveEmbed
                    src="https://fr.tutiempo.net/s-widget/full/42145/ca5"
                    title="Météo à Us"
                    ratio="1x1"
                  />
                </div>
                <Card.Text className="text-muted small mt-2">
                  Votre météo locale à Us, toujours à jour.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <img src={illustration} alt="" className="home-bureau" />
      </Container>
    </>
  )
}
