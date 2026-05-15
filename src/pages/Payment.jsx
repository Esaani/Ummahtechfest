import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Payment() {
  const [method, setMethod] = useState('momo')
  const navigate = useNavigate()

  const paymentMethods = [
    { id: 'momo', name: 'Mobile Money', icon: 'smartphone', description: 'MTN MoMo, Telecel Cash, AT Money' },
    { id: 'card', name: 'Credit/Debit Card', icon: 'credit_card', description: 'Visa, Mastercard, American Express' },
    { id: 'bank', name: 'Bank Transfer', icon: 'account_balance', description: 'Direct transfer to Ummah Tech account' }
  ]

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed font-body kente-pattern">
      <div className="flex max-w-container-max mx-auto pt-24 min-h-screen">
        {/* SideNavBar */}
        <aside className="hidden lg:flex flex-col p-6 gap-4 h-[calc(100vh-6rem)] sticky top-24 bg-surface-container-low/60 backdrop-blur-md border-r border-outline-variant/30 w-80">
          <div className="mb-8">
            <h2 className="headline-sm text-primary-fixed">Registration</h2>
            <p className="body-md text-on-surface-variant">Ghana 2026 Edition</p>
          </div>
          <nav className="space-y-2">
            <Link to="/signup" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-bright/20 rounded-lg transition-all duration-200">
              <span className="material-symbols-outlined">confirmation_number</span>
              <span className="label-md">Pass Selection</span>
            </Link>
            <Link to="/create-account" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-bright/20 rounded-lg transition-all duration-200">
              <span className="material-symbols-outlined">person</span>
              <span className="label-md">Basic Info</span>
            </Link>
            <Link to="/verification" className="flex items-center gap-3 p-3 text-on-surface-variant hover:bg-surface-bright/20 rounded-lg transition-all duration-200">
              <span className="material-symbols-outlined">verified</span>
              <span className="label-md">Verification</span>
            </Link>
            <div className="flex items-center gap-3 p-3 bg-primary-fixed/10 text-primary-fixed border border-primary-fixed/20 rounded-lg font-bold transition-all duration-200">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>payments</span>
              <span className="label-md">Payment</span>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-12">
          <header className="mb-12" data-aos="fade-up">
            <div className="flex items-center gap-4 mb-2">
              <span className="bg-primary-fixed text-on-primary-fixed px-3 py-1 rounded label-md font-bold uppercase tracking-wider">STEP 04</span>
              <h1 className="headline-lg text-primary">Secure Payment</h1>
            </div>
            <p className="body-lg text-on-surface-variant max-w-2xl">
              Complete your registration by choosing your preferred payment method. All transactions are encrypted and processed securely.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <section className="lg:col-span-2 space-y-8" data-aos="fade-up">
              {/* Method Selection */}
              <div className="space-y-4">
                <h3 className="label-md text-secondary uppercase tracking-widest">Select Payment Method</h3>
                <div className="grid grid-cols-1 gap-4">
                  {paymentMethods.map((pm) => (
                    <button
                      key={pm.id}
                      onClick={() => setMethod(pm.id)}
                      className={`flex items-center gap-6 p-6 rounded-xl border transition-all text-left group ${
                        method === pm.id 
                        ? 'bg-primary-fixed/10 border-primary-fixed border-2' 
                        : 'glass-card border-outline-variant/30 hover:border-primary-fixed/50'
                      }`}
                    >
                      <div className={`p-4 rounded-full transition-colors ${
                        method === pm.id ? 'bg-primary-fixed text-on-primary-fixed' : 'bg-surface-bright text-on-surface-variant group-hover:text-primary-fixed'
                      }`}>
                        <span className="material-symbols-outlined">{pm.icon}</span>
                      </div>
                      <div className="flex-1">
                        <p className="headline-sm text-on-surface">{pm.name}</p>
                        <p className="body-md text-on-surface-variant text-sm">{pm.description}</p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        method === pm.id ? 'border-primary-fixed bg-primary-fixed' : 'border-outline-variant/50'
                      }`}>
                        {method === pm.id && <span className="material-symbols-outlined text-xs text-on-primary-fixed font-bold">check</span>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Form Area */}
              <div className="glass-card p-8 rounded-2xl kente-border relative overflow-hidden">
                <div className="flex items-center gap-3 mb-8">
                  <span className="material-symbols-outlined text-secondary">shield</span>
                  <h3 className="headline-sm text-white">Payment Details</h3>
                </div>

                {method === 'momo' && (
                  <div className="space-y-6" data-aos="fade-in">
                    <div className="flex flex-col gap-2">
                      <label className="label-md text-secondary uppercase tracking-wider">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant label-md">+233</span>
                        <input className="w-full h-14 bg-surface-container-high border border-outline-variant/30 rounded-lg pl-16 pr-4 text-on-surface focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none transition-all" placeholder="24 123 4567" type="tel"/>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="label-md text-secondary uppercase tracking-wider">Network Provider</label>
                      <div className="flex gap-4">
                        {['MTN', 'Telecel', 'AT'].map((net) => (
                          <button key={net} type="button" className="flex-1 py-3 border border-outline-variant/30 rounded-lg label-md hover:border-primary-fixed hover:bg-primary-fixed/5 transition-all focus:bg-primary-fixed/10 focus:border-primary-fixed outline-none">{net}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {method === 'card' && (
                  <div className="space-y-6" data-aos="fade-in">
                    <div className="flex flex-col gap-2">
                      <label className="label-md text-secondary uppercase tracking-wider">Cardholder Name</label>
                      <input className="w-full h-14 bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 text-on-surface focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none transition-all" placeholder="ZAID ABUBAKAR" type="text"/>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="label-md text-secondary uppercase tracking-wider">Card Number</label>
                      <input className="w-full h-14 bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 text-on-surface focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none transition-all" placeholder="0000 0000 0000 0000" type="text"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <label className="label-md text-secondary uppercase tracking-wider">Expiry Date</label>
                        <input className="w-full h-14 bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 text-on-surface focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none transition-all" placeholder="MM/YY" type="text"/>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="label-md text-secondary uppercase tracking-wider">CVV</label>
                        <input className="w-full h-14 bg-surface-container-high border border-outline-variant/30 rounded-lg px-4 text-on-surface focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none transition-all" placeholder="123" type="password"/>
                      </div>
                    </div>
                  </div>
                )}

                {method === 'bank' && (
                  <div className="space-y-4 p-4 bg-surface-bright/20 rounded-lg border border-outline-variant/30" data-aos="fade-in">
                    <p className="body-md text-on-surface">Please transfer the total amount to:</p>
                    <div className="space-y-2 font-mono text-sm text-primary-fixed">
                      <p>Bank: GCB Bank Limited</p>
                      <p>Account Name: Ummah Tech Fest Ghana</p>
                      <p>Account Number: 1234567890123</p>
                      <p>Branch: High Street, Accra</p>
                    </div>
                    <p className="body-md text-on-surface-variant text-xs italic mt-4">Reference: Your Registration Email Address</p>
                  </div>
                )}
              </div>

              <button 
                onClick={() => navigate('/success')}
                className="w-full bg-primary-fixed text-on-primary-fixed py-6 rounded-xl headline-sm font-bold shadow-[0_0_30px_rgba(163,250,1,0.3)] hover:shadow-[0_0_50px_rgba(163,250,1,0.5)] active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-4 group"
              >
                Pay GHS 475.00 Securely
                <span className="material-symbols-outlined group-hover:translate-x-2 transition-transform">lock</span>
              </button>
            </section>

            {/* Final Summary Sidebar */}
            <aside className="space-y-6" data-aos="fade-left">
              <div className="glass-card p-6 rounded-xl border-l-4 border-l-primary-fixed">
                <h3 className="headline-sm text-primary mb-4">Final Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="label-md text-primary-fixed uppercase tracking-widest">Selected Pass</p>
                      <p className="headline-sm">Delegate Pass</p>
                    </div>
                    <span className="material-symbols-outlined text-secondary">confirmation_number</span>
                  </div>
                  <div className="space-y-2 pt-4 border-t border-outline-variant/30">
                    <div className="flex justify-between body-md text-on-surface-variant">
                      <span>Registration Fee</span>
                      <span>GHS 450.00</span>
                    </div>
                    <div className="flex justify-between body-md text-on-surface-variant">
                      <span>Service Fee</span>
                      <span>GHS 25.00</span>
                    </div>
                    <div className="flex justify-between headline-md text-primary-fixed pt-4 border-t-2 border-primary-fixed/30">
                      <span>Total Due</span>
                      <span>GHS 475.00</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 glass-card rounded-xl border border-outline-variant/20 flex items-start gap-4">
                <span className="material-symbols-outlined text-secondary">info</span>
                <p className="body-md text-on-surface-variant text-sm">
                  Upon successful payment, your digital ticket and receipt will be sent immediately to your verified email address.
                </p>
              </div>

              <div className="flex justify-center gap-8 opacity-40">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-6 grayscale hover:grayscale-0 transition-all cursor-default" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6 grayscale hover:grayscale-0 transition-all cursor-default" />
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
