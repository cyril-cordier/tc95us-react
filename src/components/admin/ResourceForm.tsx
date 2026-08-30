import Col from 'react-bootstrap/Col'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { ImageField } from './ImageField'
import { RichTextField } from './RichTextField'
import type { FieldDef } from './types'

interface ResourceFormProps<T> {
  fields: FieldDef<T>[]
  draft: Partial<T>
  onChange: (name: Extract<keyof T, string>, value: unknown) => void
  options: Record<string, readonly string[]>
  isCreation: boolean
}

/** Rend un formulaire complet à partir de la description des champs. */
export function ResourceForm<T>({
  fields,
  draft,
  onChange,
  options,
  isCreation,
}: ResourceFormProps<T>) {
  const visible = fields.filter((field) => isCreation || !field.createOnly)

  return (
    <Row className="g-3">
      {visible.map((field) => {
        const value = (draft[field.name] ?? '') as string | number
        const choices = field.optionsFrom
          ? (options[field.optionsFrom] ?? [])
          : (field.options ?? [])

        return (
          <Col key={field.name} xs={12} md={field.span ?? 12}>
            {field.type === 'image' ? (
              <ImageField
                label={field.label}
                value={String(value)}
                onChange={(url) => onChange(field.name, url)}
              />
            ) : (
              <Form.Group controlId={`field-${field.name}`}>
                <Form.Label>{field.label}</Form.Label>

                {field.type === 'richtext' ? (
                  <RichTextField
                    value={String(value)}
                    placeholder={field.label}
                    onChange={(html) => onChange(field.name, html)}
                  />
                ) : field.type === 'select' ? (
                  <Form.Select
                    value={String(value)}
                    required={field.required}
                    onChange={(event) => onChange(field.name, event.target.value)}
                  >
                    <option value="">—</option>
                    {choices.map((choice) => (
                      <option key={choice} value={choice}>
                        {choice}
                      </option>
                    ))}
                  </Form.Select>
                ) : field.type === 'radio' ? (
                  <div>
                    {choices.map((choice) => (
                      <Form.Check
                        key={choice}
                        inline
                        type="radio"
                        id={`${field.name}-${choice}`}
                        name={field.name}
                        label={choice}
                        checked={String(value) === choice}
                        onChange={() => onChange(field.name, choice)}
                      />
                    ))}
                  </div>
                ) : field.type === 'boolean' ? (
                  <Form.Check
                    type="switch"
                    id={`field-${field.name}`}
                    checked={Boolean(draft[field.name])}
                    onChange={(event) => onChange(field.name, event.target.checked)}
                  />
                ) : field.type === 'textarea' ? (
                  <Form.Control
                    as="textarea"
                    rows={3}
                    value={String(value)}
                    required={field.required}
                    onChange={(event) => onChange(field.name, event.target.value)}
                  />
                ) : (
                  <Form.Control
                    type={
                      field.type === 'number'
                        ? 'number'
                        : field.type === 'password'
                          ? 'password'
                          : 'text'
                    }
                    value={String(value)}
                    required={field.required}
                    onChange={(event) => onChange(field.name, event.target.value)}
                  />
                )}
              </Form.Group>
            )}
          </Col>
        )
      })}
    </Row>
  )
}
