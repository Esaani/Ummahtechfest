import { Link } from 'react-router-dom'

export default function SignUp() {
  const passes = [
    {
      id: 'delegate',
      title: 'Delegate Pass',
      icon: 'badge',
      color: 'primary-fixed',
      bg: 'primary-fixed/10',
      tag: 'Open',
      tagBg: 'bg-primary-container text-on-primary-container',
      desc: "Full Summit access for fintech professionals, ecosystem builders, corporate delegates, and anyone shaping Africa's digital economy.",
      features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
      cta: 'Register as Delegate',
      path: '/create-account'
    },
    {
      id: 'policy',
      title: 'Policy Pass',
      icon: 'account_balance',
      color: 'secondary',
      bg: 'secondary/10',
      tag: 'Approval',
      tagBg: 'bg-secondary-container text-on-secondary-container',
      desc: 'For government officials, policymakers, central bank staff, regulators, multilateral agencies, DFIs, and non-profit foundations.',
      features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
      cta: 'Apply for Policy Pass',
      outline: true,
      path: '/special-access'
    },
    {
      id: 'investor',
      title: 'Investor Pass',
      icon: 'monitoring',
      color: 'secondary',
      bg: 'secondary/10',
      tag: 'Approval',
      tagBg: 'bg-secondary-container text-on-secondary-container',
      desc: 'For venture capitalists, private equity, angel investors, impact investors, and investment fund managers seeking deal flow in Africa.',
      features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
      cta: 'Apply for Investor Pass',
      outline: true,
      path: '/special-access'
    },
    {
      id: 'startup',
      title: 'Startup Pass',
      icon: 'rocket_launch',
      color: 'primary-fixed',
      bg: 'primary-fixed/10',
      tag: 'Open',
      tagBg: 'bg-primary-container text-on-primary-container',
      desc: 'For founders and co-founders of early-stage startups (incorporated within the last 5 years). Application-based selection.',
      features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
      cta: 'Register as Startup',
      path: '/create-account'
    },
    {
      id: 'academic',
      title: 'Academic Pass',
      icon: 'school',
      color: 'secondary',
      bg: 'secondary/10',
      tag: 'Approval',
      tagBg: 'bg-secondary-container text-on-secondary-container',
      desc: 'For professors, researchers, and staff from universities. Valid institutional credentials required for processing.',
      features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
      cta: 'Apply for Academic Pass',
      outline: true,
      path: '/special-access'
    },
    {
      id: 'student',
      title: 'Student Pass',
      icon: 'person',
      color: 'primary-fixed',
      bg: 'primary-fixed/10',
      tag: 'Open',
      tagBg: 'bg-primary-container text-on-primary-container',
      desc: 'For currently enrolled students from any educational institution. Valid student ID required at check-in desk.',
      features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
      cta: 'Register as Student',
      path: '/create-account'
    },
    {
      id: 'media',
      title: 'Media Pass',
      icon: 'movie_filter',
      color: 'secondary',
      bg: 'secondary/10',
      tag: 'Accreditation',
      tagBg: 'bg-secondary-container text-on-secondary-container',
      desc: 'For accredited journalists and media professionals from recognized local and international press organizations.',
      features: ['Main Stage Plenary', 'All Thematic Tracks', 'Innovation Hub & Exhibition'],
      cta: 'Apply for Media Pass',
      outline: true,
      colSpan: 'lg:col-start-2',
      path: '/special-access'
    }
  ]

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed font-body kente-pattern pb-24">
      <main className="pt-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        {/* Header Section */}
        <header className="text-center mb-16 md:mb-24" data-aos="fade-up">
          <h1 className="headline-xl mb-6 tracking-tight">Choose your pass</h1>
          <p className="body-lg text-on-surface-variant max-w-2xl mx-auto">
            Select your professional pass and join the most significant gathering of innovators at the heart of Ghana. Experience the evolution of technology at Ummah Tech Fest.
          </p>
        </header>

        {/* Pass Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {passes.map((pass, i) => (
            <div
              key={pass.id}
              className={`glass-card p-8 rounded-xl flex flex-col justify-between transition-all duration-300 group hover:border-primary-fixed/40 hover:shadow-[0_0_20px_rgba(163,250,1,0.1)] ${pass.colSpan || ''}`}
              data-aos="fade-up"
              data-aos-delay={i * 50}
            >
              <div>
                <div className="flex justify-between items-start mb-6">
                  <div className={`p-3 rounded-lg bg-${pass.color}/10 text-${pass.color}`}>
                    <span className="material-symbols-outlined">{pass.icon}</span>
                  </div>
                  <span className={`${pass.tagBg} label-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                    {pass.tag}
                  </span>
                </div>
                <h3 className={`headline-md mb-4 text-${pass.color}`}>{pass.title}</h3>
                <p className="body-md text-on-surface-variant mb-8">{pass.desc}</p>
                <ul className="space-y-4 mb-10">
                  {pass.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-on-surface">
                      <span className={`material-symbols-outlined text-${pass.color} text-sm`}>check_circle</span>
                      <span className="label-md">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                to={pass.path}
                className={`w-full py-4 rounded-lg label-md font-bold uppercase tracking-widest transition-all text-center flex items-center justify-center ${pass.outline
                    ? `border-2 border-${pass.color} text-${pass.color} hover:bg-${pass.color} hover:text-on-${pass.color}`
                    : `bg-${pass.color} text-on-${pass.color} hover:shadow-[0_0_20px_rgba(163,250,1,0.4)]`
                  }`}
              >
                {pass.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* Visual Anchor */}
        <div className="mt-24 h-[400px] rounded-3xl overflow-hidden relative border border-outline-variant/30" data-aos="zoom-in">
          <img
            alt="Tech Conference Atmosphere"
            className="w-full h-full object-cover"
            src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop"
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
