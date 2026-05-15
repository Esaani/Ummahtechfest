import { useState } from 'react'

export default function VisaSupport() {
  const [formData, setFormData] = useState({
    fullName: '',
    regId: '',
    passportNumber: '',
    email: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Handle form submission logic here
    console.log('Form submitted:', formData)
    alert('Invitation request received! We will verify your registration and email you within 48 hours.')
  }

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-30 grayscale" 
            alt="Accra Twilight" 
            src="https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=1200&auto=format&fit=crop" 
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full py-12 md:py-20">
          <div className="max-w-2xl space-y-6" data-aos="fade-right">
            <span className="font-technical text-sm text-secondary uppercase tracking-[0.2em] block">Travel Information</span>
            <h1 className="text-4xl md:text-6xl font-black text-primary-fixed uppercase leading-tight">
              International Delegate<br />
              <span className="text-secondary italic">Visa Support</span>
            </h1>
            <p className="text-lg md:text-xl text-on-surface-variant leading-relaxed">
              Bridging the distance between heritage and innovation. We've streamlined the Ghana E-Visa process to ensure a seamless journey to Ummah Tech Fest 2026.
            </p>
          </div>
        </div>
      </section>

      {/* E-Visa Step-by-Step Guide */}
      <section className="py-16 md:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24 items-start">
          <div className="lg:w-1/3 sticky top-32 space-y-6" data-aos="fade-up">
            <h2 className="text-3xl md:text-4xl font-black text-primary uppercase">Ghana's <span className="text-primary-fixed">E-Visa</span> Process</h2>
            <p className="text-on-surface-variant">Follow this four-step digital application guide for international delegates traveling to Accra.</p>
            <div className="p-6 glass-card border-l-4 border-l-primary-fixed rounded-xl glow-lime">
              <span className="material-symbols-outlined text-primary-fixed text-4xl mb-4">info</span>
              <p className="text-sm font-technical text-on-surface leading-relaxed">
                Processing time is usually 3-5 business days. We recommend applying at least 3 weeks before departure.
              </p>
            </div>
          </div>

          <div className="lg:w-2/3 space-y-8">
            {[
              {
                step: 1,
                title: "Digital Portal Entry",
                desc: "Access the official Ghana Immigration Service portal and create a secure account using your email address and travel passport details.",
                cta: "Visit Official Portal",
                link: "https://www.ghanaimmigration.org/"
              },
              {
                step: 2,
                title: "Form Submission",
                desc: "Complete the online application form. Ensure your name matches your passport exactly. Select 'Conference' or 'Business' as the visit type."
              },
              {
                step: 3,
                title: "Digital Payment",
                desc: "Process the non-refundable visa application fee through the secure payment gateway. All major international credit cards and mobile wallets are accepted."
              },
              {
                step: 4,
                title: "Approval Notification",
                desc: "Once approved, you will receive a digital E-Visa certificate. Download and print this document to present upon arrival at Kotoka International Airport.",
                isLast: true
              }
            ].map((item, i) => (
              <div 
                key={i} 
                className={`glass-card p-8 md:p-10 rounded-2xl relative group transition-all duration-500 ${item.isLast ? 'border-2 border-primary-fixed/30 shadow-[0_0_40px_rgba(163,250,1,0.1)]' : 'hover:border-primary-fixed/50'}`}
                data-aos="fade-left"
                data-aos-delay={i * 100}
              >
                <div className="absolute -left-4 top-8 w-10 h-10 bg-primary-fixed text-on-primary-fixed rounded-full flex items-center justify-center font-black text-xl shadow-lg">
                  {item.step}
                </div>
                <div className="pl-6">
                  <h3 className="text-xl md:text-2xl font-black text-secondary mb-4 uppercase">{item.title}</h3>
                  <p className="text-on-surface-variant leading-relaxed mb-6">{item.desc}</p>
                  {item.cta && (
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary-fixed font-black uppercase tracking-widest text-xs group-hover:gap-4 transition-all"
                    >
                      {item.cta} <span className="material-symbols-outlined text-lg">open_in_new</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Required Documentation Bento Grid */}
      <section className="py-16 md:py-32 bg-surface-container-low/50">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="text-center mb-16 space-y-4" data-aos="fade-up">
            <h2 className="text-3xl md:text-5xl font-black text-primary uppercase">Required <span className="text-primary-fixed">Documentation</span></h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Please prepare digital copies of these essential documents before starting your application.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 glass-card p-8 md:p-12 rounded-3xl kente-border group" data-aos="fade-up">
              <span className="material-symbols-outlined text-primary-fixed text-6xl mb-8 group-hover:scale-110 transition-transform">passkey</span>
              <h4 className="text-2xl font-black text-primary mb-4 uppercase tracking-tight">Valid Passport</h4>
              <p className="text-on-surface-variant leading-relaxed">Passport must be valid for at least six months from the date of arrival in Ghana with at least two blank pages.</p>
            </div>
            
            <div className="glass-card p-8 rounded-3xl hover:border-secondary/50 transition-colors" data-aos="fade-up" data-aos-delay="100">
              <span className="material-symbols-outlined text-secondary text-5xl mb-6">vaccines</span>
              <h4 className="text-xl font-black text-primary mb-3 uppercase tracking-tight">Health Docs</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Valid Yellow Fever Vaccination Certificate is mandatory for all travelers.</p>
            </div>
            
            <div className="glass-card p-8 rounded-3xl hover:border-secondary/50 transition-colors" data-aos="fade-up" data-aos-delay="200">
              <span className="material-symbols-outlined text-secondary text-5xl mb-6">photo_camera</span>
              <h4 className="text-xl font-black text-primary mb-3 uppercase tracking-tight">Photo</h4>
              <p className="text-sm text-on-surface-variant leading-relaxed">Recent color passport-size photo with a white background taken within 6 months.</p>
            </div>
            
            <div className="md:col-span-2 glass-card p-8 md:p-10 rounded-3xl hover:border-primary-fixed/50 transition-colors" data-aos="fade-up" data-aos-delay="300">
              <div className="flex items-start gap-6">
                <span className="material-symbols-outlined text-primary-fixed text-5xl shrink-0">description</span>
                <div>
                  <h4 className="text-xl font-black text-primary mb-2 uppercase tracking-tight">Invitation Letter</h4>
                  <p className="text-on-surface-variant leading-relaxed">A formal letter from the Ummah Tech Fest organizing committee confirming your registration.</p>
                </div>
              </div>
            </div>
            
            <div className="md:col-span-2 glass-card p-8 md:p-10 rounded-3xl hover:border-primary-fixed/50 transition-colors" data-aos="fade-up" data-aos-delay="400">
              <div className="flex items-start gap-6">
                <span className="material-symbols-outlined text-primary-fixed text-5xl shrink-0">flight_land</span>
                <div>
                  <h4 className="text-xl font-black text-primary mb-2 uppercase tracking-tight">Travel Itinerary</h4>
                  <p className="text-on-surface-variant leading-relaxed">Copy of your round-trip flight booking and confirmed hotel reservation for the duration.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Request Invitation Letter Form */}
      <section className="py-16 md:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="glass-card rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl border border-white/5" data-aos="zoom-in">
          <div className="lg:w-1/2 p-8 md:p-16 space-y-8">
            <h2 className="text-3xl md:text-4xl font-black text-primary-fixed uppercase leading-tight">Request Official<br />Invitation Letter</h2>
            <p className="text-on-surface-variant leading-relaxed">Only registered attendees are eligible for visa support letters. Once submitted, our team will verify your registration and email the signed PDF within 48 hours.</p>
            <ul className="space-y-4">
              {[
                "Verified Delegate Status",
                "Ministry Certified Logo",
                "Valid for all Ghanaian Consulates"
              ].map((text, i) => (
                <li key={i} className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary-fixed">check_circle</span>
                  <span className="text-on-surface font-technical uppercase tracking-wider text-xs">{text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:w-1/2 bg-surface-container/30 p-8 md:p-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Full Name (as in Passport)</label>
                  <input 
                    required
                    className="w-full bg-background/50 border border-outline-variant/30 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed rounded-xl text-on-surface py-4 px-5 transition-all outline-none" 
                    placeholder="Enter full name" 
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Registration ID</label>
                  <input 
                    required
                    className="w-full bg-background/50 border border-outline-variant/30 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed rounded-xl text-on-surface py-4 px-5 transition-all outline-none" 
                    placeholder="UTF-2026-XXXX" 
                    type="text"
                    value={formData.regId}
                    onChange={(e) => setFormData({...formData, regId: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Passport Number</label>
                <input 
                  required
                  className="w-full bg-background/50 border border-outline-variant/30 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed rounded-xl text-on-surface py-4 px-5 transition-all outline-none" 
                  placeholder="Enter passport number" 
                  type="text"
                  value={formData.passportNumber}
                  onChange={(e) => setFormData({...formData, passportNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-secondary uppercase tracking-widest">Email Address</label>
                <input 
                  required
                  className="w-full bg-background/50 border border-outline-variant/30 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed rounded-xl text-on-surface py-4 px-5 transition-all outline-none" 
                  placeholder="delegate@domain.com" 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-primary-fixed text-on-primary-fixed py-5 rounded-xl font-black uppercase tracking-widest hover:brightness-110 active:scale-[0.98] transition-all shadow-xl shadow-primary-fixed/20 mt-4"
              >
                Generate Invitation Letter
              </button>
              <p className="text-center text-[10px] text-on-surface-variant uppercase tracking-widest leading-loose">
                By submitting, you authorize the organizing committee to use your data for visa processing support only.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
