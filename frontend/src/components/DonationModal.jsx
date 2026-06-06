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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-8">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <section
        className="glass-panel w-full max-w-md max-h-[90vh] overflow-y-auto rounded-[2rem] relative shadow-[0_0_80px_rgba(163,250,1,0.15)] border border-primary-fixed/20 animate-in fade-in zoom-in duration-500 no-scrollbar"
        role="dialog"
        aria-modal="true"
        aria-labelledby="donation-modal-title"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-primary-fixed p-2 z-10 transition-colors"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-2xl">close</span>
        </button>

        <div className="p-5 md:p-10">
          <DonationWidget isModal />
        </div>
      </section>
    </div>
  )
}
