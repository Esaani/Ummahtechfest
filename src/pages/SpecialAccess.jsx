import { Link } from 'react-router-dom'

export default function SpecialAccess() {
  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed font-body kente-pattern">
      <main className="pt-32 pb-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto min-h-screen flex flex-col lg:flex-row gap-12">
        {/* Sidebar Navigation (Registration Stepper) */}
        <aside className="h-fit w-full lg:w-72 lg:sticky lg:top-32 hidden lg:flex flex-col gap-6">
          <div className="glass-card p-6 rounded-xl border border-outline-variant/30">
            <div className="mb-6">
              <h2 className="headline-sm text-primary-fixed">Registration</h2>
              <p className="body-md text-on-surface-variant">Ghana 2026 Edition</p>
            </div>
            <nav className="flex flex-col gap-2">
              <Link to="/signup" className="flex items-center gap-4 p-3 text-on-surface-variant hover:text-on-surface transition-all duration-200 hover:bg-surface-bright/20 cursor-pointer rounded-lg">
                <span className="material-symbols-outlined">confirmation_number</span>
                <span className="label-md">Pass Selection</span>
              </Link>
              <div className="flex items-center gap-4 p-3 bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/20 rounded-lg font-bold">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
                <span className="label-md">Details</span>
              </div>
              <div className="flex items-center gap-4 p-3 text-on-surface-variant/40 cursor-not-allowed opacity-50">
                <span className="material-symbols-outlined">verified</span>
                <span className="label-md">Verification</span>
              </div>
              <div className="flex items-center gap-4 p-3 text-on-surface-variant/40 cursor-not-allowed opacity-50">
                <span className="material-symbols-outlined">payments</span>
                <span className="label-md">Payment</span>
              </div>
            </nav>
          </div>

          {/* Need Help Box */}
          <div className="glass-card p-6 rounded-xl border border-outline-variant/30 bg-primary-fixed/5">
            <div className="flex items-center gap-2 mb-3">
              <span className="material-symbols-outlined text-primary-fixed">help_center</span>
              <h4 className="label-md font-bold text-primary-fixed uppercase tracking-widest">Need Help?</h4>
            </div>
            <p className="body-md text-on-surface-variant text-xs mb-4">Contact our support team for assistance with specialized applications.</p>
            <button className="w-full py-2 bg-primary-fixed text-on-primary-fixed label-md rounded-md font-bold hover:scale-105 transition-transform">Contact Support</button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 space-y-10">
          <header data-aos="fade-up">
            <h1 className="headline-lg text-primary mb-4 leading-tight">Special Access Application</h1>
            <p className="body-lg text-on-surface-variant max-w-2xl">
              Exclusive passes for Policy makers, Investors, Academic researchers, and Media partners are subject to internal validation. Please provide accurate institutional credentials.
            </p>
          </header>

          <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
            {/* Section 1: Institutional Background */}
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden group border-l-4 border-l-primary-fixed" data-aos="fade-up">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-secondary">account_balance</span>
                <h3 className="headline-sm text-white">Institutional Background</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="label-md text-secondary uppercase tracking-wider block">Organization Name</label>
                  <input className="w-full h-14 bg-surface-container-low border border-outline-variant/30 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed text-on-surface rounded-lg px-4 transition-all outline-none" placeholder="e.g. Ministry of Communications" type="text"/>
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary uppercase tracking-wider block">Job Title / Designation</label>
                  <input className="w-full h-14 bg-surface-container-low border border-outline-variant/30 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed text-on-surface rounded-lg px-4 transition-all outline-none" placeholder="e.g. Senior Policy Analyst" type="text"/>
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="label-md text-secondary uppercase tracking-wider block">Official Website</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant material-symbols-outlined text-sm">language</span>
                    <input className="w-full h-14 bg-surface-container-low border border-outline-variant/30 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed text-on-surface rounded-lg pl-12 transition-all outline-none" placeholder="https://organization.gov.gh" type="url"/>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Contribution & Impact */}
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden border-l-4 border-l-primary-fixed" data-aos="fade-up">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-secondary">bolt</span>
                <h3 className="headline-sm text-white">Contribution & Impact</h3>
              </div>
              <div className="space-y-4">
                <label className="label-md text-secondary uppercase tracking-wider block">How do you intend to contribute to the West African tech ecosystem?</label>
                <textarea className="w-full bg-surface-container-low border border-outline-variant/30 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed text-on-surface rounded-lg py-4 px-4 transition-all resize-none outline-none" placeholder="Describe your objectives, potential collaborations, or specific insights you plan to share during the fest..." rows="5"></textarea>
              </div>
            </div>

            {/* Section 3: Credentials Upload */}
            <div className="glass-card p-8 rounded-2xl relative overflow-hidden border-l-4 border-l-primary-fixed" data-aos="fade-up">
              <div className="flex items-center gap-3 mb-8">
                <span className="material-symbols-outlined text-secondary">upload_file</span>
                <h3 className="headline-sm text-white">Credentials Upload</h3>
              </div>
              <div className="bg-surface-container-low/40 border-2 border-dashed border-outline-variant/30 rounded-xl p-10 flex flex-col items-center justify-center text-center group hover:border-primary-fixed/50 transition-all">
                <div className="w-16 h-16 rounded-full bg-primary-fixed/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary-fixed text-4xl">add_photo_alternate</span>
                </div>
                <h4 className="headline-sm text-on-surface mb-2">Upload ID or Professional Proof</h4>
                <p className="body-md text-on-surface-variant max-w-sm mb-8 text-sm">
                  Please upload a scanned copy of your official ID, Press Card, or Institutional Appointment Letter.
                </p>
                <div className="flex flex-col items-center gap-4">
                  <button className="bg-surface-container-high text-on-surface px-8 py-3 rounded-lg label-md font-bold border border-outline-variant/30 hover:bg-surface-variant transition-all">BROWSE FILES</button>
                  <span className="label-md text-on-surface-variant text-xs uppercase tracking-widest">MAX FILE SIZE: 10MB</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-8" data-aos="fade-up">
              <button className="bg-primary-fixed text-on-primary-fixed px-16 py-5 rounded-lg headline-sm font-bold shadow-[0_0_30px_rgba(163,250,1,0.2)] hover:shadow-[0_0_50px_rgba(163,250,1,0.4)] active:scale-95 transition-all flex items-center gap-4 group">
                Submit Application
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Sidebar: Review Process */}
        <aside className="w-full lg:w-80 space-y-8" data-aos="fade-left">
          <div className="glass-card p-8 rounded-2xl border border-outline-variant/30">
            <h3 className="headline-sm text-primary mb-8 leading-tight">Application Review Process</h3>
            <div className="space-y-10 relative">
              {/* Vertical Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-outline-variant/20"></div>

              {/* Step 1 */}
              <div className="relative pl-10">
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full bg-primary-fixed flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-on-primary-fixed"></div>
                </div>
                <h4 className="label-md font-bold text-primary-fixed uppercase tracking-wider mb-2">1. Submission</h4>
                <p className="body-md text-on-surface-variant text-xs leading-relaxed">
                  <span className="text-secondary font-bold mr-1 italic">Current Phase:</span>
                  Your application enters our institutional review queue instantly.
                </p>
              </div>

              {/* Step 2 */}
              <div className="relative pl-10 opacity-50">
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-outline-variant/50 bg-background"></div>
                <h4 className="label-md font-bold text-on-surface uppercase tracking-wider mb-2">2. Review & Validation</h4>
                <p className="body-md text-on-surface-variant text-xs leading-relaxed">Our team validates your institutional credentials and impact statement.</p>
              </div>

              {/* Step 3 */}
              <div className="relative pl-10 opacity-50">
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-outline-variant/50 bg-background"></div>
                <h4 className="label-md font-bold text-on-surface uppercase tracking-wider mb-2">3. Final Decision</h4>
                <p className="body-md text-on-surface-variant text-xs leading-relaxed">You will receive an email notification regarding your application status.</p>
              </div>

              {/* Step 4 */}
              <div className="relative pl-10 opacity-50">
                <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full border-2 border-outline-variant/50 bg-background"></div>
                <h4 className="label-md font-bold text-on-surface uppercase tracking-wider mb-2">4. Pass Activation</h4>
                <p className="body-md text-on-surface-variant text-xs leading-relaxed">Upon approval, your unique pass will be generated and sent to your email.</p>
              </div>
            </div>
          </div>

          {/* Visual Graphic */}
          <div className="glass-card rounded-2xl overflow-hidden aspect-video border border-outline-variant/30 group">
            <img 
              src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop" 
              alt="Technology Network" 
              className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent flex items-end p-4">
              <span className="label-md text-primary-fixed uppercase tracking-widest text-[10px]">Secure Institutional Validation</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
