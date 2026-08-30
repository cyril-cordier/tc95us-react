import Table from 'react-bootstrap/Table'
import { useCollection } from '@/api/hooks'
import { challengeUsersResource } from '@/api/resources'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'

export function ChallengeStandings() {
  const { data, isPending, error } = useCollection(challengeUsersResource)

  if (isPending) return <Loader />
  if (error) return <ErrorMessage error={error} />

  const players = (data ?? []).filter((player) => player.visible !== 'Eliminé')
  if (players.length === 0) {
    return <p className="text-muted">Aucun joueur inscrit au challenge.</p>
  }

  return (
    <div className="table-responsive">
      <Table striped hover>
        <caption className="visually-hidden">
          Classement des joueurs du challenge interne
        </caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Joueur</th>
            <th scope="col">Classement FFT</th>
            <th scope="col">Points</th>
            <th scope="col">Matchs</th>
            <th scope="col">Match av.</th>
            <th scope="col">Set av.</th>
            <th scope="col">Jeux av.</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, index) => (
            <tr key={player.objectId}>
              <td>{index + 1}</td>
              <td>{player.challengename}</td>
              <td>{player.ranking}</td>
              <td>{player.points}</td>
              <td>{player.nbmatchs}</td>
              <td>{player.matchaverage}</td>
              <td>{player.setaverage}</td>
              <td>{player.gameaverage}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
