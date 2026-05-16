import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Tickets() {
  const [quantities, setQuantities] = useState({
    earlyBird: 1,
    standard: 1,
    vip: 1
  })

  const updateQuantity = (tier, delta) => {
    setQuantities(prev => ({
      ...prev,
      [tier]: Math.max(1, prev[tier] + delta)
    }))
  }

  return (
    <main className="pt-24 md:pt-32 pb-20">
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-16 md:mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left" data-aos="fade-right">
            <h1 className="text-4xl md:headline-xl mb-6 uppercase leading-tight">Secure Your Spot in the <span className="text-primary-fixed">Future.</span></h1>
            <p className="text-sm md:body-lg text-on-surface-variant max-w-xl mb-8 mx-auto lg:mx-0">
              Join 2,000+ tech visionaries, developers, and entrepreneurs in Accra. Experience the fusion of heritage and high-tech.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 items-center p-6 glass-panel rounded-2xl border-l-4 border-primary-fixed shadow-xl text-left">
              <span className="material-symbols-outlined text-primary-fixed text-4xl hidden sm:block">event_seat</span>
              <div>
                <p className="text-[10px] md:label-md text-primary-fixed font-black uppercase tracking-widest">Limited Capacity</p>
                <p className="text-xs opacity-70">Only 450 Early Bird tickets remaining for Ghana 2026.</p>
              </div>
            </div>
          </div>
          <div className="relative group hidden lg:block" data-aos="fade-left">
            <div className="aspect-video rounded-2xl overflow-hidden kente-border">
              <img className="w-full h-full object-cover group-hover:grayscale-0 transition-all duration-1000" src="/assets/images/tickets-hero.jpg" loading="lazy"/>
            </div>
            <div className="absolute -bottom-6 -right-6 p-8 glass-panel rounded-xl border border-primary-fixed/30 shadow-2xl group-hover:-translate-y-2 transition-transform duration-500">
              <div className="text-center">
                <p className="headline-sm text-secondary font-bold uppercase tracking-tighter">JAN 15-18</p>
                <p className="label-md uppercase tracking-widest text-primary-fixed">ACCRA, GHANA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-gutter items-stretch">
          {/* Early Bird */}
          <div className="glass-panel p-8 md:p-10 rounded-2xl flex flex-col hover:border-primary-fixed transition-all duration-500 group" data-aos="fade-up">
            <div className="mb-8 md:mb-10">
              <span className="bg-primary-fixed/10 text-primary-fixed text-[10px] md:label-md px-4 py-1 rounded-full border border-primary-fixed/20 uppercase tracking-widest font-black">Limited Offer</span>
              <h3 className="text-xl md:headline-sm mt-6 uppercase font-bold">Early Bird</h3>
              <p className="text-on-surface-variant text-xs md:text-sm mt-2">Perfect for independent developers and students.</p>
            </div>
            <div className="mb-8 md:mb-10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:headline-lg text-primary-fixed font-black">GH₵ 450</span>
                <span className="text-on-surface-variant text-[10px] md:label-md uppercase">/person</span>
              </div>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-xl">check_circle</span>
                <span className="text-xs md:body-md">Full 3-day access to all keynote sessions</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-xl">check_circle</span>
                <span className="text-xs md:body-md">Community networking lunch included</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-xl">check_circle</span>
                <span className="text-xs md:body-md">Digital attendee certificate</span>
              </li>
            </ul>
            <div className="space-y-4">
              <div className="flex items-center justify-between glass-panel p-2 rounded-xl border-outline-variant/30">
                <button onClick={() => updateQuantity('earlyBird', -1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-primary-fixed/10 rounded-full transition-colors">-</button>
                <span className="text-lg md:headline-sm font-black">{quantities.earlyBird}</span>
                <button onClick={() => updateQuantity('earlyBird', 1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-primary-fixed/10 rounded-full transition-colors">+</button>
              </div>
              <Link to="/signup" className="w-full btn-secondary text-xs flex items-center justify-center">Select Tier</Link>
            </div>
          </div>

          {/* Standard */}
          <div className="glass-panel p-8 md:p-10 rounded-2xl flex flex-col relative overflow-hidden border-primary-fixed md:scale-105 z-10 shadow-[0_0_50px_rgba(163,250,1,0.15)] group" data-aos="zoom-in">
            <div className="absolute top-0 right-0 bg-primary-fixed text-on-primary-fixed px-6 py-2 md:px-8 md:py-3 text-[10px] md:label-md font-bold rounded-bl-2xl uppercase tracking-widest">
              POPULAR
            </div>
            <div className="mb-8 md:mb-10">
              <span className="bg-secondary/10 text-secondary text-[10px] md:label-md px-4 py-1 rounded-full border border-secondary/20 uppercase tracking-widest font-black">Professional</span>
              <h3 className="text-xl md:headline-sm mt-6 uppercase font-bold">Standard Pass</h3>
              <p className="text-on-surface-variant text-xs md:text-sm mt-2">Ideal for corporate teams and startups.</p>
            </div>
            <div className="mb-8 md:mb-10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:headline-lg text-primary-fixed font-black">GH₵ 850</span>
                <span className="text-on-surface-variant text-[10px] md:label-md uppercase">/person</span>
              </div>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-xl">check_circle</span>
                <span className="text-xs md:body-md">All Keynotes & Technical Workshops</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-xl">check_circle</span>
                <span className="text-xs md:body-md">Premium catering & refreshment zones</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary-fixed text-xl">check_circle</span>
                <span className="text-xs md:body-md">Access to Tech Talent Job Fair</span>
              </li>
            </ul>
            <div className="space-y-4">
              <div className="flex items-center justify-between glass-panel p-2 rounded-xl border-primary-fixed/30">
                <button onClick={() => updateQuantity('standard', -1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-primary-fixed/10 rounded-full transition-colors">-</button>
                <span className="text-lg md:headline-sm font-black">{quantities.standard}</span>
                <button onClick={() => updateQuantity('standard', 1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-primary-fixed/10 rounded-full transition-colors">+</button>
              </div>
              <Link to="/signup" className="w-full btn-primary text-xs flex items-center justify-center">Buy Tickets</Link>
            </div>
          </div>

          {/* VIP */}
          <div className="glass-panel p-8 md:p-10 rounded-2xl flex flex-col hover:border-secondary transition-all duration-500 group" data-aos="fade-up">
            <div className="mb-8 md:mb-10">
              <span className="bg-secondary/10 text-secondary text-[10px] md:label-md px-4 py-1 rounded-full border border-secondary/20 uppercase tracking-widest font-black">Executive</span>
              <h3 className="text-xl md:headline-sm mt-6 uppercase font-bold">VIP Platinum</h3>
              <p className="text-on-surface-variant text-xs md:text-sm mt-2">The ultimate networking experience for leaders.</p>
            </div>
            <div className="mb-8 md:mb-10">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:headline-lg text-secondary font-black">GH₵ 2,200</span>
                <span className="text-on-surface-variant text-[10px] md:label-md uppercase">/person</span>
              </div>
            </div>
            <ul className="space-y-4 mb-12 flex-grow">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">star</span>
                <span className="text-xs md:body-md font-bold">Exclusive Speaker's Dinner</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                <span className="text-xs md:body-md">VIP Networking Lounge access</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary text-xl">check_circle</span>
                <span className="text-xs md:body-md">Front-row seating for all sessions</span>
              </li>
            </ul>
            <div className="space-y-4">
              <div className="flex items-center justify-between glass-panel p-2 rounded-xl border-secondary/30">
                <button onClick={() => updateQuantity('vip', -1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-secondary/10 rounded-full transition-colors">-</button>
                <span className="text-lg md:headline-sm font-black">{quantities.vip}</span>
                <button onClick={() => updateQuantity('vip', 1)} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-secondary/10 rounded-full transition-colors">+</button>
              </div>
              <Link to="/signup" className="w-full btn-secondary !border-secondary !text-secondary hover:!bg-secondary hover:!text-on-secondary transition-all text-xs flex items-center justify-center">Request Invite</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Process */}
      <section className="max-w-4xl mx-auto px-margin-mobile md:px-margin-desktop mt-24 md:mt-48 mb-20 md:mb-32">
        <div className="text-center mb-12 md:mb-20" data-aos="fade-up">
          <h2 className="text-2xl md:headline-md uppercase font-bold">Registration <span className="text-primary-fixed">Process</span></h2>
          <div className="w-24 h-1 bg-primary-fixed mx-auto mt-4"></div>
        </div>
        <div className="relative space-y-8 md:space-y-16">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-outline-variant/20 hidden md:block"></div>
          
          {[
            { step: 1, title: "Select Your Tier", desc: "Choose the package that fits your goals. Group discounts are available for teams of 5+." },
            { step: 2, title: "Complete Profile", desc: "Provide your tech stack and interests so we can match you with the right networking groups." },
            { step: 3, title: "Secure Payment", desc: "Finish using Mobile Money, Bank Card, or Crypto. Instant confirmation sent to your email." }
          ].map((item, i) => (
            <div key={i} className="relative flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-12 group text-center md:text-left" data-aos="fade-left" data-aos-delay={i * 100}>
              <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center z-10 font-black headline-sm shrink-0 shadow-[0_0_15px_rgba(163,250,1,0.5)]">
                {item.step}
              </div>
              <div className="glass-panel p-6 md:p-8 rounded-2xl flex-grow hover:bg-surface-container transition-colors w-full">
                <h4 className="text-lg md:headline-sm text-primary-fixed mb-3 md:mb-4 uppercase font-bold">{item.title}</h4>
                <p className="text-sm md:body-md text-on-surface-variant">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
