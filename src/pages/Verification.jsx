import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Verification() {
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const navigate = useNavigate()

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false
    setOtp([...otp.map((d, idx) => (idx === index ? element.value : d))])
    // Focus next input
    if (element.nextSibling) {
      element.nextSibling.focus()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mock verification
    navigate('/payment')
  }

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed font-body kente-pattern">
      <div className="flex max-w-container-max mx-auto pt-24 min-h-screen">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col p-6 gap-4 h-[calc(100vh-6rem)] sticky top-24 bg-surface-container-low/60 backdrop-blur-md border-r border-outline-variant/30 w-80">
          <div className="mb-8">
            <h2 className="headline-sm text-primary-fixed">Registration</h2>
            <p className="body-md text-on-surface-variant">Ghana 2026 Edition</p>
          </div>
          <nav className="space-y-2">
            <Link to="/signup" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-bright/20 rounded-lg transition-all duration-200">
              <span className="material-symbols-outlined">confirmation_number</span>
              <span className="label-md">Pass Selection</span>
            </Link>
            <Link to="/create-account" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-bright/20 rounded-lg transition-all duration-200">
              <span className="material-symbols-outlined">person</span>
              <span className="label-md">Basic Info</span>
            </Link>
            <div className="flex items-center gap-3 p-3 bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/20 rounded-lg font-bold transition-all duration-200">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
              <span className="label-md">Verification</span>
            </div>
            <div className="flex items-center gap-3 p-3 text-on-surface-variant/40 cursor-not-allowed opacity-50">
              <span className="material-symbols-outlined">payments</span>
              <span className="label-md">Payment</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-12">
          <header className="mb-12" data-aos="fade-up">
            <div className="flex items-center gap-4 mb-2">
              <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded label-md font-bold uppercase tracking-wider">STEP 03</span>
              <h1 className="headline-lg text-primary">Verify Your Email</h1>
            </div>
            <p className="body-lg text-on-surface-variant max-w-2xl">
              We've sent a 6-digit verification code to your email. Enter it below to secure your registration.
            </p>
          </header>

          <section className="glass-card p-8 md:p-12 rounded-xl kente-border max-w-2xl" data-aos="fade-up">
            <form className="space-y-10" onSubmit={handleSubmit}>
              <div className="flex justify-between gap-2 md:gap-4">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    className="w-full h-16 md:h-20 bg-surface-container-high border border-outline-variant/30 text-center text-2xl font-bold text-primary-fixed rounded-lg focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none transition-all"
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                  />
                ))}
              </div>

              <div className="text-center">
                <p className="body-md text-on-surface-variant mb-4">
                  Didn't receive the code? 
                  <button type="button" className="text-primary-fixed font-bold hover:underline ml-2 transition-all">Resend Code</button>
                </p>
              </div>

              <button 
                className="w-full bg-primary-fixed text-on-primary-fixed py-5 rounded-lg headline-sm font-bold shadow-[0_0_20px_rgba(163,250,1,0.2)] hover:shadow-[0_0_40px_rgba(163,250,1,0.4)] active:scale-95 transition-all uppercase tracking-widest"
                type="submit"
              >
                Verify & Continue
              </button>
            </form>
          </section>
        </main>

        {/* Summary Sidebar */}
        <aside className="hidden xl:block w-96 p-6" data-aos="fade-left">
          <div className="glass-card p-6 rounded-xl border-l-4 border-l-primary-fixed">
            <h3 className="headline-sm text-primary mb-4">Verification Info</h3>
            <div className="space-y-4">
              <div className="p-4 bg-surface-bright/10 rounded-lg border border-outline-variant/20">
                <p className="label-md text-secondary flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm">security</span>
                  Security First
                </p>
                <p className="body-md mt-2 text-on-surface-variant text-sm">
                  We value your privacy. Email verification ensures that only you can access your ticket and summit credentials.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
