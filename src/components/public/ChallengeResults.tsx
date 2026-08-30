import Table from 'react-bootstrap/Table'
import { useCollection } from '@/api/hooks'
import { challengeResultsResource } from '@/api/resources'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'
import type { ChallengeResult } from '@/types'

/** Un set n'est affiché que s'il a été joué (0/0 = set non disputé). */
function formatSets(result: ChallengeResult): string {
  return [
    [result.S1W, result.S1L],
    [result.S2W, result.S2L],
    [result.S3W, result.S3L],
  ]
    .filter(([won, lost]) => won !== 0 || lost !== 0)
    .map(([won, lost]) => `${won}/${lost}`)
    .join(' ')
}

export function ChallengeResults() {
  const { data, isPending, error } = useCollection(challengeResultsResource)

  if (isPending) return <Loader />
  if (error) return <ErrorMessage error={error} />

  const results = data ?? []
  if (results.length === 0) {
    return <p className="text-muted">Aucun match enregistré.</p>
  }

  return (
    <div className="table-responsive">
      <Table striped hover>
        <caption className="visually-hidden">Résultats du challenge interne</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Vainqueur</th>
            <th scope="col">Perdant</th>
            <th scope="col">Score</th>
            <th scope="col">Pts V.</th>
            <th scope="col">Pts P.</th>
            <th scope="col">Détails</th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr key={result.objectId}>
              <td>{result.date}</td>
              <td>{result.winner}</td>
              <td>{result.looser}</td>
              <td className="text-nowrap">{formatSets(result)}</td>
              <td>{result.pointsW}</td>
              <td>{result.pointsL}</td>
              <td>{result.details}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
