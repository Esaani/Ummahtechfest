import { Link } from 'react-router-dom'
import NavPageLink from './NavPageLink.jsx'
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
            <a
              className="w-10 h-10 flex items-center justify-center bg-surface-container/50 border border-outline-variant/30 rounded-lg text-secondary hover:bg-primary-fixed hover:text-on-primary-fixed transition-all active:scale-90"
              href="https://www.facebook.com/share/1Axmq4Sbh1/?mibextid=wwXIfr"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            {/* Instagram */}
            <a
              className="w-10 h-10 flex items-center justify-center bg-surface-container/50 border border-outline-variant/30 rounded-lg text-secondary hover:bg-primary-fixed hover:text-on-primary-fixed transition-all active:scale-90"
              href="https://www.instagram.com/ummahtechfest?igsh=bDNjc3E5cXE3MXZi&utm_source=qr"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            {/* TikTok */}
            <a
              className="w-10 h-10 flex items-center justify-center bg-surface-container/50 border border-outline-variant/30 rounded-lg text-secondary hover:bg-primary-fixed hover:text-on-primary-fixed transition-all active:scale-90"
              href="https://www.tiktok.com/@ummahtechfest?_r=1&_t=ZS-96nlsy1Of6j"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
            </a>
            {/* WhatsApp group */}
            <a
              className="w-10 h-10 flex items-center justify-center bg-surface-container/50 border border-outline-variant/30 rounded-lg text-secondary hover:bg-primary-fixed hover:text-on-primary-fixed transition-all active:scale-90"
              href="https://chat.whatsapp.com/J9Sb6IZinng9whYsboVIqd"
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32" fill="currentColor">
                <path d="M19.11 17.47c-.27-.14-1.58-.78-1.82-.87-.24-.09-.42-.14-.6.14-.18.27-.69.87-.85 1.05-.16.18-.31.2-.58.07-.27-.14-1.13-.42-2.15-1.33-.79-.7-1.33-1.57-1.49-1.84-.16-.27-.02-.41.12-.55.12-.12.27-.31.4-.47.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.47-.07-.14-.6-1.45-.82-1.98-.22-.53-.44-.46-.6-.47h-.51c-.18 0-.47.07-.71.34-.24.27-.93.91-.93 2.22 0 1.31.95 2.58 1.09 2.76.14.18 1.87 2.86 4.53 4.01.63.27 1.12.43 1.5.55.63.2 1.2.17 1.65.1.5-.07 1.58-.65 1.8-1.27.22-.62.22-1.15.15-1.27-.07-.12-.24-.2-.51-.34z"/>
                <path d="M26.67 5.33A14.66 14.66 0 0 0 16.02 1C8.01 1 1.5 7.5 1.5 15.5c0 2.56.67 5.05 1.95 7.25L1 31l8.49-2.41A14.46 14.46 0 0 0 16.02 30c8.01 0 14.52-6.5 14.52-14.5 0-3.87-1.51-7.52-3.87-10.17zM16.02 27.6c-2.18 0-4.31-.59-6.17-1.7l-.44-.26-5.04 1.43 1.41-4.91-.29-.5a12.05 12.05 0 0 1-1.86-6.16C3.63 9 9.13 3.5 16.02 3.5c3.23 0 6.26 1.26 8.54 3.54a12.01 12.01 0 0 1 3.54 8.46c0 6.89-5.5 12.1-12.08 12.1z"/>
              </svg>
            </a>
          </div>
        </div>
        
        {/* Conference Links */}
        <div className="lg:col-span-2">
          <h5 className="text-[10px] md:label-md text-primary font-black uppercase tracking-widest mb-6 border-l-2 border-primary-fixed pl-3">Conference</h5>
          <ul className="space-y-4">
            <li><NavPageLink className="text-xs md:label-md text-on-surface-variant hover:text-primary-fixed transition-colors uppercase font-bold tracking-wider" to="/ghana-2026">Ghana 2026</NavPageLink></li>
            <li><NavPageLink className="text-xs md:label-md text-on-surface-variant hover:text-primary-fixed transition-colors uppercase font-bold tracking-wider" to="/schedule">Schedule</NavPageLink></li>
            <li><NavPageLink className="text-xs md:label-md text-on-surface-variant hover:text-primary-fixed transition-colors uppercase font-bold tracking-wider" to="/tickets">Tickets</NavPageLink></li>
            <li><Link className="text-xs md:label-md text-on-surface-variant hover:text-primary-fixed transition-colors uppercase font-bold tracking-wider" to="/sponsor">Sponsor</Link></li>
            <li><Link className="text-xs md:label-md text-on-surface-variant hover:text-primary-fixed transition-colors uppercase font-bold tracking-wider" to="/volunteer">Volunteer Program</Link></li>
            <li><Link className="text-xs md:label-md text-primary-fixed hover:text-primary-fixed transition-colors uppercase font-bold tracking-wider" to="/volunteer/apply">Apply to Volunteer</Link></li>
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
