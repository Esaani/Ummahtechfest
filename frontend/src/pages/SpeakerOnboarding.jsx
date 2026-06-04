import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { outreachApi } from '../api/client'
import { useAuth } from '../context/AuthContext'
import SpeakerApplyGate from '../components/SpeakerApplyGate.jsx'
import ApplyToSpeak from './ApplyToSpeak.jsx'

export default function SpeakerOnboarding() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setChecking(false)
      return
    }
    outreachApi
      .speakerApplicationMe()
      .then((res) => {
        if (res.meta?.has_application) {
          navigate('/', { replace: true, state: { message: 'Your speaker profile is already on file.' } })
          return
        }
        if (!res.meta?.needs_onboarding) {
          navigate('/speaker/apply', { replace: true })
        }
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [authLoading, isAuthenticated, navigate])

  if (authLoading || checking) {
    return (
      <main className="pt-32 pb-20 text-center">
        <p className="body-lg text-on-surface-variant">Loading…</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <SpeakerApplyGate onboarding />
  }

  return <ApplyToSpeak variant="onboarding" />
}
