import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import { useCollection, useCreate, useRemove, useUpdate } from '@/api/hooks'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'
import { ResourceForm } from './ResourceForm'
import type { FieldDef, ResourceAdminConfig } from './types'
import type { ParseObject } from '@/types'

type Editing<T> = { mode: 'create'; draft: Partial<T> } | { mode: 'edit'; draft: T }

/** Une seule instance : construire un formateur par ligne coûte cher. */
const DATE_FORMAT = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : DATE_FORMAT.format(date)
}

const HTML_TAGS = /<[^>]*>/g

/**
 * Texte dans lequel la recherche opère : tous les champs textuels de la ligne,
 * balises retirées — sans quoi une recherche sur « li » trouverait chaque bloc
 * contenant une liste.
 */
function searchableText<T>(item: T, fields: FieldDef<T>[]): string {
  return fields
    .map((field) => item[field.name])
    .filter((value): value is T[Extract<keyof T, string>] & string =>
      typeof value === 'string',
    )
    .join(' ')
    .replace(HTML_TAGS, ' ')
    .toLowerCase()
}

/**
 * Écran d'administration complet (liste, création, modification, suppression)
 * généré à partir d'une description de champs.
 *
 * La version Vue avait neuf composants de 250 à 480 lignes qui répétaient tous
 * la même table, les mêmes trois modales Bootstrap pilotées par jQuery et les
 * mêmes handlers.
 */
