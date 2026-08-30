/** Tri décroissant sur un champ numérique, valeurs manquantes en dernier. */
export function byWeightDesc<T extends { weight?: number }>(a: T, b: T): number {
  return (b.weight ?? 0) - (a.weight ?? 0)
}

/**
 * Tri décroissant sur une date `JJ/MM/AAAA` (le format saisi en base).
 * L'ancien code faisait `b.date - a.date` sur des chaînes : toujours NaN,
 * donc l'ordre restait celui du serveur.
 */
export function byFrenchDateDesc(a: { date?: string }, b: { date?: string }): number {
  return parseFrenchDate(b.date) - parseFrenchDate(a.date)
}

function parseFrenchDate(value?: string): number {
  if (!value) return 0
  const match = value.match(/(\d{1,2})\D(\d{1,2})\D(\d{2,4})/)
  if (!match) return 0
  const [, day, month, year] = match
  const fullYear = year.length === 2 ? `20${year}` : year
  return Date.UTC(Number(fullYear), Number(month) - 1, Number(day))
}
