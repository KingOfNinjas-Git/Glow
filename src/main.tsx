import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { AppProvider } from './state/AppContext'
import { FxProvider } from './state/FxContext'
import './index.css'

registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FxProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </FxProvider>
  </StrictMode>,
)
