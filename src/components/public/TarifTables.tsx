import { useMemo } from 'react'
import Table from 'react-bootstrap/Table'
import { useCollection } from '@/api/hooks'
import { tarifsResource } from '@/api/resources'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'
import type { Tarif } from '@/types'

function SimpleTable({ title, rows }: { title: string; rows: Tarif[] }) {
  if (rows.length === 0) return null

  return (
    <section className="mb-5">
      <h2 className="h4">{title}</h2>
      <div className="table-responsive">
        <Table striped className="tarif-simple">
          <thead>
            <tr>
              <th scope="col">Catégorie</th>
              <th scope="col">Tarif</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.objectId}>
                <td>
                  {row.category}
                  {/* Les forfaits ont besoin d'une explication que les
                      licences et cotisations n'utilisent pas : la ligne reste
                      absente quand le champ est vide. */}
                  {row.details ? (
                    <div className="text-muted small">{row.details}</div>
                  ) : null}
                </td>
                <td>{row.price1}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </section>
  )
}

function CoursTable({
  title,
  subtitle,
  rows,
  columns,
}: {
  title: string
  subtitle?: string
  rows: Tarif[]
  columns: { label: string; field: keyof Pick<Tarif, 'price1' | 'price2' | 'price3' | 'price4' | 'price5'> }[]
}) {
  if (rows.length === 0) return null

  return (
    <section className="mb-5">
      <h2 className="h4">{title}</h2>
      {subtitle ? <p className="text-muted">{subtitle}</p> : null}
      <div className="table-responsive">
        <Table striped className="tarif-cours">
          <thead>
            <tr>
              <th scope="col">Temps / semaine</th>
              {columns.map((column) => (
                <th key={column.field} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.objectId}>
                <td>{row.category}</td>
                {columns.map((column) => (
                  <td key={column.field}>{row[column.field]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </section>
  )
}

export function TarifTables() {
  const { data, isPending, error } = useCollection(tarifsResource)

  // Un seul parcours au lieu des cinq `v-for` + `v-if` imbriqués de la version
  // Vue, qui laissaient des cellules vides quand la condition ne passait pas.
  const groups = useMemo(() => {
    const tarifs = data ?? []

    return {
      licences: tarifs.filter((tarif) => tarif.type === 'Licence'),
      cotisations: tarifs.filter((tarif) => tarif.type === 'Cotisation'),
      cours: tarifs.filter((tarif) => tarif.type === 'Cours'),
      forfaits: tarifs.filter((tarif) => tarif.type === 'Forfait'),
    }
  }, [data])

  if (isPending) return <Loader />
  if (error) return <ErrorMessage error={error} />

  return (
    <>
      <SimpleTable
        title="Licence FFT (obligatoire, assurance incluse)"
        rows={groups.licences}
      />

      <SimpleTable title="Cotisation club" rows={groups.cotisations} />
      {groups.cotisations.length > 0 ? (
        <p className="text-muted">Réduction famille 4 personnes ou + : 5 € par personne.</p>
      ) : null}

      <CoursTable
        title="Cours (dispensés par un diplômé d'État)"
        subtitle="Formules complètes — cours, licence et cotisation incluses."
        rows={groups.cours}
        columns={[
          { label: '45 min', field: 'price1' },
          { label: '1h', field: 'price2' },
          { label: 'Renfo. 1h+1h', field: 'price4' },
          { label: '1h30', field: 'price3' },
          { label: 'Compét. 1h30+1h30', field: 'price5' },
        ]}
      />

      <SimpleTable title="Forfaits" rows={groups.forfaits} />
    </>
  )
}
