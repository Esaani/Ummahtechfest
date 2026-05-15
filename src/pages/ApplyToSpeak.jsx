import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function ApplyToSpeak() {
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    title: '',
    organization: '',
    email: '',
    linkedin: '',
    bio: '',
    sessionTitle: '',
    track: '',
    format: '',
    audience: '',
    abstract: '',
    cospeakers: '',
    twitter: '',
    techRequirements: '',
    keyTakeaways: '',
    instagram: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true)
      window.scrollTo(0, 0)
    }, 500)
  }

  if (isSubmitted) {
    return (
      <main className="pt-20 animate-in fade-in duration-700">
        {/* Celebratory Hero Section */}
        <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden py-24">
          <div className="absolute inset-0 z-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #a3fa01 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
          </div>
          <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto text-center">
            <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary-fixed/20 border-2 border-primary-fixed glow-lime animate-bounce">
              <span className="material-symbols-outlined text-primary-fixed text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            </div>
            <h1 className="headline-xl text-headline-lg-mobile md:text-headline-xl mb-6 bg-gradient-to-r from-primary-fixed via-white to-secondary-fixed bg-clip-text text-transparent uppercase tracking-tighter">
              You're One Step Closer <br className="hidden md:block"/> to the Stage.
            </h1>
            <p className="body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              Your application for the Ummah Tech Fest Ghana has been successfully received. We're excited to review your submission and explore how your expertise can inspire our community.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container border border-outline-variant transition-all hover:border-primary-fixed/50">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                <span className="label-md font-bold uppercase tracking-widest text-[10px]">Confirmation sent to your email</span>
              </div>
            </div>
          </div>
        </section>

        {/* What's Next Roadmap */}
        <section className="py-24 bg-surface-container-low border-y border-outline-variant/10">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div data-aos="fade-right">
                <h2 className="headline-lg text-primary-fixed mb-4 uppercase">What's Next?</h2>
                <p className="body-md text-on-surface-variant">Track your journey from applicant to featured speaker.</p>
              </div>
              <div className="h-px flex-grow bg-outline-variant/30 mx-8 hidden md:block"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Phase 01 */}
              <div className="glass-card kente-border p-8 rounded-xl flex flex-col h-full relative overflow-hidden group transition-all hover:-translate-y-2" data-aos="fade-up" data-aos-delay="100">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="text-8xl font-black text-secondary">01</span>
                </div>
                <span className="label-md text-primary-fixed mb-4 uppercase tracking-widest font-bold">Phase 01</span>
                <h3 className="headline-sm mb-4">Application Review</h3>
                <p className="body-md text-on-surface-variant mb-6 flex-grow">
                  Our technical committee will review all submissions for alignment with our tracks, focusing on technical depth and cultural relevance.
                </p>
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-sm">calendar_today</span>
                  <span className="label-md font-bold">Oct 15 - Nov 15</span>
                </div>
              </div>

              {/* Phase 02 */}
              <div className="glass-card p-8 rounded-xl flex flex-col h-full border border-primary-fixed/30 relative transition-all hover:-translate-y-2" data-aos="fade-up" data-aos-delay="200">
                <div className="absolute -top-3 left-8 bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full label-md font-bold text-[10px] uppercase tracking-tighter shadow-lg shadow-primary-fixed/20">
                  UPCOMING
                </div>
                <span className="label-md text-primary-fixed mb-4 uppercase tracking-widest font-bold">Phase 02</span>
                <h3 className="headline-sm mb-4">Speaker Notification</h3>
                <p className="body-md text-on-surface-variant mb-6 flex-grow">
                  You will receive an email regarding the status of your application. Every applicant will be notified regardless of the outcome.
                </p>
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-sm">notifications_active</span>
                  <span className="label-md font-bold">Dec 01</span>
                </div>
              </div>

              {/* Phase 03 */}
              <div className="glass-card p-8 rounded-xl flex flex-col h-full opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500 hover:-translate-y-2" data-aos="fade-up" data-aos-delay="300">
                <span className="label-md text-primary-fixed mb-4 uppercase tracking-widest font-bold">Phase 03</span>
                <h3 className="headline-sm mb-4">Speaker Onboarding</h3>
                <p className="body-md text-on-surface-variant mb-6 flex-grow">
                  Selected speakers will begin their journey, finalize session logistics, and receive their exclusive speaker kit.
                </p>
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  <span className="label-md font-bold">Dec 15</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* In the Meantime Section */}
        <section className="py-24">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row items-center border border-outline-variant/30" data-aos="zoom-in">
              <div className="w-full md:w-1/2 p-12 space-y-6">
                <h2 className="headline-md mb-6 uppercase tracking-tight">In the Meantime...</h2>
                <p className="body-md text-on-surface-variant max-w-md">
                  Don't wait until December to get involved! Join the conversation and connect with other tech enthusiasts in our growing community.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <a className="flex items-center gap-3 bg-secondary text-on-secondary px-8 py-4 rounded-xl label-md font-bold transition-all hover:scale-105 hover:shadow-lg shadow-secondary/20 uppercase tracking-widest" href="#">
                    <span className="material-symbols-outlined">forum</span>
                    JOIN DISCORD
                  </a>
                  <a className="flex items-center gap-3 border-2 border-secondary text-secondary px-8 py-4 rounded-xl label-md font-bold transition-all hover:bg-secondary/10 hover:scale-105 uppercase tracking-widest" href="#">
                    <span className="material-symbols-outlined">alternate_email</span>
                    FOLLOW ON X
                  </a>
                </div>
              </div>
              <div className="w-full md:w-1/2 h-80 md:h-[500px] relative overflow-hidden">
                <img 
                  alt="Community engagement" 
                  className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" 
                  src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent hidden md:block"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-30 grayscale contrast-125" 
            alt="Conference atmosphere" 
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent"></div>
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full py-12 md:py-24">
          <div className="max-w-2xl space-y-6" data-aos="fade-right">
            <h1 className="headline-xl text-primary leading-tight uppercase">
              {step === 3 ? 'Review Your' : 'Shape the Future of'} <span className="text-primary-fixed">{step === 3 ? 'Application' : 'Muslim Tech'}</span>
            </h1>
            <p className="body-lg text-on-surface-variant max-w-lg">
              {step === 3 
                ? 'Please review your submission details carefully. This information will be used for speaker selection and event promotion.'
                : 'Join visionary thinkers in Accra to bridge spiritual heritage and digital innovation. Call for speakers 2026.'}
            </p>
          </div>
        </div>
      </section>

      {/* Progress Stepper */}
      <section className="py-12 px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto">
        <div className="relative flex justify-between items-center">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-highest -z-10 -translate-y-1/2"></div>
          <div className={`absolute top-1/2 left-0 h-[2px] bg-primary-fixed -z-10 -translate-y-1/2 transition-all duration-500 ${step === 1 ? 'w-0' : step === 2 ? 'w-1/2' : 'w-full'}`}></div>
          
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2 bg-background px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step > s ? 'bg-primary-fixed text-on-primary-fixed' : step === s ? 'bg-primary-fixed text-on-primary-fixed ring-4 ring-primary-fixed/20' : 'bg-surface-container-low text-on-surface-variant'}`}>
                {step > s ? <span className="material-symbols-outlined text-sm font-black">check</span> : s}
              </div>
              <span className={`label-md text-[10px] md:text-xs uppercase tracking-widest ${step >= s ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                {s === 1 ? 'Personal Info' : s === 2 ? 'Session Details' : 'Review'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Multi-step Application Form */}
      <section id="apply-form" className="pb-24 px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto">
        <form className="space-y-8">
          {step === 1 && (
            <div className="glass-panel p-8 md:p-12 rounded-2xl border-outline-variant/30 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="headline-sm text-primary border-l-4 border-primary-fixed pl-4">Personal Information</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Full Name</label>
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="Abubakar Diallo" 
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Email Address</label>
                  <input 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="abubakar@tech.com" 
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Professional Title</label>
                  <input 
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="Senior Architect" 
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Organization</label>
                  <input 
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="Savannah Tech Hub" 
                    type="text"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="label-md text-secondary block uppercase tracking-wider">Professional Bio</label>
                <textarea 
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                  placeholder="Tell us about your background and achievements..." 
                  rows="4"
                ></textarea>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="relative p-[2px] rounded-xl bg-gradient-to-r from-primary-fixed via-secondary to-primary-fixed">
                <div className="glass-panel p-8 md:p-12 rounded-xl space-y-8">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-primary-fixed/10 p-3 rounded-lg">
                      <span className="material-symbols-outlined text-primary-fixed">auto_stories</span>
                    </div>
                    <div>
                      <h2 className="headline-sm text-primary">Session Details</h2>
                      <p className="text-on-surface-variant text-sm">Tell us about the impact of your proposed session.</p>
                    </div>
                  </div>

                  {/* Speaker Profile Image Section */}
                  <div className="space-y-4">
                    <label className="label-md text-secondary block uppercase tracking-wider">Speaker Profile Image</label>
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-surface-container-low/50 border border-outline-variant/30 rounded-xl">
                      <div className="w-24 h-24 rounded-full bg-surface-container-high border-2 border-dashed border-primary-fixed/30 flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-primary-fixed">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant">account_circle</span>
                      </div>
                      <div className="flex-1 text-center sm:text-left space-y-3">
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                          <label className="cursor-pointer bg-primary-fixed text-on-primary-fixed px-6 py-2 rounded-lg label-md font-bold hover:bg-primary-fixed-dim transition-all active:scale-95">
                            Upload Photo
                            <input type="file" className="hidden" accept="image/*" />
                          </label>
                          <button type="button" className="text-on-surface-variant label-md hover:text-error transition-colors px-4 py-2">Remove</button>
                        </div>
                        <p className="text-on-surface-variant text-[10px] uppercase tracking-tighter">JPG or PNG, max 5MB • Recommended: Square 400x400px</p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media Profiles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label-md text-secondary block uppercase tracking-wider">LinkedIn Profile</label>
                      <div className="relative">
                        <input 
                          name="linkedin"
                          value={formData.linkedin}
                          onChange={handleChange}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 pl-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                          placeholder="linkedin.com/in/username" 
                          type="url"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">link</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="label-md text-secondary block uppercase tracking-wider">X (Twitter) Profile</label>
                      <div className="relative">
                        <input 
                          name="twitter"
                          value={formData.twitter}
                          onChange={handleChange}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 pl-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                          placeholder="@username" 
                          type="text"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">alternate_email</span>
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="label-md text-secondary block uppercase tracking-wider">Instagram Profile</label>
                      <div className="relative">
                        <input 
                          name="instagram"
                          value={formData.instagram}
                          onChange={handleChange}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 pl-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                          placeholder="@username" 
                          type="text"
                        />
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">alternate_email</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label-md text-secondary block uppercase tracking-wider">Proposed Session Title</label>
                    <input 
                      name="sessionTitle"
                      value={formData.sessionTitle}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="Enter a catchy and descriptive title" 
                      type="text"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="label-md text-secondary block uppercase tracking-wider">Track Selection</label>
                      <div className="relative">
                        <select 
                          name="track"
                          value={formData.track}
                          onChange={handleChange}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 pr-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all appearance-none cursor-pointer"
                        >
                          <option disabled value="">Select Track</option>
                          <option value="Ethical AI">Ethical AI</option>
                          <option value="Ummah Fintech">Ummah Fintech</option>
                          <option value="Web3 & Trust">Web3 & Trust</option>
                          <option value="Tech for Social Good">Tech for Social Good</option>
                          <option value="Global Connectivity">Global Connectivity</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="label-md text-secondary block uppercase tracking-wider">Session Format</label>
                      <div className="relative">
                        <select 
                          name="format"
                          value={formData.format}
                          onChange={handleChange}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 pr-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all appearance-none cursor-pointer"
                        >
                          <option disabled value="">Select Format</option>
                          <option value="Keynote">Keynote</option>
                          <option value="Workshop">Workshop</option>
                          <option value="Panel">Panel</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="label-md text-secondary block uppercase tracking-wider">Session Abstract</label>
                    <textarea 
                      name="abstract"
                      value={formData.abstract}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="Provide a detailed description of what attendees will learn..." 
                      rows="5"
                    ></textarea>
                    <p className="text-on-surface-variant text-[10px] text-right italic uppercase tracking-widest">Suggested: 200-500 words</p>
                  </div>

                  <div className="space-y-2">
                    <label className="label-md text-secondary block uppercase tracking-wider">Key Takeaways</label>
                    <textarea 
                      name="keyTakeaways"
                      value={formData.keyTakeaways}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="What are the top 3 things attendees will learn? (One per line)" 
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="space-y-4">
                    <label className="label-md text-secondary block uppercase tracking-wider">Technical Requirements</label>
                    <div className="flex items-start gap-4 p-4 bg-primary-fixed/5 border border-primary-fixed/20 rounded-lg">
                      <span className="material-symbols-outlined text-primary-fixed">info</span>
                      <p className="text-on-surface-variant label-md text-xs">Standard AV (Microphone, Projector) is provided. List any specific software, hardware, or connectivity needs here.</p>
                    </div>
                    <input 
                      name="techRequirements"
                      value={formData.techRequirements}
                      onChange={handleChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="e.g. High-speed Ethernet, VR hardware, extra power outlets" 
                      type="text"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Decoration */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
                <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary text-4xl">verified</span>
                  <div>
                    <h4 className="label-md text-primary font-bold">Peer Reviewed</h4>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">All sessions go through a double-blind community review process.</p>
                  </div>
                </div>
                <div className="glass-panel p-6 rounded-xl flex items-center gap-4">
                  <span className="material-symbols-outlined text-secondary text-4xl">language</span>
                  <div>
                    <h4 className="label-md text-primary font-bold">Global Reach</h4>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">Selected sessions will be streamed to over 50,000+ viewers globally.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              {/* Review Cards */}
              <div className="glass-panel p-8 rounded-xl relative overflow-hidden">
                <button onClick={() => setStep(1)} className="absolute top-4 right-4 flex items-center gap-2 text-secondary-fixed font-label-md hover:opacity-80 transition-all">
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                </button>
                <h3 className="font-headline-sm text-headline-sm mb-8 text-primary-fixed border-l-4 border-primary-fixed pl-4 uppercase tracking-tighter">Personal Information</h3>
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-10 pb-8 border-b border-outline-variant/20">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-primary-fixed shrink-0 shadow-lg shadow-primary-fixed/20 bg-surface-container-high">
                    <img alt="Profile Preview" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?q=80&w=300&auto=format&fit=crop"/>
                  </div>
                  <div className="flex flex-col justify-center text-center md:text-left space-y-2">
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Full Name</p>
                      <h4 className="font-headline-sm text-primary">{formData.fullName || 'Abdul-Mumin Issah'}</h4>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Professional Title</p>
                      <p className="font-body-lg text-secondary">{formData.title || 'Senior Cloud Architect'}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Email Address</p>
                    <p className="font-body-lg text-primary">{formData.email || 'mumin.tech@ghana.com'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Organization</p>
                    <p className="font-body-lg text-primary">{formData.organization || 'Savannah Tech Hub'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">LinkedIn</p>
                    <p className="font-body-lg text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary">link</span>
                      {formData.linkedin || 'linkedin.com/in/amissah'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">X (Twitter)</p>
                    <p className="font-body-lg text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary">alternate_email</span>
                      {formData.twitter || '@mumin_tech'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Instagram</p>
                    <p className="font-body-lg text-primary flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px] text-secondary">alternate_email</span>
                      {formData.instagram || '@mumin_tech'}
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Biography</p>
                    <p className="font-body-md text-on-surface leading-relaxed opacity-80">{formData.bio || 'A passionate technologist dedicated to bridging the gap between ethical Islamic values and modern engineering practices.'}</p>
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 rounded-xl relative overflow-hidden">
                <button onClick={() => setStep(2)} className="absolute top-4 right-4 flex items-center gap-2 text-secondary-fixed font-label-md hover:opacity-80 transition-all">
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                </button>
                <h3 className="font-headline-sm text-headline-sm mb-8 text-primary-fixed border-l-4 border-primary-fixed pl-4 uppercase tracking-tighter">Session Details</h3>
                <div className="space-y-8">
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Proposed Title</p>
                    <p className="font-body-lg text-primary font-bold">{formData.sessionTitle || 'Scaling Halal Fintech: Architectural Patterns for Ethical Growth'}</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Track</p>
                      <span className="inline-block px-3 py-1 rounded bg-secondary/20 text-secondary font-label-md border border-secondary/30">{formData.track || 'Fintech & Ethics'}</span>
                    </div>
                    <div className="space-y-1">
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Session Format</p>
                      <p className="font-body-lg text-primary">{formData.format || 'Workshop (90 mins)'}</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Abstract</p>
                    <p className="font-body-md text-on-surface leading-relaxed opacity-80">{formData.abstract || 'This session explores the technical challenges of building financial systems that strictly adhere to Sharia principles...'}</p>
                  </div>
                  <div className="space-y-3 pt-4">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Key Takeaways</p>
                    <div className="space-y-2">
                      {(formData.keyTakeaways || "Designing transaction logs for immutable ethical auditing.\nStrategies for regional compliance and cloud-agnostic deployment.").split('\n').map((line, i) => (
                        <div key={i} className="flex items-start gap-2 text-body-md text-on-surface">
                          <span className="material-symbols-outlined text-primary-fixed text-[20px]">check_circle</span>
                          {line}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Checklist & Submit */}
              <div className="pt-8 space-y-8">
                <label className="flex items-start gap-4 group cursor-pointer">
                  <input className="mt-1 w-5 h-5 rounded border-outline-variant bg-surface-container text-primary-fixed focus:ring-primary-fixed transition-all cursor-pointer" type="checkbox"/>
                  <p className="font-body-md text-on-surface-variant text-sm select-none">
                    I confirm that the information provided is accurate and I agree to the <a className="text-secondary underline hover:text-secondary-fixed transition-colors" href="#">Ummah Tech Fest Code of Conduct</a> and <a className="text-secondary underline hover:text-secondary-fixed transition-colors" href="#">Privacy Policy</a>.
                  </p>
                </label>

                <div className="flex flex-col md:flex-row gap-6">
                  <button 
                    type="button"
                    onClick={() => setStep(2)}
                    className="flex-1 border-2 border-outline-variant text-on-surface py-5 px-8 rounded-xl font-label-md hover:bg-surface-container transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">arrow_back</span> Back to Details
                  </button>
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    className="flex-[2] bg-primary-fixed text-on-primary-fixed py-5 px-8 rounded-xl font-headline-sm flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(163,250,1,0.3)] hover:scale-[1.02] transition-all uppercase tracking-widest font-black"
                  >
                    Submit Application <span className="material-symbols-outlined">rocket_launch</span>
                  </button>
                </div>
                <p className="text-center text-on-surface-variant font-label-md text-xs">
                  Decision notification will be sent via email by July 15th, 2026.
                </p>
              </div>
            </div>
          )}

          {/* Nav for Step 1 & 2 */}
          {step < 3 && (
            <div className="flex justify-between items-center pt-8">
              <button 
                type="button"
                onClick={() => setStep(Math.max(1, step - 1))}
                className={`btn-secondary flex items-center gap-2 ${step === 1 ? 'invisible' : ''}`}
              >
                <span className="material-symbols-outlined">arrow_back</span> Back
              </button>
              <button 
                type="button"
                onClick={() => setStep(step + 1)}
                className="btn-primary"
              >
                {step === 1 ? 'Next: Session Details' : 'Review Submission'}
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Guidelines & Timeline */}
      <section className="py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8" data-aos="fade-right">
          <div>
            <h2 className="headline-lg text-primary uppercase">Submission <span className="text-primary-fixed">Guidelines</span></h2>
            <p className="text-on-surface-variant mt-2">Help us maintain the highest standards for Ummah Tech Fest.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { title: "Keynotes", desc: "45-minute impactful sessions on the main stage. Visionary topics only.", border: "primary-fixed" },
              { title: "Workshops", desc: "90-minute technical or strategy sessions. Highly interactive and hands-on.", border: "secondary" },
              { title: "Original Content", desc: "Talks must be original and not previously presented at major regional events.", border: "primary-fixed" },
              { title: "Ethics First", desc: "Content must align with Islamic ethical principles and communal growth.", border: "secondary" }
            ].map((g, i) => (
              <div key={i} className={`glass-panel p-6 rounded-xl border-l-4 border-l-${g.border}`}>
                <h4 className="headline-sm text-primary mb-2 text-lg md:text-xl">{g.title}</h4>
                <p className="text-on-surface-variant text-sm md:text-base">{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-8" data-aos="fade-left">
          <h2 className="headline-lg text-primary uppercase">Timeline</h2>
          <div className="space-y-12 relative">
            <div className="absolute left-[23px] top-4 bottom-4 w-1 bg-outline-variant/30"></div>
            {[
              { date: "Oct 15, 2026", title: "Application Deadline", desc: "Final call for all speaker submissions.", icon: "event", color: "primary-fixed" },
              { date: "Nov 1, 2026", title: "Notification", desc: "Selected speakers will be officially notified.", icon: "notifications", color: "secondary" },
              { date: "Dec 12-14, 2026", title: "The Event", desc: "Live from Accra, Ghana.", icon: "celebration", color: "outline" }
            ].map((item, i) => (
              <div key={i} className={`relative flex gap-6 ${i === 2 ? 'opacity-50' : ''}`}>
                <div className={`z-10 w-12 h-12 rounded-full bg-surface-container-high border-2 border-${item.color} flex items-center justify-center flex-shrink-0`}>
                  <span className={`material-symbols-outlined text-${item.color} text-sm`}>{item.icon}</span>
                </div>
                <div>
                  <p className={`label-md text-${item.color}`}>{item.date}</p>
                  <h4 className="headline-sm text-primary text-lg">{item.title}</h4>
                  <p className="text-on-surface-variant text-xs">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
