import Table from 'react-bootstrap/Table'
import { useCollection } from '@/api/hooks'
import { championnatsResource } from '@/api/resources'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'

export function ChampionnatTable() {
  const { data, isPending, error } = useCollection(championnatsResource)

  if (isPending) return <Loader />
  if (error) return <ErrorMessage error={error} />

  const rows = data ?? []
  if (rows.length === 0) {
    return <p className="text-muted">Aucune rencontre enregistrée.</p>
  }

  return (
    <div className="table-responsive">
      <Table striped hover>
        <caption className="visually-hidden">
          Résultats des rencontres par équipes du TC Us
        </caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Compétition</th>
            <th scope="col">Rencontre</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.objectId}>
              <td>{row.date}</td>
              <td>{row.competition}</td>
              <td>{row.match}</td>
              <td>{row.score}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
