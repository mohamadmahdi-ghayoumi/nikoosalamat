import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/App.jsx'
import './styles/index.css'
import SiteConfigProvider from './features/site/SiteConfig.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SiteConfigProvider>
      <App />
    </SiteConfigProvider>
  </StrictMode>,
)
