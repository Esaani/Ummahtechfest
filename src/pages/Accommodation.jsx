import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Accommodation() {
  const accommodations = [
    {
      name: "Kempinski Gold Coast",
      rating: "5.0",
      distance: "0.5km from Venue (Walking Distance)",
      tag: "Elite Partner",
      price: "240",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1200&auto=format&fit=crop",
      amenities: ["Halal Menu", "Prayer Room", "Tech Hub"],
      icon: "location_on"
    },
    {
      name: "The Alisa Hotel",
      rating: "4.8",
      distance: "2.1km from Venue (Complimentary Shuttle)",
      tag: "",
      price: "185",
      image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1200&auto=format&fit=crop",
      amenities: ["Shuttle Service", "Poolside Lounge"],
      icon: "airport_shuttle"
    },
    {
      name: "Mövenpick Accra",
      rating: "4.9",
      distance: "1.2km from Venue (Quick Commute)",
      tag: "",
      price: "215",
      image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop",
      amenities: ["Halal Certified", "Executive Lounge"],
      icon: "location_on"
    }
  ]

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden py-24">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10"></div>
          <img 
            className="w-full h-full object-cover" 
            alt="Accra Skyline"
            src="https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?q=80&w=1600&auto=format&fit=crop"
          />
        </div>
        <div className="relative z-10 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full">
          <div className="max-w-3xl" data-aos="fade-right">
            <span className="label-md text-primary-fixed uppercase tracking-[0.3em] mb-4 block text-xs md:text-sm">Official Partner Stays</span>
            <h1 className="headline-xl mb-6 leading-tight uppercase tracking-tighter">
              Curated Stays in <span className="text-secondary">Accra</span>
            </h1>
            <p className="body-lg text-on-surface-variant max-w-xl leading-relaxed">
              Experience Ghanaian hospitality at its finest. We've partnered with luxury and boutique hotels near the venue to offer exclusive delegate rates and faith-friendly amenities.
            </p>
          </div>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="px-margin-mobile md:px-margin-desktop mb-16 max-w-container-max mx-auto -mt-12 relative z-20">
        <div className="glass-card p-6 md:p-8 rounded-[32px] flex flex-wrap gap-6 items-end border border-outline-variant/20 shadow-2xl backdrop-blur-2xl" data-aos="fade-up">
          <div className="flex-1 min-w-[280px]">
            <label className="block label-md text-primary-fixed mb-4 uppercase tracking-widest text-xs">Filter by Amenities</label>
            <div className="flex flex-wrap gap-3">
              {[
                { icon: 'restaurant', label: 'Halal-friendly' },
                { icon: 'mosque', label: 'Prayer room' },
                { icon: 'airport_shuttle', label: 'Shuttle Service' }
              ].map((filter, i) => (
                <button key={i} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-outline-variant/40 hover:border-primary-fixed hover:bg-primary-fixed/5 transition-all text-on-surface label-md text-xs group">
                  <span className="material-symbols-outlined text-sm group-hover:text-primary-fixed transition-colors">{filter.icon}</span>
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full lg:w-auto">
            <button className="w-full lg:w-auto bg-primary-fixed text-on-primary-fixed px-10 py-4 rounded-2xl font-black uppercase tracking-widest label-md hover:shadow-[0_0_25px_rgba(163,250,1,0.5)] hover:scale-[1.02] transition-all active:scale-95">
              Apply Filters
            </button>
          </div>
        </div>
      </section>

      {/* Accommodations Grid */}
      <section className="px-margin-mobile md:px-margin-desktop pb-32 max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accommodations.map((hotel, index) => (
            <div 
              key={index} 
              className="group glass-card rounded-[32px] overflow-hidden flex flex-col border border-outline-variant/10 hover:border-primary-fixed/40 transition-all duration-500 hover:-translate-y-2"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="h-64 relative overflow-hidden">
                <img 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={hotel.name}
                  src={hotel.image}
                />
                {hotel.tag && (
                  <div className="absolute top-6 left-6 bg-primary-fixed text-on-primary-fixed px-4 py-1.5 rounded-xl label-md text-[10px] font-black uppercase tracking-widest shadow-lg">
                    {hotel.tag}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              <div className="p-8 flex-1 flex flex-col relative kente-border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="headline-sm text-primary uppercase tracking-tighter">{hotel.name}</h3>
                  <div className="flex items-center text-secondary bg-secondary/10 px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="ml-1 label-md text-xs font-bold">{hotel.rating}</span>
                  </div>
                </div>
                <p className="text-on-surface-variant body-md mb-6 flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-primary-fixed text-lg">{hotel.icon}</span>
                  {hotel.distance}
                </p>
                <div className="flex flex-wrap gap-2 mb-8">
                  {hotel.amenities.map((amenity, i) => (
                    <span key={i} className="bg-surface-container-highest/50 px-3 py-1 rounded-lg text-[10px] uppercase font-bold text-on-surface-variant border border-outline-variant/20 tracking-wider">
                      {amenity}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between gap-4 pt-6 border-t border-outline-variant/10">
                  <div>
                    <span className="block text-on-surface-variant text-[10px] uppercase font-black tracking-[0.2em] mb-1">Delegate Rate</span>
                    <span className="headline-sm text-primary-fixed">${hotel.price}<span className="text-sm font-normal text-on-surface-variant tracking-normal">/night</span></span>
                  </div>
                  <button className="bg-surface-container-high border border-outline-variant/30 text-primary-fixed px-6 py-3 rounded-xl font-black label-md text-[10px] uppercase tracking-widest hover:bg-primary-fixed hover:text-on-primary-fixed transition-all active:scale-95 shadow-xl">
                    Book Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-margin-mobile md:px-margin-desktop pb-32 max-w-container-max mx-auto text-center" data-aos="zoom-in">
        <div className="glass-card py-20 px-8 rounded-[48px] border border-primary-fixed/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary-fixed/5 pointer-events-none group-hover:bg-primary-fixed/10 transition-colors"></div>
          <div className="relative z-10">
            <h2 className="headline-lg mb-6 max-w-3xl mx-auto uppercase tracking-tighter">
              Still Haven't Registered for the <span className="text-primary-fixed animate-pulse">Fest</span>?
            </h2>
            <p className="body-lg text-on-surface-variant mb-10 max-w-xl mx-auto leading-relaxed">
              Join 5,000+ tech visionaries and cultural leaders. Register today to unlock exclusive accommodation discounts and full access to all tracks.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to="/tickets" className="w-full sm:w-auto bg-primary-fixed text-on-primary-fixed px-12 py-5 rounded-2xl font-black uppercase tracking-widest label-md shadow-2xl shadow-primary-fixed/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center">
                GET YOUR PASS
              </Link>
              <Link to="/schedule" className="w-full sm:w-auto border-2 border-secondary text-secondary px-12 py-5 rounded-2xl font-black uppercase tracking-widest label-md hover:bg-secondary/10 hover:scale-105 active:scale-95 transition-all">
                VIEW AGENDA
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
