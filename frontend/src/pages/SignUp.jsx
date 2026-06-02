import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PassComingSoonModal from '../components/PassComingSoonModal.jsx'
import PassSignupCard from '../components/PassSignupCard.jsx'
import { registrationsApi } from '../api/client'
import { PASSES, SIGNUP_PASS_ORDER, getPassRegistrationPath } from '../config/passes'
import { useAuth } from '../context/AuthContext'
import { useRegistration } from '../context/RegistrationContext'
import { isPassSignupBlocked, mapPassFromConfig, mapPassTypeFromApi } from '../utils/passHelpers'

export default function SignUp() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { setSelectedPass } = useRegistration()
  const [comingSoonPass, setComingSoonPass] = useState(null)
  const [passes, setPasses] = useState([])
  const [loadingPasses, setLoadingPasses] = useState(true)

  useEffect(() => {
    registrationsApi
      .passTypes()
      .then((res) => {
        if (res.data?.length) setPasses((res.data || []).map(mapPassTypeFromApi))
      })
      .catch(() =>
        setPasses(
          SIGNUP_PASS_ORDER.map((id) => mapPassFromConfig(PASSES[id])).filter(Boolean),
        ),
      )
      .finally(() => setLoadingPasses(false))
  }, [])

  const handlePassSelect = (pass) => {
    if (isPassSignupBlocked(pass)) {
      setComingSoonPass(pass)
      return
    }
    setSelectedPass(pass.id)
    if (isAuthenticated) {
      if (pass.flow === 'open') {
        navigate(`/professional-details?pass=${pass.id}`)
        return
      }
      if (pass.flow === 'approval') {
        navigate(`/special-access?pass=${pass.id}`)
        return
      }
    }
    const path = getPassRegistrationPath(pass)
    if (path) navigate(path)
  }

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed font-body kente-pattern pb-24">
      <PassComingSoonModal pass={comingSoonPass} onClose={() => setComingSoonPass(null)} />

      <main className="pt-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <header className="text-center mb-16 md:mb-24" data-aos="fade-up">
          <h1 className="headline-xl mb-6 tracking-tight">Choose your pass</h1>
          <p className="body-lg text-on-surface-variant max-w-2xl mx-auto">
            Each card shows what you can do right now—register, apply for approval, volunteer, or join the
            waitlist when tickets are not on sale yet.
          </p>
        </header>

        {loadingPasses ? (
          <p className="text-center body-md text-on-surface-variant py-16">Loading passes…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {passes.map((pass, i) => (
              <PassSignupCard key={pass.id} pass={pass} index={i} onSelect={handlePassSelect} />
            ))}
          </div>
        )}

        <div className="mt-24 h-[400px] rounded-3xl overflow-hidden relative border border-outline-variant/30" data-aos="zoom-in">
          <img
            alt="Tech Conference Atmosphere"
            className="w-full h-full object-cover"
            src="/assets/images/umma-volunteer.webp"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent flex items-end p-8 md:p-12">
            <div className="max-w-xl">
              <h2 className="headline-md text-white mb-2">Be part of the movement.</h2>
              <p className="text-on-surface-variant body-md">
                Join 5,000+ tech visionaries and digital leaders at Ummah Tech Fest, shaping the technological landscape of the African continent and the Ummah.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
