import Spinner from 'react-bootstrap/Spinner'

export function Loader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="text-center my-5" role="status">
      <Spinner animation="border" variant="primary" />
      <p className="mt-3 text-muted">{label}</p>
    </div>
  )
}
