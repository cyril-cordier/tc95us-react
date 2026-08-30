import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import '@/styles/global.css'
import { App } from '@/App'

const container = document.getElementById('root')
if (!container) throw new Error('Élément #root introuvable dans index.html')

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
