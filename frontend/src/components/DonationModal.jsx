import { useEffect } from 'react'
import DonationWidget from './DonationWidget'

export default function DonationModal({ isOpen, onClose }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <section
        className="glass-panel w-full max-w-2xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] relative shadow-[0_0_80px_rgba(163,250,1,0.15)] border border-primary-fixed/20 animate-in fade-in zoom-in duration-500 no-scrollbar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 text-on-surface-variant hover:text-primary-fixed p-2 z-10 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <div className="p-8 md:p-12">
          <DonationWidget isModal />
        </div>
      </section>
    </div>
  )
}
