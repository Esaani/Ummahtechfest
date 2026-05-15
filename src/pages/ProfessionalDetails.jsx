import { Link, useNavigate } from 'react-router-dom'

export default function ProfessionalDetails() {
  const navigate = useNavigate()

  const handleSubmit = (e) => {
    e.preventDefault()
    navigate('/verification')
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
              <span className="label-md">Details</span>
            </div>
            <div className="flex items-center gap-3 p-3 text-on-surface-variant/40 cursor-not-allowed opacity-50">
              <span className="material-symbols-outlined">verified</span>
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
              <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded label-md font-bold uppercase tracking-wider">STEP 02</span>
              <h1 className="headline-lg text-primary">Professional Details</h1>
            </div>
            <p className="body-lg text-on-surface-variant max-w-2xl">
              Help us tailor your experience. Your professional information helps us connect you with the right mentors and networking opportunities.
            </p>
          </header>

          <section className="glass-card p-8 rounded-xl kente-border overflow-hidden relative" data-aos="fade-up">
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <div className="flex flex-col gap-2">
                  <label className="label-md text-secondary uppercase tracking-wider">Current Role</label>
                  <select className="bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg p-4 body-md focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none transition-all appearance-none cursor-pointer">
                    <option value="">Select your role</option>
                    <option value="developer">Software Developer</option>
                    <option value="founder">Startup Founder</option>
                    <option value="designer">UI/UX Designer</option>
                    <option value="student">Student / Researcher</option>
                    <option value="investor">Investor</option>
                    <option value="other">Other Professional</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="label-md text-secondary uppercase tracking-wider">Years of Experience</label>
                  <input className="bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg p-4 body-md focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none transition-all" placeholder="e.g. 5" type="number"/>
                </div>
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="label-md text-secondary uppercase tracking-wider">Company / Organization Name</label>
                  <input className="bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-lg p-4 body-md focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none transition-all" placeholder="Where do you work or study?" type="text"/>
                </div>
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-outline-variant/30">
                <Link to="/create-account" className="flex items-center gap-2 label-md text-on-surface-variant hover:text-primary-fixed transition-colors group">
                  <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                  Back to Personal Info
                </Link>
                <button className="w-full md:w-auto bg-primary-fixed text-on-primary-fixed px-12 py-4 rounded-lg label-md font-bold hover:shadow-[0_0_20px_rgba(163,250,1,0.4)] active:scale-95 transition-all uppercase tracking-widest" type="submit">
                  Proceed to Verification
                </button>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  )
}
