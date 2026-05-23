import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import volunteerHero from '../assets/volunteer-hero.png'

export default function Volunteer() {
  const [step, setStep] = useState(1)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [formData, setFormData] = useState({
    // Step 1: Personal Info
    firstName: '',
    lastName: '',
    phoneNumber: '',
    emailAddress: '',
    dateOfBirth: '',
    gender: '',
    nationality: '',
    currentResidence: '',
    linkedinProfile: '',
    portfolioLink: '',
    
    // Step 1: Roles (array of strings)
    selectedRoles: [],

    // Step 2: Skills & Experience
    aboutYourself: '',
    skillsContribute: '',
    toolsTechnologies: '',
    portfolioUploadLink: '',
    hasVolunteeredBefore: '',
    previousVolunteerDesc: '',
    hasWorkedRelatedRoleBefore: '',
    previousWorkDesc: '',

    // Step 2: Coding Trainer & Tech Specific (Conditional)
    teachingLanguages: '',
    hasTaughtBefore: '',
    teachingExperienceDesc: '',
    teachingLevel: '',
    comfortableAgeGroups: [],
    canPrepareMaterials: '',

    // Step 3: Commitment & Motivation
    isAvailableFullTime: '',
    weeklyCommitmentHours: '',
    preferredCommunication: '',
    comfortableTeamEnvironment: '',
    meetDeadlinesResponsibilities: '',

    // Step 3: Motivation & Vision
    whyVolunteer: '',
    whatToGain: '',
    techImpactMuslimCommunity: '',
    whySelectYou: '',
    teamProblemSolvingSituation: '',

    // Step 3: Values & Professionalism
    willingToFollowConduct: '',
    agreeToRepresentRespectfully: '',
    communicationSkillsRating: '',
    reliabilityPunctualityRating: '',

    // Step 4: Final Declaration
    confirmAccuracy: false,
    declarationFullName: '',
    signatureOptional: '',
    declarationDate: new Date().toISOString().split('T')[0]
  })

  const [cvFile, setCvFile] = useState(null)
  const [passportFile, setPassportFile] = useState(null)
  const [cvDragOver, setCvDragOver] = useState(false)
  const [passportDragOver, setPassportDragOver] = useState(false)

  const handleFileChange = (e, setter) => {
    const file = e.target.files[0]
    if (file) setter(file)
  }

  const handleDrop = (e, setter, setDragOver) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) setter(file)
  }

  // Scroll to top when changing steps
  useEffect(() => {
    window.scrollTo(0, 0)
    setValidationError('')
  }, [step])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleRoleToggle = (role) => {
    setFormData(prev => {
      const selected = prev.selectedRoles.includes(role)
        ? prev.selectedRoles.filter(r => r !== role)
        : [...prev.selectedRoles, role]
      return { ...prev, selectedRoles: selected }
    })
  }

  const handleAgeGroupToggle = (ageGroup) => {
    setFormData(prev => {
      const selected = prev.comfortableAgeGroups.includes(ageGroup)
        ? prev.comfortableAgeGroups.filter(a => a !== ageGroup)
        : [...prev.comfortableAgeGroups, ageGroup]
      return { ...prev, comfortableAgeGroups: selected }
    })
  }

  // Check if user has selected a Technical & Training role
  const isTechnicalRoleSelected = () => {
    const technicalRoles = [
      'Coding Trainer', 
      'AI & Emerging Tech Facilitator', 
      'Tech Mentor', 
      'STEM Education Volunteer', 
      'Technical Support Volunteer'
    ]
    return formData.selectedRoles.some(role => technicalRoles.includes(role))
  }

  // Basic validation rules per step
  const validateStep = () => {
    if (step === 1) {
      if (!formData.firstName.trim()) return 'First Name is required.'
      if (!formData.lastName.trim()) return 'Last Name is required.'
      if (!formData.phoneNumber.trim()) return 'Phone Number is required.'
      if (!formData.emailAddress.trim()) return 'Email Address is required.'
      if (!formData.dateOfBirth) return 'Date of Birth is required.'
      if (!formData.gender) return 'Gender selection is required.'
      if (!formData.nationality.trim()) return 'Nationality is required.'
      if (!formData.currentResidence.trim()) return 'Current City / Residence is required.'
      if (formData.selectedRoles.length === 0) return 'Please select at least one Volunteer Role.'
    }

    if (step === 2) {
      if (!formData.aboutYourself.trim()) return 'Please tell us briefly about yourself.'
      if (!formData.skillsContribute.trim()) return 'Please describe the skills you can contribute.'
      if (!formData.toolsTechnologies.trim()) return 'Please list the tools, software, or technologies you know.'
      if (!cvFile) return 'Please upload your CV or Resume (PDF/DOC).'
      if (!passportFile) return 'Please upload a clear Passport or ID photo (JPG/PNG).'
      if (!formData.hasVolunteeredBefore) return 'Please specify if you have volunteered before.'
      if (formData.hasVolunteeredBefore === 'Yes' && !formData.previousVolunteerDesc.trim()) {
        return 'Please describe your previous volunteering experience.'
      }
      if (!formData.hasWorkedRelatedRoleBefore) return 'Please specify if you have worked in a related role.'
      if (formData.hasWorkedRelatedRoleBefore === 'Yes' && !formData.previousWorkDesc.trim()) {
        return 'Please describe your experience in that role.'
      }

      // Conditional Tech validation
      if (isTechnicalRoleSelected()) {
        if (!formData.teachingLanguages.trim()) return 'Please specify which programming languages/technologies you are comfortable teaching.'
        if (!formData.hasTaughtBefore) return 'Please specify if you have taught coding or technical skills before.'
        if (formData.hasTaughtBefore === 'Yes' && !formData.teachingExperienceDesc.trim()) {
          return 'Please describe your teaching/mentoring experience.'
        }
        if (!formData.teachingLevel) return 'Please select the competency level you can teach.'
        if (formData.comfortableAgeGroups.length === 0) return 'Please select at least one comfortable age group to teach.'
        if (!formData.canPrepareMaterials) return 'Please specify if you can prepare workshop materials.'
      }
    }

    if (step === 3) {
      if (!formData.isAvailableFullTime) return 'Please specify your availability for preparation, event days, and post-event support.'
      if (!formData.weeklyCommitmentHours) return 'Please specify how many hours per week you can commit.'
      if (!formData.preferredCommunication) return 'Please select your preferred communication platform.'
      if (!formData.comfortableTeamEnvironment) return 'Please specify if you are comfortable working in a team environment.'
      if (!formData.meetDeadlinesResponsibilities) return 'Please specify if you can meet deadlines and responsibilities.'

      if (!formData.whyVolunteer.trim()) return 'Please specify why you want to volunteer for Ummah Tech Fest.'
      if (!formData.whatToGain.trim()) return 'Please specify what you hope to gain from this experience.'
      if (!formData.techImpactMuslimCommunity.trim()) return 'Please specify how technology can positively impact the Muslim community.'
      if (!formData.whySelectYou.trim()) return 'Please tell us why we should select you as a volunteer.'
      if (!formData.teamProblemSolvingSituation.trim()) return 'Please describe a problem-solving situation.'

      if (!formData.willingToFollowConduct) return 'Please confirm if you are willing to follow the code of conduct.'
      if (!formData.agreeToRepresentRespectfully) return 'Please confirm if you agree to represent Ummah Tech Fest respectfully.'
      if (!formData.communicationSkillsRating) return 'Please rate your communication skills.'
      if (!formData.reliabilityPunctualityRating) return 'Please rate your reliability and punctuality.'
    }

    if (step === 4) {
      if (!formData.confirmAccuracy) return 'You must confirm that the provided information is accurate.'
      if (!formData.declarationFullName.trim()) return 'Declaration Full Name is required for signature.'
    }

    return ''
  }

  const handleNext = () => {
    const error = validateStep()
    if (error) {
      setValidationError(error)
      // Scroll to the error banner
      const banner = document.getElementById('error-banner')
      if (banner) {
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
      return
    }
    setStep(prev => prev + 1)
  }

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1))
  }

  const handleSubmit = (e) => {
    if (e) e.preventDefault()
    const error = validateStep()
    if (error) {
      setValidationError(error)
      return
    }

    // Simulate API call
    setTimeout(() => {
      setIsSubmitted(true)
      window.scrollTo(0, 0)
    }, 500)
  }

  // Predefined lists
  const rolesCategories = {
    technical: {
      title: 'Technical & Training',
      icon: 'code',
      items: ['Coding Trainer', 'AI & Emerging Tech Facilitator', 'Tech Mentor', 'STEM Education Volunteer', 'Technical Support Volunteer']
    },
    community: {
      title: 'Event & Community Support',
      icon: 'groups',
      items: ['Workshop Assistant', 'Guest Relations & Registration', 'Event Logistics & Operations', 'Community Outreach Ambassador']
    },
    creative: {
      title: 'Creative & Multimedia',
      icon: 'palette',
      items: ['Graphic Design', 'Motion Design', 'Photography', 'Videography', 'Video Editing', 'Social Media Content Creator']
    }
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
              <span className="material-symbols-outlined text-primary-fixed text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>handshake</span>
            </div>
            <h1 className="headline-xl text-headline-lg-mobile md:text-headline-xl mb-6 bg-gradient-to-r from-primary-fixed via-white to-secondary-fixed bg-clip-text text-transparent uppercase tracking-tighter">
              Welcome to the Crew! <br className="hidden md:block"/> Let's Build Together.
            </h1>
            <p className="body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">
              Assalamu Alaikum! Your application to volunteer at the Ummah Tech Fest Ghana has been successfully received. Thank you for dedicating your time, skills, and energy to serve the community.
            </p>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-6 py-3 rounded-full bg-surface-container border border-outline-variant transition-all hover:border-primary-fixed/50">
                <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>mail</span>
                <span className="label-md font-bold uppercase tracking-widest text-[10px]">Application Confirmation Sent</span>
              </div>
            </div>
          </div>
        </section>

        {/* Volunteer Journey Timeline */}
        <section className="py-24 bg-surface-container-low border-y border-outline-variant/10">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-4">
              <div data-aos="fade-right">
                <h2 className="headline-lg text-primary-fixed mb-4 uppercase">Your Volunteer Journey</h2>
                <p className="body-md text-on-surface-variant">Here is what you can expect as we prepare for the festival.</p>
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
                <h3 className="headline-sm mb-4">Application Screening</h3>
                <p className="body-md text-on-surface-variant mb-6 flex-grow">
                  Our organizing committee will review your skills and selected roles to align them with various team requirements.
                </p>
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-sm">event</span>
                  <span className="label-md font-bold">Within 2 Weeks</span>
                </div>
              </div>

              {/* Phase 02 */}
              <div className="glass-card p-8 rounded-xl flex flex-col h-full border border-primary-fixed/30 relative transition-all hover:-translate-y-2" data-aos="fade-up" data-aos-delay="200">
                <div className="absolute -top-3 left-8 bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded-full label-md font-bold text-[10px] uppercase tracking-tighter shadow-lg shadow-primary-fixed/20">
                  INTERVIEW & CHAT
                </div>
                <span className="label-md text-primary-fixed mb-4 uppercase tracking-widest font-bold">Phase 02</span>
                <h3 className="headline-sm mb-4">Team Alignment Interview</h3>
                <p className="body-md text-on-surface-variant mb-6 flex-grow">
                  Shortlisted candidates will be invited for a brief virtual coffee chat/interview to discuss roles, logistics, and expectations.
                </p>
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-sm">chat</span>
                  <span className="label-md font-bold">Scheduling via Email</span>
                </div>
              </div>

              {/* Phase 03 */}
              <div className="glass-card p-8 rounded-xl flex flex-col h-full opacity-70 hover:opacity-100 transition-all duration-500 hover:-translate-y-2" data-aos="fade-up" data-aos-delay="300">
                <span className="label-md text-primary-fixed mb-4 uppercase tracking-widest font-bold">Phase 03</span>
                <h3 className="headline-sm mb-4">Onboarding & Briefing</h3>
                <p className="body-md text-on-surface-variant mb-6 flex-grow">
                  Selected volunteers will join our communication channel (Discord/WhatsApp), receive training resources, and join team briefing sessions.
                </p>
                <div className="flex items-center gap-2 text-secondary">
                  <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  <span className="label-md font-bold">Nov 2026</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Community Section */}
        <section className="py-24">
          <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
            <div className="glass-card rounded-2xl overflow-hidden flex flex-col md:flex-row items-center border border-outline-variant/30" data-aos="zoom-in">
              <div className="w-full md:w-1/2 p-12 space-y-6">
                <h2 className="headline-md mb-6 uppercase tracking-tight">Stay Close with the Team</h2>
                <p className="body-md text-on-surface-variant max-w-md">
                  We post active announcements, preliminary meetups, and technical brainstorming in our main Discord and community groups. Join now to get a head start!
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <a className="flex items-center gap-3 bg-secondary text-on-secondary px-8 py-4 rounded-xl label-md font-bold transition-all hover:scale-105 hover:shadow-lg shadow-secondary/20 uppercase tracking-widest" href="#">
                    <span className="material-symbols-outlined">forum</span>
                    JOIN DISCORD
                  </a>
                  <a className="flex items-center gap-3 border-2 border-secondary text-secondary px-8 py-4 rounded-xl label-md font-bold transition-all hover:bg-secondary/10 hover:scale-105 uppercase tracking-widest" href="#">
                    <span className="material-symbols-outlined">alternate_email</span>
                    FOLLOW ON INSTAGRAM
                  </a>
                </div>
              </div>
              <div className="w-full md:w-1/2 h-80 md:h-[500px] relative overflow-hidden">
                <img 
                  alt="Ummah Tech Volunteer collaboration" 
                  className="w-full h-full object-cover scale-110 hover:scale-100 transition-transform duration-1000" 
                  src={volunteerHero}
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
      {/* Hero Header */}
      <section className="relative min-h-[40vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            className="w-full h-full object-cover opacity-20 grayscale contrast-125" 
            alt="Collaborative work environment" 
            src={volunteerHero}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full py-12 md:py-24">
          <div className="max-w-2xl space-y-6" data-aos="fade-right">
            <h1 className="headline-xl text-primary leading-tight uppercase">
              {step === 4 ? 'Review Your' : 'Serve the'} <span className="text-primary-fixed">{step === 4 ? 'Volunteer Form' : 'Ummah'}</span>
            </h1>
            <p className="body-lg text-on-surface-variant max-w-lg">
              {step === 4 
                ? 'Please review your application details thoroughly before submitting. We appreciate your dedication.'
                : 'Lend your skills, technical expertise, or creative talent to curate an outstanding Islamic tech gathering in Accra, Ghana.'}
            </p>
          </div>
        </div>
      </section>

      {/* Stepper */}
      <section className="py-8 px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto">
        <div className="relative flex justify-between items-center">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-surface-container-highest -z-10 -translate-y-1/2"></div>
          <div className={`absolute top-1/2 left-0 h-[2px] bg-primary-fixed -z-10 -translate-y-1/2 transition-all duration-500`}
               style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
          
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2 bg-background px-2 z-10">
              <button 
                type="button" 
                onClick={() => { if (s < step) setStep(s) }}
                disabled={s >= step}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-500 ${step > s ? 'bg-primary-fixed text-on-primary-fixed cursor-pointer' : step === s ? 'bg-primary-fixed text-on-primary-fixed ring-4 ring-primary-fixed/20' : 'bg-surface-container-low text-on-surface-variant cursor-not-allowed'}`}
              >
                {step > s ? <span className="material-symbols-outlined text-sm font-black">check</span> : s}
              </button>
              <span className={`label-md text-[9px] md:text-xs uppercase tracking-widest ${step >= s ? 'text-primary-fixed' : 'text-on-surface-variant'}`}>
                {s === 1 ? 'Personal Info' : s === 2 ? 'Skills & Tech' : s === 3 ? 'Motivation' : 'Review'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Form Container */}
      <section className="pb-24 px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto">
        {validationError && (
          <div id="error-banner" className="mb-6 p-4 bg-error-container border border-error rounded-xl flex items-start gap-3 text-on-error-container animate-in fade-in duration-300">
            <span className="material-symbols-outlined text-error text-xl shrink-0">error</span>
            <div>
              <h4 className="font-bold text-sm">Please correct the following:</h4>
              <p className="text-xs mt-1">{validationError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: Personal Info & Role Selection */}
          {step === 1 && (
            <div className="glass-panel p-8 md:p-12 rounded-2xl border-outline-variant/30 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="headline-sm text-primary border-l-4 border-primary-fixed pl-4 uppercase tracking-tighter">1. Personal Information</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">First Name *</label>
                  <input 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="Esaani" 
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Last Name *</label>
                  <input 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="Eliasu" 
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Phone Number *</label>
                  <input 
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="+233 24 000 0000" 
                    type="tel"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Email Address *</label>
                  <input 
                    name="emailAddress"
                    value={formData.emailAddress}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="esaan@ummahtech.com" 
                    type="email"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Date of Birth *</label>
                  <input 
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all cursor-pointer" 
                    type="date"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Gender *</label>
                  <div className="relative">
                    <select 
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all appearance-none cursor-pointer"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Nationality *</label>
                  <input 
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="Ghanaian" 
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Current City / Residence *</label>
                  <input 
                    name="currentResidence"
                    value={formData.currentResidence}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="Accra" 
                    type="text"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">LinkedIn Profile (Optional)</label>
                  <input 
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="https://linkedin.com/in/username" 
                    type="url"
                  />
                </div>
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Portfolio / Website / Social Media (Optional)</label>
                  <input 
                    name="portfolioLink"
                    value={formData.portfolioLink}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="https://github.com/username or your site" 
                    type="url"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-outline-variant/20 space-y-6">
                <div>
                  <h3 className="headline-sm text-primary border-l-4 border-secondary pl-4 uppercase tracking-tighter">2. Volunteer Role Selection</h3>
                  <p className="text-on-surface-variant text-xs mt-1">Select one or more roles you are interested in applying for. Select all that match your skills *</p>
                </div>

                <div className="space-y-8">
                  {Object.entries(rolesCategories).map(([key, cat]) => (
                    <div key={key} className="space-y-4">
                      <div className="flex items-center gap-2 text-primary-fixed">
                        <span className="material-symbols-outlined text-lg">{cat.icon}</span>
                        <h4 className="label-md uppercase tracking-widest font-black text-sm">{cat.title}</h4>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        {cat.items.map((role) => {
                          const isSelected = formData.selectedRoles.includes(role);
                          return (
                            <button
                              key={role}
                              type="button"
                              onClick={() => handleRoleToggle(role)}
                              className={`text-left p-4 rounded-xl border text-xs md:text-sm font-semibold transition-all duration-300 flex items-center justify-between ${
                                isSelected 
                                  ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed shadow-[0_0_15px_rgba(163,250,1,0.1)]' 
                                  : 'bg-surface-container-low border-outline-variant/30 text-on-surface hover:border-outline hover:bg-surface-container'
                              }`}
                            >
                              <span>{role}</span>
                              <span className="material-symbols-outlined shrink-0 text-sm pl-2">
                                {isSelected ? 'check_circle' : 'radio_button_unchecked'}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Skills, Experience & Conditional Tech Qs */}
          {step === 2 && (
            <div className="glass-panel p-8 md:p-12 rounded-2xl border-outline-variant/30 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <h3 className="headline-sm text-primary border-l-4 border-primary-fixed pl-4 uppercase tracking-tighter">2. Skills & Technical Experience</h3>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Tell us briefly about yourself *</label>
                  <textarea 
                    name="aboutYourself"
                    value={formData.aboutYourself}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="Introduce yourself, your background, studies, or career achievements..." 
                    rows="3"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">What skills can you contribute to Ummah Tech Fest? *</label>
                  <textarea 
                    name="skillsContribute"
                    value={formData.skillsContribute}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="Specific skills like React development, sound engineering, public relations, crowd management, video editing..." 
                    rows="3"
                  ></textarea>
                </div>

                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Which tools, software, or technologies do you know? *</label>
                  <input 
                    name="toolsTechnologies"
                    value={formData.toolsTechnologies}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="e.g. Figma, Git, Python, Premiere Pro, Zoom, Excel"
                    type="text"
                  />
                </div>

                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Link to your portfolio, CV, GitHub, or sample work (Optional)</label>
                  <input 
                    name="portfolioUploadLink"
                    value={formData.portfolioUploadLink}
                    onChange={handleInputChange}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                    placeholder="https://drive.google.com/your-cv-link or GitHub link" 
                    type="url"
                  />
                </div>

                {/* CV Upload */}
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Upload CV / Resume (PDF or DOC) *</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setCvDragOver(true) }}
                    onDragLeave={() => setCvDragOver(false)}
                    onDrop={(e) => handleDrop(e, setCvFile, setCvDragOver)}
                    className={`relative w-full rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${cvDragOver ? 'border-primary-fixed bg-primary-fixed/10 scale-[1.01]' : cvFile ? 'border-primary-fixed/60 bg-primary-fixed/5' : 'border-outline-variant/50 bg-surface-container-low hover:border-primary-fixed/40 hover:bg-surface-container'}`}
                  >
                    <label className="flex flex-col items-center justify-center gap-3 p-8 cursor-pointer w-full h-full">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => handleFileChange(e, setCvFile)}
                      />
                      <span className={`material-symbols-outlined text-4xl transition-colors ${cvFile ? 'text-primary-fixed' : 'text-on-surface-variant group-hover:text-primary-fixed/70'}`}>
                        {cvFile ? 'task' : 'upload_file'}
                      </span>
                      {cvFile ? (
                        <div className="text-center">
                          <p className="text-primary-fixed font-bold text-sm">{cvFile.name}</p>
                          <p className="text-on-surface-variant text-xs mt-1">{(cvFile.size / 1024).toFixed(0)} KB — Click to replace</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-on-surface font-semibold text-sm">Drag & drop your CV here, or <span className="text-primary-fixed underline">browse</span></p>
                          <p className="text-on-surface-variant text-xs mt-1">PDF, DOC or DOCX — Max 5MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* Passport Photo Upload */}
                <div className="space-y-2">
                  <label className="label-md text-secondary block uppercase tracking-wider">Upload Passport / ID Photo (JPG or PNG) *</label>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setPassportDragOver(true) }}
                    onDragLeave={() => setPassportDragOver(false)}
                    onDrop={(e) => handleDrop(e, setPassportFile, setPassportDragOver)}
                    className={`relative w-full rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${passportDragOver ? 'border-secondary bg-secondary/10 scale-[1.01]' : passportFile ? 'border-secondary/60 bg-secondary/5' : 'border-outline-variant/50 bg-surface-container-low hover:border-secondary/40 hover:bg-surface-container'}`}
                  >
                    <label className="flex flex-col items-center justify-center gap-3 p-8 cursor-pointer w-full h-full">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={(e) => handleFileChange(e, setPassportFile)}
                      />
                      {passportFile && passportFile.type.startsWith('image/') ? (
                        <img
                          src={URL.createObjectURL(passportFile)}
                          alt="Passport preview"
                          className="w-24 h-24 rounded-xl object-cover border-2 border-secondary/50 shadow-lg"
                        />
                      ) : (
                        <span className={`material-symbols-outlined text-4xl transition-colors ${passportFile ? 'text-secondary' : 'text-on-surface-variant group-hover:text-secondary/70'}`}>
                          {passportFile ? 'badge' : 'add_a_photo'}
                        </span>
                      )}
                      {passportFile ? (
                        <div className="text-center">
                          <p className="text-secondary font-bold text-sm">{passportFile.name}</p>
                          <p className="text-on-surface-variant text-xs mt-1">{(passportFile.size / 1024).toFixed(0)} KB — Click to replace</p>
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-on-surface font-semibold text-sm">Drag & drop your passport photo, or <span className="text-secondary underline">browse</span></p>
                          <p className="text-on-surface-variant text-xs mt-1">JPG or PNG — Max 3MB — Clear, well-lit photo</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  {/* Previous Volunteering */}
                  <div className="space-y-3">
                    <label className="label-md text-secondary block uppercase tracking-wider">Have you volunteered before? *</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.hasVolunteeredBefore === opt ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'}`}>
                          <span>{opt}</span>
                          <input 
                            name="hasVolunteeredBefore" 
                            type="radio" 
                            value={opt} 
                            checked={formData.hasVolunteeredBefore === opt} 
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-fixed border-outline focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Related professional work */}
                  <div className="space-y-3">
                    <label className="label-md text-secondary block uppercase tracking-wider">Have you worked in a tech, creative, or community role before? *</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.hasWorkedRelatedRoleBefore === opt ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'}`}>
                          <span>{opt}</span>
                          <input 
                            name="hasWorkedRelatedRoleBefore" 
                            type="radio" 
                            value={opt} 
                            checked={formData.hasWorkedRelatedRoleBefore === opt} 
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-fixed border-outline focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {formData.hasVolunteeredBefore === 'Yes' && (
                  <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                    <label className="label-md text-secondary block uppercase tracking-wider">Describe your previous volunteer experience *</label>
                    <textarea 
                      name="previousVolunteerDesc"
                      value={formData.previousVolunteerDesc}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="Which event/org, what was your role, and what did you achieve?" 
                      rows="3"
                    ></textarea>
                  </div>
                )}

                {formData.hasWorkedRelatedRoleBefore === 'Yes' && (
                  <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                    <label className="label-md text-secondary block uppercase tracking-wider">Describe your professional/related experience *</label>
                    <textarea 
                      name="previousWorkDesc"
                      value={formData.previousWorkDesc}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="Details about your professional technical, event, or community outreach background..." 
                      rows="3"
                    ></textarea>
                  </div>
                )}
              </div>

              {/* Conditional Coding Trainer / Tech section */}
              {isTechnicalRoleSelected() && (
                <div className="pt-8 border-t border-outline-variant/20 space-y-6 animate-in fade-in duration-500">
                  <div className="p-4 bg-primary-fixed/5 border border-primary-fixed/20 rounded-xl flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary-fixed">school</span>
                    <h4 className="label-md text-primary font-bold uppercase tracking-wider">Questions for Coding Trainers & Technical Volunteers</h4>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="label-md text-secondary block uppercase tracking-wider">What programming languages or technologies are you comfortable teaching? *</label>
                      <input 
                        name="teachingLanguages"
                        value={formData.teachingLanguages}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                        placeholder="e.g. Scratch, Python, HTML/CSS, JavaScript, React, Flutter, SQL" 
                        type="text"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="label-md text-secondary block uppercase tracking-wider">Have you taught coding or technical skills before? *</label>
                        <div className="flex gap-4">
                          {['Yes', 'No'].map((opt) => (
                            <label key={opt} className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.hasTaughtBefore === opt ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'}`}>
                              <span>{opt}</span>
                              <input 
                                name="hasTaughtBefore" 
                                type="radio" 
                                value={opt} 
                                checked={formData.hasTaughtBefore === opt} 
                                onChange={handleInputChange}
                                className="w-4 h-4 text-primary-fixed border-outline focus:ring-0 focus:ring-offset-0 cursor-pointer"
                              />
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="label-md text-secondary block uppercase tracking-wider">What level can you teach? *</label>
                        <div className="relative">
                          <select 
                            name="teachingLevel"
                            value={formData.teachingLevel}
                            onChange={handleInputChange}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all appearance-none cursor-pointer"
                          >
                            <option value="">Select Level</option>
                            <option value="Beginners">Beginners</option>
                            <option value="Intermediate">Intermediate</option>
                            <option value="Advanced">Advanced</option>
                            <option value="All Levels">All Levels (Beginner to Advanced)</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                        </div>
                      </div>
                    </div>

                    {formData.hasTaughtBefore === 'Yes' && (
                      <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                        <label className="label-md text-secondary block uppercase tracking-wider">Describe your teaching or mentoring experience *</label>
                        <textarea 
                          name="teachingExperienceDesc"
                          value={formData.teachingExperienceDesc}
                          onChange={handleInputChange}
                          className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                          placeholder="Tell us about the courses, bootcamps, workshops, or kids classes you facilitated..." 
                          rows="3"
                        ></textarea>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <label className="label-md text-secondary block uppercase tracking-wider">Which age groups are you comfortable teaching? *</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Kids (8-12)', 'Teens (13-17)', 'Adults (18+)'].map((age) => {
                            const isSelected = formData.comfortableAgeGroups.includes(age);
                            return (
                              <button
                                key={age}
                                type="button"
                                onClick={() => handleAgeGroupToggle(age)}
                                className={`p-3 rounded-lg border text-xs text-center transition-all ${
                                  isSelected 
                                    ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed font-bold' 
                                    : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant hover:border-outline'
                                }`}
                              >
                                {age}
                              </button>
                            )
                          })}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="label-md text-secondary block uppercase tracking-wider">Can you prepare workshop materials, slides, or exercises? *</label>
                        <div className="flex gap-4">
                          {['Yes', 'No'].map((opt) => (
                            <label key={opt} className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.canPrepareMaterials === opt ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'}`}>
                              <span>{opt}</span>
                              <input 
                                name="canPrepareMaterials" 
                                type="radio" 
                                value={opt} 
                                checked={formData.canPrepareMaterials === opt} 
                                onChange={handleInputChange}
                                className="w-4 h-4 text-primary-fixed border-outline focus:ring-0 focus:ring-offset-0 cursor-pointer"
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Commitment, Motivation & Values */}
          {step === 3 && (
            <div className="glass-panel p-8 md:p-12 rounded-2xl border-outline-variant/30 space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {/* Availability & Commitment */}
              <div className="space-y-6">
                <h3 className="headline-sm text-primary border-l-4 border-primary-fixed pl-4 uppercase tracking-tighter">3. Availability & Commitment</h3>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="label-md text-secondary block uppercase tracking-wider">Are you available for pre-event prep, event days, and post-event support? *</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.isAvailableFullTime === opt ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'}`}>
                          <span>{opt}</span>
                          <input 
                            name="isAvailableFullTime" 
                            type="radio" 
                            value={opt} 
                            checked={formData.isAvailableFullTime === opt} 
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-fixed border-outline focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="label-md text-secondary block uppercase tracking-wider">How many hours per week can you commit? *</label>
                    <div className="relative">
                      <select 
                        name="weeklyCommitmentHours"
                        value={formData.weeklyCommitmentHours}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select commitment hours</option>
                        <option value="1-3 Hours">1-3 Hours</option>
                        <option value="3-6 Hours">3-6 Hours</option>
                        <option value="6-10 Hours">6-10 Hours</option>
                        <option value="10+ Hours">10+ Hours</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="label-md text-secondary block uppercase tracking-wider">Preferred communication platform *</label>
                    <div className="relative">
                      <select 
                        name="preferredCommunication"
                        value={formData.preferredCommunication}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select Platform</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Telegram">Telegram</option>
                        <option value="Discord">Discord</option>
                        <option value="Email">Email</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="label-md text-secondary block uppercase tracking-wider">Are you comfortable working in a team environment? *</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.comfortableTeamEnvironment === opt ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'}`}>
                          <span>{opt}</span>
                          <input 
                            name="comfortableTeamEnvironment" 
                            type="radio" 
                            value={opt} 
                            checked={formData.comfortableTeamEnvironment === opt} 
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-fixed border-outline focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="label-md text-secondary block uppercase tracking-wider">Can you meet deadlines and handle assigned responsibilities? *</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.meetDeadlinesResponsibilities === opt ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'}`}>
                          <span>{opt}</span>
                          <input 
                            name="meetDeadlinesResponsibilities" 
                            type="radio" 
                            value={opt} 
                            checked={formData.meetDeadlinesResponsibilities === opt} 
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-fixed border-outline focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Motivation & Vision */}
              <div className="pt-6 border-t border-outline-variant/20 space-y-6">
                <h3 className="headline-sm text-primary border-l-4 border-secondary pl-4 uppercase tracking-tighter">4. Motivation & Vision</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="label-md text-secondary block uppercase tracking-wider">Why do you want to volunteer for Ummah Tech Fest? *</label>
                    <textarea 
                      name="whyVolunteer"
                      value={formData.whyVolunteer}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="Explain your passion, drive, and personal interest in this event..." 
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="label-md text-secondary block uppercase tracking-wider">What do you hope to gain from this experience? *</label>
                    <textarea 
                      name="whatToGain"
                      value={formData.whatToGain}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="Networking, learning tech skills, public speaking confidence, event operations skill set..." 
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="label-md text-secondary block uppercase tracking-wider">How do you think technology can positively impact the Muslim community? *</label>
                    <textarea 
                      name="techImpactMuslimCommunity"
                      value={formData.techImpactMuslimCommunity}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="Share your vision of technology, ethical design, halal fintech, educational models..." 
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="label-md text-secondary block uppercase tracking-wider">Why should we select you as a volunteer? *</label>
                    <textarea 
                      name="whySelectYou"
                      value={formData.whySelectYou}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="What makes you stand out? Your dedication, reliability, specific technical or hosting skills..." 
                      rows="3"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="label-md text-secondary block uppercase tracking-wider">Describe a situation where you solved a problem while working with a team *</label>
                    <textarea 
                      name="teamProblemSolvingSituation"
                      value={formData.teamProblemSolvingSituation}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all" 
                      placeholder="Briefly describe the challenge, your action, and the outcome..." 
                      rows="3"
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Values & Professionalism */}
              <div className="pt-6 border-t border-outline-variant/20 space-y-6">
                <h3 className="headline-sm text-primary border-l-4 border-primary-fixed pl-4 uppercase tracking-tighter">5. Values & Professionalism</h3>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="label-md text-secondary block uppercase tracking-wider">Are you willing to follow code of conduct? *</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.willingToFollowConduct === opt ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'}`}>
                          <span>{opt}</span>
                          <input 
                            name="willingToFollowConduct" 
                            type="radio" 
                            value={opt} 
                            checked={formData.willingToFollowConduct === opt} 
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-fixed border-outline focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="label-md text-secondary block uppercase tracking-wider">Do you agree to represent Ummah Tech respectfully? *</label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map((opt) => (
                        <label key={opt} className={`flex-1 flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${formData.agreeToRepresentRespectfully === opt ? 'bg-primary-fixed/10 border-primary-fixed text-primary-fixed' : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'}`}>
                          <span>{opt}</span>
                          <input 
                            name="agreeToRepresentRespectfully" 
                            type="radio" 
                            value={opt} 
                            checked={formData.agreeToRepresentRespectfully === opt} 
                            onChange={handleInputChange}
                            className="w-4 h-4 text-primary-fixed border-outline focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="label-md text-secondary block uppercase tracking-wider">Rate your communication skills *</label>
                    <div className="relative">
                      <select 
                        name="communicationSkillsRating"
                        value={formData.communicationSkillsRating}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select rating</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                        <option value="Beginner">Beginner</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="label-md text-secondary block uppercase tracking-wider">Rate your reliability and punctuality *</label>
                    <div className="relative">
                      <select 
                        name="reliabilityPunctualityRating"
                        value={formData.reliabilityPunctualityRating}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-12 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all appearance-none cursor-pointer"
                      >
                        <option value="">Select rating</option>
                        <option value="Excellent">Excellent</option>
                        <option value="Good">Good</option>
                        <option value="Average">Average</option>
                        <option value="Beginner">Beginner</option>
                      </select>
                      <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Review all details */}
          {step === 4 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              
              {/* Review Section: Personal details & roles */}
              <div className="glass-panel p-8 rounded-xl relative overflow-hidden">
                <button type="button" onClick={() => setStep(1)} className="absolute top-4 right-4 flex items-center gap-2 text-secondary-fixed font-label-md hover:opacity-80 transition-all">
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                </button>
                <h3 className="font-headline-sm text-headline-sm mb-6 text-primary-fixed border-l-4 border-primary-fixed pl-4 uppercase tracking-tighter">1. Personal Info & Selected Roles</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 pb-6 border-b border-outline-variant/20">
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">First & Last Name</p>
                    <h4 className="font-headline-sm text-primary text-lg font-bold">{formData.firstName} {formData.lastName}</h4>
                  </div>
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Email Address</p>
                    <p className="font-body-lg text-primary">{formData.emailAddress}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Phone Number</p>
                    <p className="font-body-lg text-primary">{formData.phoneNumber}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Date of Birth & Gender</p>
                    <p className="font-body-lg text-primary">{formData.dateOfBirth} / {formData.gender}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">Nationality & Residence</p>
                    <p className="font-body-lg text-primary">{formData.nationality} • {formData.currentResidence}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px]">LinkedIn / Social Links</p>
                    <p className="font-body-lg text-primary truncate">
                      {formData.linkedinProfile || 'N/A'} {formData.portfolioLink ? `• ${formData.portfolioLink}` : ''}
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-3">Selected Roles</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedRoles.map((role) => (
                      <span key={role} className="inline-block px-3 py-1 rounded bg-secondary/15 text-secondary font-label-md border border-secondary/30 text-xs font-bold uppercase tracking-wider">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Review Section: Skills & Experience */}
              <div className="glass-panel p-8 rounded-xl relative overflow-hidden">
                <button type="button" onClick={() => setStep(2)} className="absolute top-4 right-4 flex items-center gap-2 text-secondary-fixed font-label-md hover:opacity-80 transition-all">
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                </button>
                <h3 className="font-headline-sm text-headline-sm mb-6 text-primary-fixed border-l-4 border-primary-fixed pl-4 uppercase tracking-tighter">2. Skills & Tech Experience</h3>
                
                <div className="space-y-6">
                  <div>
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">About Me</p>
                    <p className="font-body-md text-on-surface text-sm md:text-base leading-relaxed opacity-85">{formData.aboutYourself}</p>
                  </div>
                  <div>
                    <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Skills Contributed</p>
                    <p className="font-body-md text-on-surface text-sm md:text-base leading-relaxed opacity-85">{formData.skillsContribute}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Tools & Tech Known</p>
                      <p className="font-body-lg text-primary text-sm font-bold">{formData.toolsTechnologies}</p>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Portfolio Link</p>
                      <p className="font-body-lg text-primary text-sm truncate">{formData.portfolioUploadLink || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">CV / Resume</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="material-symbols-outlined text-primary-fixed text-base">task</span>
                        <p className="font-body-lg text-primary-fixed text-sm font-bold truncate">{cvFile ? cvFile.name : 'Not uploaded'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Passport / ID Photo</p>
                      <div className="flex items-center gap-2 mt-1">
                        {passportFile && passportFile.type.startsWith('image/') ? (
                          <img src={URL.createObjectURL(passportFile)} alt="Passport" className="w-10 h-10 rounded-lg object-cover border border-secondary/50" />
                        ) : (
                          <span className="material-symbols-outlined text-secondary text-base">badge</span>
                        )}
                        <p className="font-body-lg text-secondary text-sm font-bold truncate">{passportFile ? passportFile.name : 'Not uploaded'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 border-t border-outline-variant/10 pt-4">
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Volunteered Before?</p>
                      <p className="font-body-lg text-primary font-bold">{formData.hasVolunteeredBefore}</p>
                      {formData.hasVolunteeredBefore === 'Yes' && (
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{formData.previousVolunteerDesc}</p>
                      )}
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Related Professional Work?</p>
                      <p className="font-body-lg text-primary font-bold">{formData.hasWorkedRelatedRoleBefore}</p>
                      {formData.hasWorkedRelatedRoleBefore === 'Yes' && (
                        <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{formData.previousWorkDesc}</p>
                      )}
                    </div>
                  </div>

                  {isTechnicalRoleSelected() && (
                    <div className="border-t border-outline-variant/20 pt-6 space-y-4">
                      <h4 className="label-md font-bold text-primary-fixed uppercase tracking-wider">Coding Trainer / Tech Specific Responses</h4>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-xs md:text-sm">
                        <div className="md:col-span-2">
                          <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Teach Languages</p>
                          <p className="text-primary font-bold">{formData.teachingLanguages}</p>
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Taught Coding Before?</p>
                          <p className="text-primary font-bold">{formData.hasTaughtBefore}</p>
                          {formData.hasTaughtBefore === 'Yes' && (
                            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">{formData.teachingExperienceDesc}</p>
                          )}
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Teach Competency & Age Groups</p>
                          <p className="text-primary font-bold">{formData.teachingLevel} Level</p>
                          <p className="text-xs text-on-surface-variant mt-1">Comfortable ages: {formData.comfortableAgeGroups.join(', ')}</p>
                        </div>
                        <div>
                          <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Prepare slides/exercises?</p>
                          <p className="text-primary font-bold">{formData.canPrepareMaterials}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Review Section: Commitment, Motivation & Values */}
              <div className="glass-panel p-8 rounded-xl relative overflow-hidden">
                <button type="button" onClick={() => setStep(3)} className="absolute top-4 right-4 flex items-center gap-2 text-secondary-fixed font-label-md hover:opacity-80 transition-all">
                  <span className="material-symbols-outlined text-[18px]">edit</span> Edit
                </button>
                <h3 className="font-headline-sm text-headline-sm mb-6 text-primary-fixed border-l-4 border-primary-fixed pl-4 uppercase tracking-tighter">3. Commitment, Motivation & Values</h3>
                
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6 pb-6 border-b border-outline-variant/20">
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Availability & Weekly Hours</p>
                      <p className="font-body-md text-primary font-bold">Event Days Available: {formData.isAvailableFullTime}</p>
                      <p className="text-xs text-on-surface-variant mt-1">Committing: {formData.weeklyCommitmentHours} per week</p>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Platform & Teamwork</p>
                      <p className="font-body-md text-primary font-bold">Comm Platform: {formData.preferredCommunication}</p>
                      <p className="text-xs text-on-surface-variant mt-1">Team Player: {formData.comfortableTeamEnvironment} • Meets Deadlines: {formData.meetDeadlinesResponsibilities}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pb-6 border-b border-outline-variant/20">
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Why do you want to volunteer?</p>
                      <p className="text-sm text-on-surface leading-relaxed opacity-85">{formData.whyVolunteer}</p>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">What do you hope to gain?</p>
                      <p className="text-sm text-on-surface leading-relaxed opacity-85">{formData.whatToGain}</p>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Impact of Technology on the Muslim Community</p>
                      <p className="text-sm text-on-surface leading-relaxed opacity-85">{formData.techImpactMuslimCommunity}</p>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Why should we select you?</p>
                      <p className="text-sm text-on-surface leading-relaxed opacity-85">{formData.whySelectYou}</p>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Team Problem Solving Example</p>
                      <p className="text-sm text-on-surface leading-relaxed opacity-85">{formData.teamProblemSolvingSituation}</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6 text-xs md:text-sm">
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Follow Code of Conduct & Respectfully Represent</p>
                      <p className="text-primary font-bold">Follow Code of Conduct: {formData.willingToFollowConduct}</p>
                      <p className="text-primary font-bold mt-1">Respectfully Represent: {formData.agreeToRepresentRespectfully}</p>
                    </div>
                    <div>
                      <p className="font-label-md text-on-surface-variant uppercase tracking-wider text-[10px] mb-1">Self-rated Professionalism</p>
                      <p className="text-primary font-bold">Communication Skills: {formData.communicationSkillsRating}</p>
                      <p className="text-primary font-bold mt-1">Reliability & Punctuality: {formData.reliabilityPunctualityRating}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Declarations & Submissions */}
              <div className="pt-8 space-y-8">
                <div className="p-6 bg-surface-container-high border border-outline-variant/30 rounded-2xl space-y-6">
                  <h4 className="label-md font-black text-secondary uppercase tracking-widest text-sm">Final Declaration</h4>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    I confirm that the information provided is accurate and truthful. I understand that submitting this application does not guarantee selection, and I agree to contribute positively to Ummah Tech Fest if selected.
                  </p>

                  <label className="flex items-start gap-4 group cursor-pointer border-t border-outline-variant/10 pt-4">
                    <input 
                      name="confirmAccuracy"
                      checked={formData.confirmAccuracy}
                      onChange={handleInputChange}
                      className="mt-1 w-5 h-5 rounded border-outline-variant bg-surface-container text-primary-fixed focus:ring-primary-fixed transition-all cursor-pointer" 
                      type="checkbox"
                    />
                    <p className="font-body-md text-on-surface-variant text-xs md:text-sm select-none">
                      I confirm and agree to the declaration above *
                    </p>
                  </label>

                  <div className="grid md:grid-cols-3 gap-6 pt-4">
                    <div className="space-y-2">
                      <label className="label-md text-secondary block uppercase tracking-wider">Full Name (Signature) *</label>
                      <input 
                        name="declarationFullName"
                        value={formData.declarationFullName}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all font-serif italic text-lg" 
                        placeholder="Esaani Eliasu" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-md text-secondary block uppercase tracking-wider">Signature Initials (Optional)</label>
                      <input 
                        name="signatureOptional"
                        value={formData.signatureOptional}
                        onChange={handleInputChange}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all font-serif italic text-lg" 
                        placeholder="EE" 
                        type="text"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="label-md text-secondary block uppercase tracking-wider">Date</label>
                      <input 
                        name="declarationDate"
                        value={formData.declarationDate}
                        readOnly
                        className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-lg px-4 py-3 text-on-surface-variant cursor-not-allowed outline-none" 
                        type="date"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-6">
                  <button 
                    type="button"
                    onClick={handleBack}
                    className="flex-1 border-2 border-outline-variant text-on-surface py-5 px-8 rounded-xl font-label-md hover:bg-surface-container transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">arrow_back</span> Back to Motivation
                  </button>
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    className="flex-[2] bg-primary-fixed text-on-primary-fixed py-5 px-8 rounded-xl font-headline-sm flex items-center justify-center gap-3 hover:shadow-[0_0_20px_rgba(163,250,1,0.3)] hover:scale-[1.02] transition-all uppercase tracking-widest font-black"
                  >
                    Submit Application <span className="material-symbols-outlined">send</span>
                  </button>
                </div>
                <p className="text-center text-on-surface-variant font-label-md text-xs">
                  We will evaluate and reply to you on a rolling basis. Thank you for your support!
                </p>
              </div>
            </div>
          )}

          {/* Stepper Buttons for Step 1, 2 & 3 */}
          {step < 4 && (
            <div className="flex justify-between items-center pt-8">
              <button 
                type="button"
                onClick={handleBack}
                className={`btn-secondary flex items-center gap-2 ${step === 1 ? 'invisible' : ''}`}
              >
                <span className="material-symbols-outlined">arrow_back</span> Back
              </button>
              <button 
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center gap-2"
              >
                {step === 1 ? 'Next: Skills & Experience' : step === 2 ? 'Next: Commitment' : 'Review Application'}
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}
        </form>
      </section>

      {/* Guidelines Section */}
      <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-t border-outline-variant/10">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8" data-aos="fade-right">
            <div>
              <h2 className="headline-lg text-primary uppercase">Volunteer <span className="text-primary-fixed">Guidelines</span></h2>
              <p className="text-on-surface-variant mt-2">What it takes to represent Ummah Tech Fest with honor, professionalism, and excellence.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: "Commitment First", desc: "Arrive on time, complete preparation sessions, and respect assigned schedules and shifts.", border: "primary-fixed" },
                { title: "Ethical Conduct", desc: "Maintain the highest standards of Islamic manners (Adab), professional speech, and respectful boundaries.", border: "secondary" },
                { title: "Collaboration & Support", desc: "Collaborate generously across domains, support other crew members, and prioritize guests.", border: "primary-fixed" },
                { title: "Tech & Innovation", desc: "Be ready to learn and handle tech, digital checklists, and registration hubs with ease.", border: "secondary" }
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
                { date: "Rolling Basis", title: "Applications Open", desc: "Register early so we can place you in your preferred roles.", icon: "edit_note", color: "primary-fixed" },
                { date: "Oct 2026", title: "Interviews & Teams", desc: "Meet your lead and review domain assignments.", icon: "diversity_1", color: "secondary" },
                { date: "Nov 2026", title: "Accra Festival Days", desc: "Be on-ground to shape a magnificent Ummah Tech experience.", icon: "celebration", color: "outline" }
              ].map((item, i) => (
                <div key={i} className="relative flex gap-6">
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
        </div>
      </section>
    </main>
  )
}
