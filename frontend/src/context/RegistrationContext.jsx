import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { getPass } from '../config/passes'

const STORAGE_KEY = 'utf_selected_pass'

const RegistrationContext = createContext(null)

function readStoredPass() {
  try {
    const id = sessionStorage.getItem(STORAGE_KEY)
    return id ? getPass(id) : null
  } catch {
    return null
  }
}

export function RegistrationProvider({ children }) {
  const [selectedPass, setSelectedPassState] = useState(readStoredPass)

  const setSelectedPass = useCallback((passId) => {
    const pass = typeof passId === 'string' ? getPass(passId) : passId
    if (pass?.id) {
      sessionStorage.setItem(STORAGE_KEY, pass.id)
      setSelectedPassState(pass)
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
      setSelectedPassState(null)
    }
  }, [])

  const clearSelectedPass = useCallback(() => {
    sessionStorage.removeItem(STORAGE_KEY)
    setSelectedPassState(null)
  }, [])

  const value = useMemo(
    () => ({ selectedPass, setSelectedPass, clearSelectedPass }),
    [selectedPass, setSelectedPass, clearSelectedPass],
  )

  return (
    <RegistrationContext.Provider value={value}>{children}</RegistrationContext.Provider>
  )
}

export function useRegistration() {
  const ctx = useContext(RegistrationContext)
  if (!ctx) throw new Error('useRegistration must be used within RegistrationProvider')
  return ctx
}
