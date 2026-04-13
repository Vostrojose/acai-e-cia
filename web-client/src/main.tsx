import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

/* ============================= */
/* 🔥 CONTROLE DE VERSÃO (ANTI-CACHE) */
/* ============================= */

const APP_VERSION = '1.0.3' // 🔁 ALTERAR A CADA DEPLOY

const storedVersion = localStorage.getItem('app_version')

if (storedVersion !== APP_VERSION) {
  localStorage.setItem('app_version', APP_VERSION)

  // evita loop infinito
  if (!sessionStorage.getItem('reloaded')) {
    sessionStorage.setItem('reloaded', 'true')
    window.location.reload()
  }
}

/* ============================= */
/* 🔥 REMOVE SERVICE WORKER */
/* ============================= */

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister()
    }
  })
}

/* ============================= */
/* 🚀 APP */
/* ============================= */

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
)