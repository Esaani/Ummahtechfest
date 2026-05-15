import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant/20 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-fixed/5 blur-[120px] rounded-full"></div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 py-8 md:py-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto relative z-10">
        {/* Brand & Socials */}
        <div className="lg:col-span-4">
          <Link to="/" className="inline-block mb-6">
            <img src={logo} alt="Ummah Tech Fest" className="h-12 w-auto object-contain" />
          </Link>
          <p className="text-sm md:body-md text-on-surface-variant max-w-md mb-8">
            Empowering the Next Generation of Muslim Tech Talent. Join us in Accra for an unforgettable experience of growth and innovation.
          </p>
          <div className="flex gap-4">
            {/* Facebook */}
            <a className="w-10 h-10 flex items-center justify-center bg-surface-container/50 border border-outline-variant/30 rounded-lg text-secondary hover:bg-primary-fixed hover:text-on-primary-fixed transition-all active:scale-90" href="#" aria-label="Facebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* Instagram */}
            <a className="w-10 h-10 flex items-center justify-center bg-surface-container/50 border border-outline-variant/30 rounded-lg text-secondary hover:bg-primary-fixed hover:text-on-primary-fixed transition-all active:scale-90" href="#" aria-label="Instagram">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            {/* TikTok */}
            <a className="w-10 h-10 flex items-center justify-center bg-surface-container/50 border border-outline-variant/30 rounded-lg text-secondary hover:bg-primary-fixed hover:text-on-primary-fixed transition-all active:scale-90" href="#" aria-label="TikTok">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
            </a>
            {/* LinkedIn */}
            <a className="w-10 h-10 flex items-center justify-center bg-surface-container/50 border border-outline-variant/30 rounded-lg text-secondary hover:bg-primary-fixed hover:text-on-primary-fixed transition-all active:scale-90" href="#" aria-label="LinkedIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
          </div>
        </div>
        
        {/* Conference Links */}
        <div className="lg:col-span-2">
          <h5 className="text-[10px] md:label-md text-primary font-black uppercase tracking-widest mb-6 border-l-2 border-primary-fixed pl-3">Conference</h5>
          <ul className="space-y-4">
            <li><Link className="text-xs md:label-md text-on-surface-variant hover:text-primary-fixed transition-colors uppercase font-bold tracking-wider" to="/ghana-2026">Ghana 2026</Link></li>
            <li><Link className="text-xs md:label-md text-on-surface-variant hover:text-primary-fixed transition-colors uppercase font-bold tracking-wider" to="/schedule">Schedule</Link></li>
            <li><Link className="text-xs md:label-md text-on-surface-variant hover:text-primary-fixed transition-colors uppercase font-bold tracking-wider" to="/tickets">Tickets</Link></li>
            <li><Link className="text-xs md:label-md text-on-surface-variant hover:text-primary-fixed transition-colors uppercase font-bold tracking-wider" to="/sponsor">Sponsor</Link></li>
          </ul>
        </div>
        
        {/* Information Links */}
        <div className="lg:col-span-2">
          <h5 className="text-[10px] md:label-md text-primary font-black uppercase tracking-widest mb-6 border-l-2 border-secondary pl-3">Information</h5>
          <ul className="space-y-4">
            <li><a className="text-xs md:label-md text-on-surface-variant hover:text-secondary transition-colors uppercase font-bold tracking-wider" href="#">Privacy Policy</a></li>
            <li><a className="text-xs md:label-md text-on-surface-variant hover:text-secondary transition-colors uppercase font-bold tracking-wider" href="#">Code of Conduct</a></li>
            <li><a className="text-xs md:label-md text-on-surface-variant hover:text-secondary transition-colors uppercase font-bold tracking-wider" href="#">Contact Us</a></li>
            <li><a className="text-xs md:label-md text-on-surface-variant hover:text-secondary transition-colors uppercase font-bold tracking-wider" href="#">Press Kit</a></li>
          </ul>
        </div>

        {/* Subscribe Section */}
        <div className="lg:col-span-4">
          <h5 className="text-[10px] md:label-md text-primary font-black uppercase tracking-widest mb-4 border-l-2 border-primary-fixed pl-3">Stay Updated</h5>
          <p className="text-sm text-on-surface-variant mb-6">
            Subscribe to our newsletter to receive the latest updates, speaker announcements, and exclusive early-bird ticket offers.
          </p>
          <form className="flex flex-col sm:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 bg-surface-container border border-outline-variant/30 rounded-lg px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed transition-all"
              required
            />
            <button 
              type="submit" 
              className="bg-primary-fixed text-on-primary-fixed px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(163,250,1,0.2)]"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
      
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 border-t border-outline-variant/10 flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
        <p className="text-[10px] md:label-md text-on-surface-variant/60 uppercase tracking-widest">© 2026 Ummah Tech Fest Ghana. Crafted with Iman and Innovation.</p>
        <div className="flex gap-6">
           <span className="text-[10px] text-secondary font-black uppercase tracking-widest">Shared with the Ummah</span>
        </div>
      </div>
    </footer>
  )
}
