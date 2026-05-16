import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center py-12 md:py-24 pt-24 md:pt-32 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 z-0 pointer-events-none bg-black overflow-hidden">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            poster="/assets/images/hero.webp"
            className="absolute inset-0 w-full h-full object-cover opacity-60"
          >
            <source src="/assets/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 w-full h-full bg-black/40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
          <div className="flex flex-col items-center justify-center max-w-4xl mx-auto h-full text-center">
            <div className="space-y-6 md:space-y-8" data-aos="fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-container rounded-full border border-outline-variant/30 mx-auto">
              <span className="w-2 h-2 rounded-full bg-primary-fixed animate-pulse"></span>
              <span className="label-md text-secondary uppercase tracking-widest text-[10px] md:text-xs">ACCRA, GHANA • JULY 2026</span>
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-headline text-primary uppercase leading-[1.1] md:leading-[1.1]">
              The Future of <br className="md:hidden" /> <span className="text-primary-fixed">Muslim Tech</span> Excellence
            </h1>
            <p className="text-sm md:text-base lg:text-lg text-on-surface-variant max-w-xl mx-auto px-4 md:px-0">
              <span className="md:hidden">Join 5,000+ innovators for Africa's largest gathering of Muslim tech talent.</span>
              <span className="hidden md:inline">Join 5,000+ developers, innovators, and visionaries for Africa's largest gathering of Muslim tech talent. Bridging tradition and transformation in the heart of West Africa.</span>
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="btn-primary w-full sm:w-auto px-10 py-4 font-bold uppercase tracking-widest text-sm text-center">
                Get Your Pass
              </Link>
              <Link to="/schedule" className="btn-secondary w-full sm:w-auto px-10 py-4 font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-sm">
                View Agenda
              </Link>
            </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why We Build */}
      <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="mb-12 md:mb-16 text-center md:text-left" data-aos="fade-up">
          <h2 className="headline-lg text-primary uppercase">Why we <span className="text-primary-fixed">build</span></h2>
          <div className="w-24 h-1 bg-primary-fixed mt-4 mx-auto md:mx-0"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-gutter">
          {[
            { 
              title: "We've always been pioneers", 
              text: "Algebra. Medicine. Optics. Two-thirds of the stars bear names we gave them. From the stars to the algorithm — we've always led.",
              img: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
            },
            { 
              title: "Owning the platform shift", 
              text: "Bricks to bytes. Factories to platforms. The greatest opportunity of our lifetime is here, and we intend to own it.",
              img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop"
            },
            { 
              title: "We are the guardians of tech", 
              text: "We are guardians of mankind. It's our responsibility to ensure technology serves humanity the right way.",
              img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop"
            },
            { 
              title: "Ummah is the standard", 
              text: "Pioneers. Category-defining founders. Legendary engineers. Excellence isn't the goal — it's the entry requirement.",
              img: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=2070&auto=format&fit=crop"
            }
          ].map((card, i) => (
            <div key={i} className="glass-panel group overflow-hidden rounded-xl border border-outline-variant/20 hover:border-primary-fixed transition-all duration-500" data-aos="fade-up" data-aos-delay={i * 100}>
              <div className="aspect-video relative overflow-hidden">
                <img alt={card.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-110" src={`${card.img}&w=800`} loading="lazy"/>
                <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent opacity-60"></div>
              </div>
              <div className="p-6 md:p-8">
                <h4 className="headline-sm text-primary mb-3 text-lg md:text-xl">{card.title}</h4>
                <p className="body-md text-on-surface-variant text-sm md:text-base">{card.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section className="py-12 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto border-y border-outline-variant/10">
        <p className="text-center label-md text-on-surface-variant uppercase tracking-widest mb-10 text-[10px] md:text-xs">Global Partners & Sponsors</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-24 opacity-60">
          <div className="text-sm md:text-xl font-headline text-primary grayscale hover:grayscale-0 transition-all cursor-pointer">TECH-HUB</div>
          <div className="text-sm md:text-xl font-headline text-primary grayscale hover:grayscale-0 transition-all cursor-pointer">ISLAMIC-FIN</div>
          <div className="text-sm md:text-xl font-headline text-primary grayscale hover:grayscale-0 transition-all cursor-pointer">AFRICA-CLOUD</div>
          <div className="text-sm md:text-xl font-headline text-primary grayscale hover:grayscale-0 transition-all cursor-pointer">MODERN-HALAL</div>
          <div className="text-sm md:text-xl font-headline text-primary grayscale hover:grayscale-0 transition-all cursor-pointer">ACCRA-VENTURES</div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-gutter">
          {[
            { icon: "diversity_3", value: "5,000+", label: "Global Attendees" },
            { icon: "rocket_launch", value: "40+", label: "Workshops" },
            { icon: "trophy", value: "$50k", label: "Hackathon Prize" },
            { icon: "record_voice_over", value: "20", label: "Legendary speakers" }
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-6 md:p-10 flex flex-col items-center text-center rounded-2xl border border-outline-variant/20 shadow-2xl hover:border-primary-fixed/30 transition-all duration-500" data-aos="zoom-in" data-aos-delay={i * 100}>
              <span className="material-symbols-outlined text-primary-fixed text-3xl md:text-4xl mb-4 md:mb-6">{stat.icon}</span>
              <h3 className="text-2xl md:text-4xl lg:text-5xl font-headline text-primary-fixed mb-1 md:mb-2 font-black">{stat.value}</h3>
              <p className="text-[8px] md:text-xs lg:label-md text-primary font-bold uppercase tracking-widest leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Attendee Voices */}
      <section className="py-16 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto overflow-hidden">
        <div className="mb-12 md:mb-16 text-center md:text-left" data-aos="fade-up">
          <h2 className="headline-lg text-primary uppercase">Attendee <span className="text-primary-fixed">Voices</span></h2>
          <p className="body-md text-on-surface-variant mt-4 text-sm md:text-base">Real impact from our global community of innovators.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {[
            {
              name: "Fatima Zahra",
              role: "Software Engineer, Lagos",
              text: "Ummah Tech Fest wasn't just a conference; it was a homecoming. Seeing so many talented Muslim developers in one space changed my career trajectory.",
              img: "https://images.unsplash.com/photo-1563941402622-4e7a488bcc57?q=80&w=400&auto=format&fit=crop",
              color: "primary-fixed"
            },
            {
              name: "Omar Mansour",
              role: "CTO, Cairo",
              text: "The quality of technical workshops was world-class. Integrating ethical Islamic values with cutting-edge AI is exactly what the industry needs right now.",
              img: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=400&auto=format&fit=crop",
              color: "secondary"
            },
            {
              name: "Kwame Bello",
              role: "Startup Founder, Nairobi",
              text: "Winning the hackathon was great, but the connections I made were better. I found my co-founder and secured seed funding within two months.",
              img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
              color: "primary-fixed"
            }
          ].map((v, i) => (
            <div key={i} className={`glass-panel p-6 md:p-8 relative rounded-2xl border border-outline-variant/20 ${v.color === 'secondary' ? 'border-l-4 border-l-secondary' : ''}`} data-aos="fade-up" data-aos-delay={i * 100}>
              <span className={`material-symbols-outlined text-${v.color}/10 text-5xl md:text-7xl absolute top-4 right-4`}>format_quote</span>
              <p className="body-lg text-primary italic mb-6 relative z-10 text-base md:text-lg">"{v.text}"</p>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-variant border border-${v.color}/30 overflow-hidden`}>
                  <img alt={v.name} className="w-full h-full object-cover" src={`${v.img}&w=200`} loading="lazy"/>
                </div>
                <div>
                  <h5 className="label-md text-primary text-xs md:text-sm">{v.name}</h5>
                  <p className="text-[8px] md:text-[10px] text-on-surface-variant uppercase tracking-widest">{v.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* World Class Speakers */}
      <section className="py-24 md:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto bg-surface-container-low/30">
        <div className="mb-12 md:mb-20 text-center" data-aos="fade-up">
          <h2 className="headline-lg text-primary uppercase mb-4">World-class <span className="text-primary-fixed">speakers</span></h2>
          <p className="body-md text-on-surface-variant max-w-2xl mx-auto mb-8 md:mb-10 text-sm md:text-base px-4">This is the firepit of the biggest and most exciting names in the Tech & Entrepreneurship scene.</p>
          <Link to="/apply-to-speak" className="btn-secondary px-8 py-3 !border-primary-fixed !text-primary-fixed hover:!bg-primary-fixed hover:!text-on-primary-fixed uppercase tracking-widest font-bold text-xs inline-block">
            Apply to speak
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 px-4 md:px-0">
          {[
            { name: "Ibrahim Mansour", role: "CTO @ HALAL AI", img: "https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=400&auto=format&fit=crop" },
            { name: "Amina Asante", role: "Lead Dev @ EthioChain", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop" },
            { name: "Yusuf Osei", role: "Founder @ AccraData", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1974&auto=format&fit=crop" }
          ].map((s, i) => (
            <div key={i} className="group relative" data-aos="zoom-in" data-aos-delay={i * 100}>
              <div className="kente-border p-1 bg-background rounded-xl overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_30px_rgba(163,250,1,0.2)]">
                <div className="relative overflow-hidden aspect-[4/5] rounded-lg">
                  <img alt={s.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" src={`${s.img}&w=600`} loading="lazy"/>
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-90"></div>
                  <div className="absolute bottom-4 md:bottom-6 left-4 md:left-6 right-4 md:right-6">
                    <h4 className="headline-sm text-primary mb-1 text-lg md:text-xl">{s.name}</h4>
                    <p className="label-md text-primary-fixed uppercase tracking-widest text-[10px] md:text-[12px]">{s.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Agenda Preview */}
      <section className="py-24 md:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 md:gap-20">
          <div className="lg:w-1/3 text-center lg:text-left" data-aos="fade-right">
            <h2 className="headline-lg text-primary uppercase mb-6 leading-none">The <span className="text-secondary italic">Blueprint</span></h2>
            <p className="body-md text-on-surface-variant mb-8 md:mb-10 text-sm md:text-base">Three days of intensive learning, networking, and spiritual growth in the heart of Accra.</p>
            <Link to="/schedule" className="inline-flex items-center gap-4 text-primary-fixed label-md uppercase tracking-widest group font-bold text-xs md:text-sm">
              Full Schedule
              <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">arrow_forward</span>
            </Link>
          </div>
          <div className="lg:w-2/3 space-y-4 px-4 md:px-0" data-aos="fade-left">
            {[
              { day: "01", title: "Genesis: Opening Keynote", desc: "Building Ethical Tech for the Ummah", time: "09:00 AM" },
              { day: "02", title: "The Hackathon Begins", desc: "24 Hours of Intensive Building", time: "LIVE NOW", live: true },
              { day: "03", title: "Future Horizons", desc: "Awards & Closing Iftar", time: "06:00 PM" }
            ].map((a, i) => (
              <div key={i} className={`glass-panel p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-8 group hover:bg-primary-fixed/5 transition-all duration-300 rounded-2xl border border-outline-variant/20 ${a.live ? 'border-l-4 border-l-primary-fixed' : ''}`}>
                <div className="flex flex-col items-center">
                  <span className="label-md text-primary-fixed uppercase text-[10px]">Day</span>
                  <span className="text-2xl md:text-3xl font-headline text-primary">{a.day}</span>
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <h4 className="text-base md:text-lg font-headline text-primary group-hover:text-primary-fixed transition-colors">{a.title}</h4>
                  <p className="text-xs md:text-sm text-on-surface-variant">{a.desc}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <span className={`text-[10px] md:label-md ${a.live ? 'text-secondary animate-pulse font-bold' : 'text-on-surface-variant'}`}>{a.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Registration */}
      <section id="tickets" className="py-10 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
          <div className="text-center lg:text-left" data-aos="fade-up">
            <h2 className="headline-lg text-primary uppercase mb-6">Join the <span className="text-primary-fixed">Waitlist</span></h2>
            <p className="body-lg text-on-surface-variant max-w-md mb-8 md:mb-10 mx-auto lg:mx-0 text-sm md:text-base">Be the first to know when ticket sales go live.</p>
            <div className="space-y-4 md:space-y-6 inline-block lg:block text-left">
              {[
                "Priority booking access",
                "Early bird discounts (up to 40%)",
                "Digital swag pack on signup"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <span className="material-symbols-outlined text-primary-fixed group-hover:scale-125 transition-transform text-xl md:text-2xl">check_circle</span>
                  <span className="text-[10px] md:label-md text-on-surface uppercase tracking-widest">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="glass-panel p-6 md:p-10 rounded-3xl border border-outline-variant/30 shadow-2xl relative overflow-hidden" data-aos="zoom-in">
            <form className="space-y-4 md:space-y-6 relative z-10">
              <div>
                <label className="block text-[10px] md:label-md text-primary uppercase mb-2 md:mb-3">Full Name</label>
                <input className="w-full bg-surface-container/50 border border-outline-variant/30 text-on-surface rounded-xl p-3 md:p-4 text-sm focus:ring-2 focus:ring-primary-fixed outline-none transition-all" placeholder="Enter your full name" type="text"/>
              </div>
              <div>
                <label className="block text-[10px] md:label-md text-primary uppercase mb-2 md:mb-3">Email Address</label>
                <input className="w-full bg-surface-container/50 border border-outline-variant/30 text-on-surface rounded-xl p-3 md:p-4 text-sm focus:ring-2 focus:ring-primary-fixed outline-none transition-all" placeholder="you@company.com" type="email"/>
              </div>
              <div>
                <label className="block text-[10px] md:label-md text-primary uppercase mb-2 md:mb-3">Area of Interest</label>
                <div className="relative">
                  <select className="w-full bg-surface-container/50 border border-outline-variant/30 text-on-surface rounded-xl p-3 md:p-4 text-sm focus:ring-2 focus:ring-primary-fixed outline-none appearance-none cursor-pointer">
                    <option>Artificial Intelligence</option>
                    <option>Blockchain & Web3</option>
                    <option>Islamic Fintech</option>
                    <option>Product Management</option>
                    <option>Cybersecurity</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>
              <button className="w-full btn-primary py-4 md:py-5 text-base md:text-lg shadow-2xl hover:scale-[1.02]">
                Pre-Register Now
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-10 md:py-24 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto mb-6 md:mb-20">
        <div className="relative bg-primary-fixed p-8 md:p-16 overflow-hidden rounded-3xl group shadow-[0_20px_50px_rgba(163,250,1,0.3)]">
          <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-black/5 rounded-full -mr-32 md:-mr-64 -mt-32 md:-mt-64 transition-transform duration-1000 group-hover:scale-125"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="inline-block px-4 md:px-6 py-1 md:py-2 bg-black text-primary-fixed text-[10px] md:label-md rounded-full mb-6 md:mb-8 uppercase tracking-widest font-black">Limited Spots</div>
            <h2 className="text-3xl md:text-5xl lg:headline-xl text-on-primary-fixed uppercase mb-6 md:mb-8 max-w-4xl leading-tight">Ready to build the future?</h2>
            <p className="body-md md:body-lg text-on-primary-fixed-variant mb-8 md:mb-12 max-w-2xl font-medium opacity-90 text-sm md:text-base">Secure your spot at the most anticipated tech event in Africa.</p>
            <Link to="/signup" className="bg-background text-primary-fixed px-12 md:px-20 py-4 md:py-8 text-base md:headline-sm font-black uppercase tracking-[0.1em] md:tracking-[0.2em] hover:scale-110 transition-all duration-500 shadow-2xl rounded-xl inline-block">
              GET YOUR TICKET
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
