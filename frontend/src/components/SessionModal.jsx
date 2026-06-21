import { useEffect } from 'react'
import SkeletonImage from './SkeletonImage'

export default function SessionModal({ isOpen, onClose, session }) {
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen || !session) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-surface-container-lowest/90 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <section className="glass-panel w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl relative shadow-2xl kente-border animate-in zoom-in-95 fade-in duration-300">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-primary-fixed hover:scale-110 transition-all p-2 z-[70]"
        >
          <span className="material-symbols-outlined text-3xl">close</span>
        </button>

        <div className="p-8 md:p-12">
          {/* Modal Header */}
          <header className="mb-10">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className="px-4 py-1 bg-primary-fixed/20 text-primary-fixed rounded-full label-md text-xs border border-primary-fixed/30 uppercase tracking-widest font-bold">
                Track: {session.track}
              </span>
              <div className="flex items-center gap-2 text-on-surface-variant label-md text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-primary-fixed text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>schedule</span>
                {session.time}
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant label-md text-xs uppercase tracking-wider">
                <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                {session.location}
              </div>
            </div>
            <h2 className="headline-lg text-primary leading-tight max-w-4xl uppercase tracking-tighter">
              {session.title}
            </h2>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left: Description & Outcomes */}
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h3 className="headline-sm text-secondary mb-4 uppercase tracking-widest">Session Description</h3>
                <p className="body-lg text-on-surface-variant leading-relaxed">
                  {session.description || "This session explores the profound intersections between Islamic legal theory and contemporary technological challenges. Join us for a deep dive into ethics, innovation, and community impact."}
                </p>
              </section>

              <section className="bg-surface-container-low p-8 rounded-2xl border-l-4 border-primary-fixed shadow-inner">
                <h3 className="headline-sm text-primary mb-6 uppercase tracking-widest">What to expect</h3>
                <ul className="space-y-4">
                  {(session.outcomes || [
                    "In-depth analysis of ethical frameworks in modern tech.",
                    "Real-world case studies and practical implementations.",
                    "Interactive Q&A session with industry leaders."
                  ]).map((outcome, i) => (
                    <li key={i} className="flex gap-4 items-start">
                      <span className="material-symbols-outlined text-primary-fixed shrink-0 mt-0.5">check_circle</span>
                      <p className="body-md text-on-surface">{outcome}</p>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-6">
                <button className="bg-primary-fixed text-on-primary-fixed font-bold px-8 py-4 rounded-xl flex items-center gap-3 hover:scale-105 transition-all shadow-lg shadow-primary-fixed/20 uppercase tracking-widest label-md">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_add_on</span>
                  Add to Calendar
                </button>
                <button className="border-2 border-secondary text-secondary font-bold px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-secondary/10 hover:scale-105 transition-all uppercase tracking-widest label-md">
                  <span className="material-symbols-outlined">share</span>
                  Share Session
                </button>
              </div>
            </div>

            {/* Right: Speaker Profile */}
            <aside className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/30 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <span className="material-symbols-outlined text-6xl">school</span>
                </div>
                <SkeletonImage
                  src={session.speaker?.image || undefined}
                  alt={session.speaker?.name}
                  className="aspect-square rounded-xl mb-6 border-2 border-primary-fixed/20"
                  imgClassName="object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-110 group-hover:scale-100"
                />
                <h4 className="headline-sm text-primary-fixed mb-1 uppercase tracking-tighter">{session.speaker?.name || "Dr. Omar Al-Faruqi"}</h4>
                <p className="label-md text-secondary uppercase tracking-widest mb-4 text-xs">{session.speaker?.role || "Lead Ethicist, Tech Council"}</p>
                <p className="body-md text-on-surface-variant mb-6 italic leading-relaxed">
                  "{session.speaker?.quote || "Bridging the gap between revelation and the algorithm to ensure a human-centric digital future."}"
                </p>
                
                <div className="flex gap-4 pt-4 border-t border-outline-variant/20">
                  {[
                    { icon: 'web', label: 'Website' },
                    { icon: 'description', label: 'Paper' },
                    { icon: 'link', label: 'Social' }
                  ].map((social, i) => (
                    <a key={i} className="p-3 bg-surface-container-high rounded-xl text-primary-fixed hover:bg-primary-fixed hover:text-on-primary-fixed transition-all hover:scale-110" href="#" title={social.label}>
                      <span className="material-symbols-outlined text-xl">{social.icon}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="p-6 border border-outline-variant/20 rounded-2xl bg-surface-container-lowest/50 group cursor-pointer hover:border-primary-fixed/50 transition-colors">
                <p className="label-md text-on-surface-variant mb-3 uppercase tracking-widest text-[10px]">Recommended Pre-reading</p>
                <a className="text-primary-fixed font-bold flex items-center gap-2 hover:translate-x-1 transition-transform" href="#">
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                  Maqasid Principles in Tech
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
