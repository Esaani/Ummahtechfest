import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AppErrorBoundary from './components/AppErrorBoundary.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RegistrationProvider } from './context/RegistrationContext.jsx'
import './style.css'

const bootStatus = document.getElementById('boot-status')
if (bootStatus) {
  bootStatus.classList.add('boot-loader--exit')
  bootStatus.setAttribute('aria-busy', 'false')
  window.setTimeout(() => bootStatus.remove(), 380)
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <AuthProvider>
        <RegistrationProvider>
          <App />
        </RegistrationProvider>
      </AuthProvider>
    </AppErrorBoundary>
  </React.StrictMode>,
)
