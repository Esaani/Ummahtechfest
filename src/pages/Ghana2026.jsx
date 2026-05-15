import { Link } from 'react-router-dom'

export default function Ghana2026() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] flex items-center overflow-hidden pt-24 md:pt-20">
        <div className="absolute inset-0 z-0">
          <img alt="Accra Skyline" className="w-full h-full object-cover opacity-30 md:opacity-40 grayscale" src="https://images.unsplash.com/photo-1591123120675-6f7f1aae0e5b?q=80&w=1200&auto=format&fit=crop" loading="lazy"/>
          <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-background via-background/90 md:via-background/80 to-transparent"></div>
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          <div className="max-w-2xl space-y-6 text-center md:text-left" data-aos="fade-right">
            <span className="inline-block px-4 py-1 rounded-full border border-primary-fixed text-primary-fixed label-md uppercase tracking-widest text-[10px] md:text-xs">Digital Gateway</span>
            <h1 className="text-5xl md:headline-xl text-primary leading-none uppercase">ACCRA<br/><span className="text-secondary italic">2026</span></h1>
            <p className="text-sm md:body-lg text-on-surface-variant max-w-lg mx-auto md:mx-0">
              Step into the heart of West Africa's technological revolution. Ummah Tech Fest lands in Ghana, bridging global innovation with rich heritage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="btn-primary w-full sm:w-auto">Explore Venue</button>
              <button className="btn-secondary w-full sm:w-auto">Travel Guide</button>
            </div>
          </div>
        </div>
      </section>

      {/* Venue Section */}
      <section className="py-16 md:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="mb-12 md:mb-16 text-center md:text-left" data-aos="fade-up">
          <h2 className="text-3xl md:headline-lg text-primary mb-4 uppercase">The <span className="text-primary-fixed">Venue</span></h2>
          <div className="w-24 h-1 bg-primary-fixed mx-auto md:mx-0"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-gutter">
          <div className="md:col-span-8 group relative overflow-hidden rounded-2xl kente-border min-h-[300px] md:min-h-[400px]" data-aos="fade-right">
            <img alt="AICC" className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" src="https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1200&auto=format&fit=crop" loading="lazy"/>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90"></div>
            <div className="absolute bottom-0 left-0 p-6 md:p-8">
              <h3 className="text-xl md:headline-md text-primary mb-2 font-bold">Accra International Conference Centre</h3>
              <p className="text-xs md:body-md text-on-surface-variant max-w-md">Ghana's premier hub for diplomacy transformed into a state-of-the-art tech arena.</p>
            </div>
          </div>
          <div className="md:col-span-4 glass-panel p-6 md:p-8 rounded-2xl flex flex-col justify-between border-l-4 border-l-primary-fixed shadow-xl" data-aos="fade-left">
            <div className="space-y-4 md:space-y-6">
              <span className="material-symbols-outlined text-primary-fixed text-4xl md:text-5xl">location_on</span>
              <h4 className="text-xl md:headline-sm text-secondary font-bold">Prime Location</h4>
              <p className="text-sm md:body-md text-on-surface-variant">Located in the heart of the capital, surrounded by the city's finest business hotels and digital hubs.</p>
            </div>
            <div className="pt-6 md:pt-8 border-t border-outline-variant/30 mt-6 md:mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-xl">wifi</span>
                <span className="text-[10px] md:label-md text-primary uppercase font-bold tracking-widest">Ultra-Fast Fiber</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-xl">groups</span>
                <span className="text-[10px] md:label-md text-primary uppercase font-bold tracking-widest">5,000+ Capacity</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Connectivity & Heritage */}
      <section className="py-16 md:py-32 bg-surface-container-lowest overflow-hidden">
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
          <div className="space-y-6 md:space-y-8 text-center md:text-left" data-aos="fade-right">
            <h2 className="text-3xl md:headline-lg text-primary uppercase">Heritage Meets <span className="text-primary-fixed">Digital Future</span></h2>
            <p className="text-sm md:body-lg text-on-surface-variant">Experience the "Year of Return" legacy through a lens of digital sovereignty. Ghana is a partner in the global Ummah's technological advancement.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <div className="glass-panel p-6 rounded-xl border-l-2 border-l-secondary text-left">
                <h5 className="text-[10px] md:label-md text-secondary mb-2 uppercase font-black">Tech Ecosystem</h5>
                <p className="text-xs md:body-md text-on-surface-variant">Home to global AI Research labs and rising unicorns.</p>
              </div>
              <div className="glass-panel p-6 rounded-xl border-l-2 border-l-secondary text-left">
                <h5 className="text-[10px] md:label-md text-secondary mb-2 uppercase font-black">Islamic Legacy</h5>
                <p className="text-xs md:body-md text-on-surface-variant">Vibrant Muslim communities and historic architecture.</p>
              </div>
            </div>
          </div>
          <div className="relative px-4 md:px-0" data-aos="fade-left">
            <div className="aspect-square rounded-full border-[12px] border-primary-fixed/5 absolute -inset-4 md:-inset-8 animate-pulse hidden md:block"></div>
            <img alt="Heritage Tech" className="relative rounded-2xl w-full h-[300px] md:h-[500px] object-cover kente-border shadow-2xl" src="https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?q=80&w=800&auto=format&fit=crop" loading="lazy"/>
          </div>
        </div>
      </section>

      {/* Travel Logistics */}
      <section className="py-16 md:py-32 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="text-center mb-12 md:mb-20" data-aos="fade-up">
          <h2 className="text-3xl md:headline-lg text-primary mb-4 uppercase">Plan Your <span className="text-primary-fixed">Journey</span></h2>
          <p className="text-sm md:body-lg text-on-surface-variant max-w-2xl mx-auto px-4">Seamless logistics for our international delegates. From visa support to luxury accommodation.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-gutter">
          {[
            {
              icon: "flight_land",
              title: "Arrival",
              desc: "Fly into Kotoka International Airport (ACC). Only 15 minutes from the venue.",
              items: ["24/7 Shuttle Service", "Welcome Desk at ACC"]
            },
            {
              icon: "hotel",
              title: "Accommodation",
              desc: "Partner luxury hotels with exclusive delegate rates and prayer facilities.",
              cta: "View Hotels",
              tag: "Partner Rates",
              to: "/accommodation"
            },
            {
              icon: "description",
              title: "Visa Support",
              desc: "Simplified visa-on-arrival. We provide official invitation letters.",
              cta: "Requirements",
              ctaColor: "secondary",
              to: "/visa-support"
            }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-8 md:p-10 rounded-2xl border border-outline-variant/20 hover:border-primary-fixed transition-all group relative overflow-hidden" data-aos="fade-up" data-aos-delay={i * 100}>
              {item.tag && <div className="absolute top-0 right-0 bg-secondary text-on-secondary px-4 py-1 text-[10px] font-black uppercase">{item.tag}</div>}
              <div className="bg-primary-fixed/10 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-6 md:mb-8 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary-fixed text-3xl md:text-4xl">{item.icon}</span>
              </div>
              <h3 className="text-xl md:headline-sm text-primary mb-4 font-bold">{item.title}</h3>
              <p className="text-xs md:body-md text-on-surface-variant mb-6">{item.desc}</p>
              {item.items ? (
                <ul className="space-y-3 text-[10px] md:label-md text-primary/80 uppercase font-bold tracking-widest">
                  {item.items.map((li, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-secondary text-base">check_circle</span> {li}
                    </li>
                  ))}
                </ul>
              ) : (
                <Link to={item.to} className={`text-${item.ctaColor || 'primary-fixed'} text-[10px] md:label-md uppercase font-black flex items-center gap-2 group-hover:translate-x-2 transition-transform tracking-widest`}>
                  {item.cta} <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
