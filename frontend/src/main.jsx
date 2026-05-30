import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { RegistrationProvider } from './context/RegistrationContext.jsx'
import './style.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <RegistrationProvider>
        <App />
      </RegistrationProvider>
    </AuthProvider>
  </React.StrictMode>,
)
