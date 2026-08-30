import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { RequireAuth } from '@/auth/RequireAuth'

const Home = lazy(() => import('@/pages/Home'))
const Equipements = lazy(() => import('@/pages/Equipements'))
const Contact = lazy(() => import('@/pages/Contact'))
const Evenements = lazy(() => import('@/pages/Evenements'))
const Calendrier = lazy(() => import('@/pages/Calendrier'))
const Tarifs = lazy(() => import('@/pages/Tarifs'))
const Championnats = lazy(() => import('@/pages/Championnats'))
const Challenge = lazy(() => import('@/pages/Challenge'))
const Bureau = lazy(() => import('@/pages/Bureau'))
const Reglement = lazy(() => import('@/pages/Reglement'))
const MentionsLegales = lazy(() => import('@/pages/MentionsLegales'))
const APropos = lazy(() => import('@/pages/APropos'))
const Login = lazy(() => import('@/pages/Login'))
const MonCompte = lazy(() => import('@/pages/MonCompte'))
const Admin = lazy(() => import('@/pages/Admin'))
const NotFound = lazy(() => import('@/pages/NotFound'))

/** Anciennes URL du site Vue, conservées pour les liens et favoris existants. */
const LEGACY_REDIRECTS: Record<string, string> = {
  carte: '/contact',
  calendrier_events: '/calendrier',
  reglement_club: '/reglement',
  legal: '/mentions-legales',
  about: '/a-propos',
  moncompte: '/mon-compte',
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'club', element: <Equipements /> },
      { path: 'contact', element: <Contact /> },
      { path: 'evenements', element: <Evenements /> },
      { path: 'calendrier', element: <Calendrier /> },
      { path: 'tarifs', element: <Tarifs /> },
      { path: 'championnats', element: <Championnats /> },
      { path: 'challenge', element: <Challenge /> },
      { path: 'bureau', element: <Bureau /> },
      { path: 'reglement', element: <Reglement /> },
      { path: 'mentions-legales', element: <MentionsLegales /> },
      { path: 'a-propos', element: <APropos /> },
      { path: 'login', element: <Login /> },

      {
        element: <RequireAuth />,
        children: [{ path: 'mon-compte', element: <MonCompte /> }],
      },
      {
        element: <RequireAuth adminOnly />,
        children: [{ path: 'admin', element: <Admin /> }],
      },

      ...Object.entries(LEGACY_REDIRECTS).map(([from, to]) => ({
        path: from,
        element: <Navigate to={to} replace />,
      })),

      { path: '*', element: <NotFound /> },
    ],
  },
]
