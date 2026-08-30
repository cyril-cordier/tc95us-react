import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { useCollection } from '@/api/hooks'
import { productsResource } from '@/api/resources'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'

export function ProductGrid() {
  const { data, isPending, error } = useCollection(productsResource)

  if (isPending) return <Loader />
  if (error) return <ErrorMessage error={error} />

  const products = data ?? []
  if (products.length === 0) {
    return <p className="text-muted">Aucun produit disponible.</p>
  }

  return (
    <Row xs={1} sm={2} lg={3} className="g-4">
      {products.map((product) => (
        <Col key={product.objectId}>
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title as="h3" className="h5">
                {product.name}
              </Card.Title>
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                  loading="lazy"
                />
              ) : null}
              <Card.Text className="mt-3">{product.details}</Card.Text>
            </Card.Body>
            <Card.Footer className="text-muted">{product.price}</Card.Footer>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