export function ResourceManager<T extends ParseObject>({
  config,
}: {
  config: ResourceAdminConfig<T>
}) {
  const { data, isPending, error } = useCollection(config.resource)
  const create = useCreate(config.resource)
  const update = useUpdate(config.resource)
  const remove = useRemove(config.resource)

  const [editing, setEditing] = useState<Editing<T> | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const dynamicOptions = config.useOptions?.() ?? {}

  const items = useMemo(() => data ?? [], [data])

  const { filterBy } = config

  const filterOptions = useMemo(() => {
    if (!filterBy) return []

    const values = new Set<string>()
    for (const item of items) {
      const value = item[filterBy]
      if (typeof value === 'string' && value) values.add(value)
    }

    return [...values].sort((a, b) => a.localeCompare(b, 'fr'))
  }, [items, filterBy])

  // L'intitulé du filtre reprend celui de la colonne, pour que les deux
  // désignent la même chose à l'écran.
  const filterLabel =
    config.fields.find((field) => field.name === filterBy)?.label ?? ''

  const visibleItems = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle && !filter) return items

    return items.filter((item) => {
      if (filter && filterBy && String(item[filterBy] ?? '') !== filter) {
        return false
      }

      return !needle || searchableText(item, config.fields).includes(needle)
    })
  }, [items, search, filter, filterBy, config.fields])

  const columns = useMemo(
    () => config.fields.filter((field) => field.column),
    [config.fields],
  )

  const emptyDraft = useMemo(() => {
    const draft: Record<string, unknown> = {}
    for (const field of config.fields) {
      draft[field.name] =
        field.type === 'number' ? 0 : field.type === 'boolean' ? false : ''
    }
    return draft as Partial<T>
  }, [config.fields])

  function handleChange(name: Extract<keyof T, string>, value: unknown) {
    setEditing((current) =>
      current
        ? ({ ...current, draft: { ...current.draft, [name]: value } } as Editing<T>)
        : current,
    )
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!editing) return

    if (editing.mode === 'create') {
      const draft = config.prepareCreate?.(editing.draft) ?? editing.draft
      await create.mutateAsync(draft)
    } else {
      const item = config.prepareUpdate?.(editing.draft) ?? editing.draft
      await update.mutateAsync(item)
    }

    setEditing(null)
  }

  function handleDelete(item: T) {
    const confirmed = window.confirm(
      `Supprimer définitivement « ${config.describe(item)} » ?`,
    )
    if (confirmed) remove.mutate(item.objectId)
  }

  if (isPending) return <Loader />
  if (error) return <ErrorMessage error={error} />

  const mutationError = create.error ?? update.error ?? remove.error

  return (
    <section className="admin-panel">
      <header className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h4 mb-0">{config.title}</h2>
        <Button onClick={() => setEditing({ mode: 'create', draft: emptyDraft })}>
          + Ajouter {config.singular}
        </Button>
      </header>

      {mutationError ? <ErrorMessage error={mutationError} /> : null}

      {(config.searchable || filterBy) && items.length > 0 ? (
        <Row className="g-2 mb-3">
          {filterBy ? (
            <Col sm={6} lg={5}>
              <Form.Select
                aria-label={`Filtrer par ${filterLabel}`}
                value={filter}
                onChange={(event) => setFilter(event.target.value)}
              >
                <option value="">Tous</option>
                {filterOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Form.Select>
            </Col>
          ) : null}

          {config.searchable ? (
            <Col sm={6} lg={5}>
              <Form.Control
                type="search"
                placeholder="Rechercher…"
                aria-label="Rechercher"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Col>
          ) : null}

          <Col xs="auto" className="d-flex align-items-center">
            <span className="text-muted small">
              {visibleItems.length} / {items.length}
            </span>
          </Col>
        </Row>
      ) : null}

      {items.length === 0 ? (
        <p className="text-muted">Aucun élément pour le moment.</p>
      ) : visibleItems.length === 0 ? (
        // Distinct du cas précédent : ici il y a des lignes, mais aucune ne
        // correspond — sans quoi on croirait la ressource vide.
        <p className="text-muted">Aucun élément ne correspond à cette recherche.</p>
      ) : (
        <div className="table-responsive">
          <Table striped hover className="align-middle">
            <thead>
              <tr>
                {columns.map((field) => (
                  <th key={field.name} scope="col">
                    {/* Un en-tête peut être masqué visuellement (l'importance,
                        dont le chiffre se lit seul) sans disparaître pour
                        autant de la restitution des lecteurs d'écran. */}
                    {field.hideColumnLabel ? (
                      <span className="visually-hidden">{field.label}</span>
                    ) : (
                      field.label
                    )}
                  </th>
                ))}
                <th scope="col" className="text-nowrap">
                  Modifié le
                </th>
                <th scope="col" className="text-end">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr key={item.objectId}>
                  {columns.map((field) => (
                    <td key={field.name}>
                      {field.render
                        ? field.render(item)
                        : String(item[field.name] ?? '')}
                    </td>
                  ))}
                  <td className="text-nowrap text-muted small">
                    {formatDate(item.updatedAt)}
                  </td>
                  <td className="text-end text-nowrap">
                    <Button
                      variant="link"
                      size="sm"
                      aria-label={`Modifier ${config.describe(item)}`}
                      onClick={() => setEditing({ mode: 'edit', draft: { ...item } })}
                    >
                      <i className="fas fa-edit" aria-hidden />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger"
                      aria-label={`Supprimer ${config.describe(item)}`}
                      onClick={() => handleDelete(item)}
                    >
                      <i className="fas fa-trash" aria-hidden />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      <Modal
        show={editing !== null}
        onHide={() => setEditing(null)}
        size="lg"
        scrollable
      >
        <form onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>
              {editing?.mode === 'create' ? 'Ajouter' : 'Modifier'} {config.singular}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {editing ? (
              <ResourceForm
                fields={config.fields}
                draft={editing.draft}
                onChange={handleChange}
                options={dynamicOptions}
                isCreation={editing.mode === 'create'}
              />
            ) : null}
          </Modal.Body>

          <Modal.Footer>
            <Button variant="secondary" onClick={() => setEditing(null)}>
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={create.isPending || update.isPending}
            >
              {create.isPending || update.isPending ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
          </Modal.Footer>
        </form>
      </Modal>
    </section>
  )
}
