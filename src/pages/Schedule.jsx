import { useState } from 'react'
import SessionModal from '../components/SessionModal'

export default function Schedule() {
  const [selectedSession, setSelectedSession] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openSession = (session) => {
    setSelectedSession(session)
    setIsModalOpen(true)
  }

  const sessions = {
    keynote: {
      id: 'keynote',
      time: '09:00 AM — 10:30 AM',
      location: 'Main Stage (Auditorium A)',
      track: 'Main Stage',
      title: 'Opening Keynote: The Digital Ummah in 2026',
      description: 'A visionary session exploring how ethical tech frameworks from West Africa are influencing global standards. We will discuss the evolution of digital sovereignty and communal innovation.',
      outcomes: [
        "Vision for the next 5 years of African-Islamic tech collaboration.",
        "Understanding digital sovereignty through an ethical lens.",
        "Key milestones for the Ummah tech ecosystem in 2026."
      ],
      speaker: {
        name: 'Dr. Amina Mensah',
        role: 'Chief Ethics Officer, TechGhana',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop',
        quote: 'Technology is the vessel, but our values are the compass that guides us through the uncharted waters of the digital future.'
      }
    },
    ai: {
      id: 'ai',
      time: '10:30 AM — 11:45 AM',
      location: 'Hall A (Level 2)',
      track: 'AI & Ethics',
      title: 'Algorithmic Adab: Ethics by Design',
      description: 'How to embed Islamic ethical principles into machine learning training sets. This session explores the concept of Adab (Refined Manners) as a foundation for AI alignment.',
      outcomes: [
        "Mapping Adab principles to AI reward functions.",
        "Detecting and mitigating cultural bias in LLMs.",
        "Framework for human-in-the-loop ethical auditing."
      ],
      speaker: {
        name: 'Dr. Omar Al-Faruqi',
        role: 'Lead AI Ethicist, Global Tech Council',
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop',
        quote: 'Bridging the gap between the revelation and the algorithm to ensure a human-centric digital future.'
      }
    },
    fintech: {
      id: 'fintech',
      time: '10:30 AM — 11:45 AM',
      location: 'Innovation Hub',
      track: 'Fintech',
      title: 'Decentralized Zakat Systems',
      description: 'Building transparent, blockchain-based platforms for social impact. We investigate how Web3 technologies can revolutionize the transparency and efficiency of charitable giving.',
      outcomes: [
        "Architecture for automated Zakat calculation and distribution.",
        "Blockchain transparency vs. donor privacy.",
        "Case studies of successful Web3 social impact in Ghana."
      ],
      speaker: {
        name: 'Issah Abubakar',
        role: 'Founder, Savannah Tech',
        image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop',
        quote: 'True financial inclusion is not just access, but access to systems that respect our communal and spiritual values.'
      }
    },
    workshop: {
      id: 'workshop',
      time: '01:30 PM — 04:00 PM',
      location: 'Workshop Lab B',
      track: 'Hands-on Workshop',
      title: 'Building Shariah-Compliant Micro-dApps',
      description: 'A technical walkthrough for developers looking to build on the Ummah Protocol. Learn the fundamentals of writing smart contracts that enforce ethical constraints.',
      outcomes: [
        "Deploying your first ethical smart contract on Ummah Protocol.",
        "Integrating off-chain validation with on-chain transparency.",
        "Hands-on UI development for communal dApps."
      ],
      speaker: {
        name: 'Fatima Zarah',
        role: 'Lead Dev, Ummah Protocol',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=400&auto=format&fit=crop',
        quote: 'The code we write today is the architecture of the society we build tomorrow.'
      }
    }
  }

  return (
    <main className="pt-24 md:pt-32 pb-20">
      <SessionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        session={selectedSession} 
      />
      {/* Hero & Track Filters */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-12 md:mb-16" data-aos="fade-up">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 text-center md:text-left">
          <div className="max-w-2xl mx-auto md:mx-0">
            <span className="label-md text-secondary tracking-widest uppercase mb-4 block text-xs md:text-sm">Event Timeline</span>
            <h1 className="text-4xl md:headline-xl text-primary mb-6">Summit <span className="text-primary-fixed">Agenda</span></h1>
            <p className="body-md md:body-lg text-on-surface-variant px-4 md:px-0">Three days of deep dives into the future of ethical technology, Ghanaian innovation, and the global Muslim tech ecosystem.</p>
          </div>
          <div className="flex flex-wrap justify-center md:justify-start gap-3">
            <button className="px-4 md:px-5 py-2 rounded-lg bg-primary-fixed text-on-primary-fixed label-md shadow-lg shadow-primary-fixed/20 text-xs">All Tracks</button>
            <button className="px-4 md:px-5 py-2 rounded-lg glass-panel text-on-surface label-md hover:border-primary-fixed transition-colors text-xs">AI & Ethics</button>
            <button className="px-4 md:px-5 py-2 rounded-lg glass-panel text-on-surface label-md hover:border-primary-fixed transition-colors text-xs">Fintech</button>
            <button className="px-4 md:px-5 py-2 rounded-lg glass-panel text-on-surface label-md hover:border-primary-fixed transition-colors text-xs">Workshops</button>
          </div>
        </div>
        {/* Day Selector */}
        <div className="mt-12 flex border-b border-outline-variant/30 overflow-x-auto no-scrollbar scroll-smooth">
          <button className="px-6 md:px-8 py-4 headline-sm text-primary-fixed border-b-4 border-primary-fixed whitespace-nowrap text-lg md:text-2xl">Day 01 <span className="block label-md text-on-surface-variant text-[10px] md:text-sm">Jan 15, 2026</span></button>
          <button className="px-6 md:px-8 py-4 headline-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap text-lg md:text-2xl">Day 02 <span className="block label-md text-on-surface-variant text-[10px] md:text-sm">Jan 16, 2026</span></button>
          <button className="px-6 md:px-8 py-4 headline-sm text-on-surface-variant hover:text-primary transition-colors whitespace-nowrap text-lg md:text-2xl">Day 03 <span className="block label-md text-on-surface-variant text-[10px] md:text-sm">Jan 17, 2026</span></button>
        </div>
      </section>

      {/* Timeline Grid */}
      <section className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto space-y-8 md:space-y-12">
        {/* Morning Session */}
        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-12" data-aos="fade-up">
          <div className="md:pt-2 flex md:flex-col items-baseline md:items-start gap-2">
            <span className="text-2xl md:headline-sm text-primary">09:00</span>
            <span className="label-md text-on-surface-variant uppercase text-[10px] md:text-sm tracking-widest">GMT</span>
          </div>
          <div 
            onClick={() => openSession(sessions.keynote)}
            className="relative glass-panel p-6 md:p-8 rounded-xl border-l-4 border-l-primary-fixed flex flex-col lg:flex-row gap-6 md:gap-8 items-start hover:bg-surface-container/60 transition-colors group cursor-pointer"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="bg-primary-fixed/20 text-primary-fixed px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Main Stage</span>
                <span className="flex items-center gap-1 text-secondary text-[10px] font-bold uppercase animate-pulse">
                  <span className="material-symbols-outlined text-sm" style={{fontVariationSettings: "'FILL' 1"}}>podcasts</span> Live Now
                </span>
              </div>
              <h3 className="text-xl md:headline-md text-primary mb-3 group-hover:text-primary-fixed transition-colors">Opening Keynote: The Digital Ummah in 2026</h3>
              <p className="text-sm md:body-md text-on-surface-variant max-w-2xl mb-6">A visionary session exploring how ethical tech frameworks from West Africa are influencing global standards.</p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-high border border-primary-fixed/30">
                  <img alt="Dr. Amina Mensah" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200&auto=format&fit=crop" loading="lazy"/>
                </div>
                <div>
                  <p className="text-xs md:label-md text-primary font-bold">Dr. Amina Mensah</p>
                  <p className="text-[10px] md:text-[12px] text-on-surface-variant">Chief Ethics Officer, TechGhana</p>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-48 aspect-video lg:aspect-square rounded-lg overflow-hidden shrink-0 grayscale group-hover:grayscale-0 transition-all duration-700 hidden sm:block">
               <img alt="Session Preview" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=800&auto=format&fit=crop" loading="lazy"/>
            </div>
          </div>
        </div>

        {/* AI Track */}
        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-12" data-aos="fade-up">
          <div className="md:pt-2 flex md:flex-col items-baseline md:items-start gap-2">
            <span className="text-2xl md:headline-sm text-on-surface-variant">10:30</span>
            <span className="label-md text-on-surface-variant uppercase text-[10px] md:text-sm tracking-widest">GMT</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-gutter">
            <div 
              onClick={() => openSession(sessions.ai)}
              className="glass-panel p-6 md:p-8 rounded-xl border-l-2 border-l-secondary/40 hover:border-l-secondary transition-all hover:bg-surface-container/60 group cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-secondary/20 text-secondary px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">AI & Ethics</span>
              </div>
              <h4 className="text-lg md:headline-sm text-primary mb-2 group-hover:text-secondary transition-colors">Algorithmic Adab: Ethics by Design</h4>
              <p className="text-sm md:body-md text-on-surface-variant mb-6">How to embed Islamic ethical principles into machine learning training sets.</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">location_on</span>
                <span className="text-[10px] md:label-md text-on-surface-variant">Hall A (Level 2)</span>
              </div>
            </div>
            <div 
              onClick={() => openSession(sessions.fintech)}
              className="glass-panel p-6 md:p-8 rounded-xl border-l-2 border-l-primary-fixed/40 hover:border-l-primary-fixed transition-all hover:bg-surface-container/60 group cursor-pointer"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-primary-fixed/20 text-primary-fixed px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Fintech</span>
              </div>
              <h4 className="text-lg md:headline-sm text-primary mb-2 group-hover:text-primary-fixed transition-colors">Decentralized Zakat Systems</h4>
              <p className="text-sm md:body-md text-on-surface-variant mb-6">Building transparent, blockchain-based platforms for social impact.</p>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed text-base">location_on</span>
                <span className="text-[10px] md:label-md text-on-surface-variant">Innovation Hub</span>
              </div>
            </div>
          </div>
        </div>

        {/* Break */}
        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-12" data-aos="fade-in">
          <div className="hidden md:block md:pt-2">
            <span className="headline-sm text-on-surface-variant">12:00</span>
          </div>
          <div className="flex items-center gap-4 md:gap-6 py-6 border-y border-outline-variant/10 bg-surface-container/20 px-6 md:px-8 rounded-lg">
            <span className="material-symbols-outlined text-secondary text-2xl md:text-3xl animate-bounce">restaurant</span>
            <span className="text-[10px] md:label-md text-secondary uppercase tracking-[0.2em] font-bold">Lunch Break — Jollof & Tech Lounge</span>
          </div>
        </div>

        {/* Workshop Track */}
        <div className="grid grid-cols-1 md:grid-cols-[120px_1fr] gap-4 md:gap-12" data-aos="fade-up">
          <div className="md:pt-2 flex md:flex-col items-baseline md:items-start gap-2">
            <span className="text-2xl md:headline-sm text-on-surface-variant">13:30</span>
            <span className="label-md text-on-surface-variant uppercase text-[10px] md:text-sm tracking-widest">GMT</span>
          </div>
          <div 
            onClick={() => openSession(sessions.workshop)}
            className="glass-panel p-6 md:p-10 rounded-xl kente-border border-[2px] bg-surface-container-low overflow-hidden relative group cursor-pointer"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-primary-fixed text-on-primary-fixed px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Hands-on Workshop</span>
              </div>
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-center">
                <div className="flex-1">
                  <h3 className="text-xl md:headline-md text-primary mb-4 group-hover:text-primary-fixed transition-colors">Building Shariah-Compliant Micro-dApps</h3>
                  <p className="text-sm md:body-lg text-on-surface-variant mb-8">A technical walkthrough for developers looking to build on the Ummah Protocol.</p>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] md:label-md text-secondary mb-1 uppercase">Prerequisites</p>
                      <p className="text-xs md:body-md text-on-surface">Solidity & React</p>
                    </div>
                    <div>
                      <p className="text-[10px] md:label-md text-secondary mb-1 uppercase">Duration</p>
                      <p className="text-xs md:body-md text-on-surface">150 Mins</p>
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-1/3 aspect-video glass-panel rounded-lg flex items-center justify-center border-dashed border-2 border-outline hover:border-primary-fixed transition-colors cursor-pointer p-4">
                  <div className="text-center">
                    <span className="material-symbols-outlined text-4xl md:text-5xl text-primary-fixed mb-2 animate-pulse">code</span>
                    <p className="text-[10px] md:label-md text-on-surface uppercase tracking-widest">Coding Terminal</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 opacity-5 md:opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity" style={{backgroundImage: "radial-gradient(var(--primary-neon) 1px, transparent 1px)", backgroundSize: "30px 30px"}}></div>
          </div>
        </div>
      </section>
    </main>
  )
}
