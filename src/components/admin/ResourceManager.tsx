import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import Modal from 'react-bootstrap/Modal'
import Table from 'react-bootstrap/Table'
import { useCollection, useCreate, useRemove, useUpdate } from '@/api/hooks'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'
import { ResourceForm } from './ResourceForm'
import type { ResourceAdminConfig } from './types'
import type { ParseObject } from '@/types'

type Editing<T> = { mode: 'create'; draft: Partial<T> } | { mode: 'edit'; draft: T }

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
  const dynamicOptions = config.useOptions?.() ?? {}

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

  const items = data ?? []
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

      {items.length === 0 ? (
        <p className="text-muted">Aucun élément pour le moment.</p>
      ) : (
        <div className="table-responsive">
          <Table striped hover className="align-middle">
            <thead>
              <tr>
                {columns.map((field) => (
                  <th key={field.name} scope="col">
                    {field.label}
                  </th>
                ))}
                <th scope="col" className="text-end">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.objectId}>
                  {columns.map((field) => (
                    <td key={field.name}>
                      {field.render
                        ? field.render(item)
                        : String(item[field.name] ?? '')}
                    </td>
                  ))}
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
