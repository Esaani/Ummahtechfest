import { useEffect } from 'react'

export default function SpeakerBioModal({ isOpen, onClose, speaker }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen || !speaker) return null

  const image = speaker.image || speaker.img || ''

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-surface-container-lowest/90 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <section
        className="glass-panel w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl relative shadow-2xl kente-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="speaker-modal-name"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary-fixed p-2 z-10"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <div className="p-6 md:p-8">
          <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            {image && (
              <div className="w-28 h-28 sm:w-32 sm:h-32 shrink-0 rounded-xl overflow-hidden border-2 border-primary-fixed/30">
                <img src={image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="text-center sm:text-left min-w-0">
              <h2 id="speaker-modal-name" className="headline-sm text-primary uppercase">{speaker.name}</h2>
              {speaker.role && (
                <p className="label-md text-primary-fixed uppercase tracking-widest text-[10px] mt-1">{speaker.role}</p>
              )}
            </div>
          </div>
          {speaker.bio && (
            <div className="mt-6 pt-6 border-t border-outline-variant/20">
              <h3 className="label-md text-on-surface-variant uppercase tracking-widest text-[10px] mb-3">Bio</h3>
              <p className="body-md text-on-surface-variant leading-relaxed whitespace-pre-wrap">{speaker.bio}</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
