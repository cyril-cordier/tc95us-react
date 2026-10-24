import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Modal from 'react-bootstrap/Modal'
import Row from 'react-bootstrap/Row'
import Table from 'react-bootstrap/Table'
import { useCollection, useCreate, useRemove, useReorder, useUpdate } from '@/api/hooks'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'
import { ResourceForm } from './ResourceForm'
import type { FieldDef, ResourceAdminConfig } from './types'
import type { ParseObject } from '@/types'

type Editing<T> = { mode: 'create'; draft: Partial<T> } | { mode: 'edit'; draft: T }

/** Les ressources classables portent toutes ce champ, hérité de la base Vue. */
type Ordered = ParseObject & { weight?: number }

const weightOf = (item: ParseObject) => (item as Ordered).weight ?? 0

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
  const reorder = useReorder(config.resource)

  const [editing, setEditing] = useState<Editing<T> | null>(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('')
  const [showArchived, setShowArchived] = useState(false)
  const dynamicOptions = config.useOptions?.() ?? {}
  const permissions = config.usePermissions?.() ?? {}

  const { archived } = config

  // L'exclusion opère en amont du filtre et de la recherche : les lignes
  // archivées ne doivent apparaître ni dans la liste, ni parmi les choix du
  // filtre, tant que l'interrupteur est éteint.
  const items = useMemo(() => {
    const all = data ?? []
    return !archived || showArchived ? all : all.filter((item) => !archived.match(item))
  }, [data, archived, showArchived])

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

  /**
   * Texte indexé une fois par jeu de données, et non à chaque frappe : sur les
   * contenus, concaténer puis nettoyer les champs représente plusieurs
   * centaines de kilo-octets de chaînes, ce qui se sentait à la saisie.
   */
  const searchIndex = useMemo(() => {
    if (!config.searchable) return null

    const index = new Map<string, string>()
    for (const item of items) {
      index.set(item.objectId, searchableText(item, config.fields))
    }

    return index
  }, [items, config.searchable, config.fields])

  /**
   * Un filtre peut désigner une catégorie qui n'est plus proposée : archives
   * masquées à nouveau, ou dernière ligne d'une catégorie supprimée. On
   * l'ignore alors plutôt que de renvoyer une liste vide sous un déroulant
   * qui affiche « Tous ». La valeur reste en mémoire : rallumer les archives
   * restaure le filtre tel quel.
   */
  const effectiveFilter = filterOptions.includes(filter) ? filter : ''

  const visibleItems = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle && !effectiveFilter) return items

    return items.filter((item) => {
      if (effectiveFilter && filterBy && String(item[filterBy] ?? '') !== effectiveFilter) {
        return false
      }

      return !needle || (searchIndex?.get(item.objectId) ?? '').includes(needle)
    })
  }, [items, search, effectiveFilter, filterBy, searchIndex])

  const { hiddenFields } = permissions

  const formFields = useMemo(
    () =>
      hiddenFields?.length
        ? config.fields.filter((field) => !hiddenFields.includes(field.name))
        : config.fields,
    [config.fields, hiddenFields],
  )

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
      let draft = config.prepareCreate?.(editing.draft) ?? editing.draft

      // Une ligne nouvelle se place en tête : on la voit aussitôt, et on la
      // descend ensuite si sa place est ailleurs.
      if (config.orderable) {
        const top = items.reduce((max, item) => Math.max(max, weightOf(item)), 0)
        draft = { ...draft, weight: top + 1 } as Partial<T>
      }

      await create.mutateAsync(draft)
    } else {
      const item = config.prepareUpdate?.(editing.draft) ?? editing.draft
      await update.mutateAsync(item)
    }

    setEditing(null)
  }

  async function handleMove(index: number, direction: -1 | 1) {
    const current = visibleItems[index]
    const neighbour = visibleItems[index + direction]
    if (!current || !neighbour) return

    // Le déplacement s'applique à la liste entière, mais se repère sur la
    // voisine *visible* : sous un filtre, les lignes masquées qui les séparent
    // relèvent d'autres catégories, jamais affichées avec celle-ci.
    const target = [...items]
    target.splice(target.indexOf(current), 1)
    target.splice(
      target.indexOf(neighbour) + (direction > 0 ? 1 : 0),
      0,
      current,
    )

    // Les poids hérités comportent de nombreux ex æquo — onze contenus à 10,
    // quinze à 0. Une simple permutation ne déplacerait pas la ligne d'un rang :
    // on renumérote depuis l'ordre voulu, en n'écrivant que les lignes dont la
    // valeur change réellement.

    const changes = target
      .map((item, position) => ({
        item,
        objectId: item.objectId,
        weight: target.length - position,
      }))
      .filter((change) => weightOf(change.item) !== change.weight)
      .map(({ objectId, weight }) => ({ objectId, weight }))

    if (changes.length > 0) await reorder.mutateAsync(changes)
  }

  function handleDelete(item: T) {
    // Le bouton est désactivé, mais l'interdit doit tenir aussi côté action.
    if (config.usePermissions && permissions.deleteBlocked?.(item)) return

    const confirmed = window.confirm(
      `Supprimer définitivement « ${config.describe(item)} » ?`,
    )
    if (confirmed) remove.mutate(item.objectId)
  }

  if (isPending) return <Loader />
  if (error) return <ErrorMessage error={error} />

  const isReordering = reorder.isPending
  // Le filtre, lui, n'empêche rien : il isole justement la catégorie qui
  // s'affiche d'un bloc côté public, et c'est là que l'ordre compte. Une
  // recherche libre, en revanche, découpe un sous-ensemble arbitraire dont le
  // voisinage ne veut rien dire.
  const isSearching = Boolean(search.trim())
  // Hors catégorie, descendre une ligne « sous » une ligne d'une autre
  // catégorie ne veut rien dire : les deux ne s'affichent jamais ensemble.
  // L'ordre ne prend son sens qu'une fois le filtre posé.
  const needsCategory = Boolean(filterBy) && !effectiveFilter
  const reorderHint = isSearching
    ? 'Effacez la recherche pour réordonner les lignes.'
    : needsCategory
      ? `Filtrez par « ${filterLabel} » pour réordonner les lignes.`
      : undefined

  const mutationError =
    create.error ?? update.error ?? remove.error ?? reorder.error

  return (
    <section className="admin-panel">
      <header className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h2 className="h4 mb-0">{config.title}</h2>
        <Button onClick={() => setEditing({ mode: 'create', draft: emptyDraft })}>
          + Ajouter {config.singular}
        </Button>
      </header>

      {mutationError ? <ErrorMessage error={mutationError} /> : null}

      {config.searchable || filterBy || archived ? (
        <Row className="g-2 mb-3">
          {filterBy ? (
            <Col sm={6} lg={5}>
              <Form.Select
                aria-label={`Filtrer par ${filterLabel}`}
                value={effectiveFilter}
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

          {archived ? (
            <Col xs={12}>
              <Form.Check
                type="switch"
                id={`show-archived-${config.resource.key}`}
                className="text-muted small"
                label={archived.label}
                checked={showArchived}
                onChange={(event) => setShowArchived(event.target.checked)}
              />
            </Col>
          ) : null}
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
              {visibleItems.map((item, index) => {
                const editBlocked = permissions.editBlocked?.(item)
                const deleteBlocked = permissions.deleteBlocked?.(item)

                return (
                <tr key={item.objectId}>
                  {/* Chaque interdit porte son motif, affiché en infobulle. */}
                  {columns.map((field) => {
                    const text = String(item[field.name] ?? '')

                    return (
                      <td key={field.name}>
                        {field.render ? (
                          field.render(item)
                        ) : field.truncateColumn ? (
                          // `title` suffit à révéler la suite au survol, sans
                          // dépendance ni état à gérer.
                          <span
                            className="admin-cell-truncate"
                            style={
                              typeof field.truncateColumn === 'number'
                                ? { maxWidth: `${field.truncateColumn}rem` }
                                : undefined
                            }
                            title={text}
                          >
                            {text}
                          </span>
                        ) : (
                          text
                        )}
                      </td>
                    )
                  })}
                  <td className="text-nowrap text-muted small">
                    {formatDate(item.updatedAt)}
                  </td>
                  <td className="text-end text-nowrap">
                    {config.orderable ? (
                      <>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-secondary"
                          disabled={index === 0 || isReordering || isSearching || needsCategory}
                          title={reorderHint}
                          aria-label={`Monter ${config.describe(item)}`}
                          onClick={() => handleMove(index, -1)}
                        >
                          <i className="fas fa-arrow-up" aria-hidden />
                        </Button>
                        <Button
                          variant="link"
                          size="sm"
                          className="text-secondary"
                          disabled={
                            index === visibleItems.length - 1 ||
                            isReordering ||
                            isSearching ||
                            needsCategory
                          }
                          title={reorderHint}
                          aria-label={`Descendre ${config.describe(item)}`}
                          onClick={() => handleMove(index, 1)}
                        >
                          <i className="fas fa-arrow-down" aria-hidden />
                        </Button>
                      </>
                    ) : null}
                    <Button
                      variant="link"
                      size="sm"
                      disabled={Boolean(editBlocked)}
                      title={editBlocked}
                      aria-label={`Modifier ${config.describe(item)}`}
                      onClick={() => setEditing({ mode: 'edit', draft: { ...item } })}
                    >
                      <i className="fas fa-edit" aria-hidden />
                    </Button>
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger"
                      disabled={Boolean(deleteBlocked)}
                      title={deleteBlocked}
                      aria-label={`Supprimer ${config.describe(item)}`}
                      onClick={() => handleDelete(item)}
                    >
                      <i className="fas fa-trash" aria-hidden />
                    </Button>
                  </td>
                </tr>
                )
              })}
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
                fields={formFields}
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
