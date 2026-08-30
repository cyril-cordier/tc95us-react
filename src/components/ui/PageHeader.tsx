import type { ReactNode } from 'react'

export function PageHeader({
  title,
  children,
}: {
  title: string
  children?: ReactNode
}) {
  return (
    <header className="mb-4">
      <h1 className="page-title">{title}</h1>
      {children ? <p className="text-muted">{children}</p> : null}
    </header>
  )
}
