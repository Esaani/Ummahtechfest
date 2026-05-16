export default function Sponsor() {
  return (
    <main className="pt-24 md:pt-32 pb-20">
      {/* Hero Section */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-16 md:mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="text-center lg:text-left" data-aos="fade-right">
            <span className="label-md text-secondary tracking-widest uppercase mb-4 block text-[10px] md:text-xs">Partner with Excellence</span>
            <h1 className="text-4xl md:headline-xl text-primary mb-6 uppercase leading-tight">Empower the Future of <span className="text-primary-fixed">Muslim Tech.</span></h1>
            <p className="text-sm md:body-lg text-on-surface-variant mb-8 max-w-xl mx-auto lg:mx-0">
              Join us in Accra for West Africa's most influential gathering of Muslim technologists, innovators, and entrepreneurs. Showcase your brand to 5,000+ attendees.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <a className="btn-primary w-full sm:w-auto text-center" href="#inquiry">Download Prospectus</a>
              <a className="btn-secondary w-full sm:w-auto text-center" href="#tiers">View Tiers</a>
            </div>
          </div>
          <div className="relative hidden lg:block" data-aos="fade-left">
            <div className="aspect-square rounded-2xl overflow-hidden kente-border">
              <img className="w-full h-full object-cover hover:grayscale-0 transition-all duration-700" src="/assets/images/platform-shift.jpg" />
            </div>
            <div className="absolute -bottom-6 -left-6 glass-panel p-6 rounded-xl border-l-4 border-primary-fixed max-w-xs shadow-2xl">
              <p className="headline-sm text-primary-fixed mb-1">5,000+</p>
              <p className="label-md text-on-surface uppercase text-[10px] tracking-widest font-black">Targeted Tech Professionals</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-24" id="tiers">
        <div className="text-center mb-12 md:mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:headline-lg text-primary mb-4 uppercase">Sponsorship <span className="text-primary-fixed">Tiers</span></h2>
          <div className="h-1 w-24 bg-primary-fixed mx-auto"></div>
        </div>
        
        <div className="overflow-x-auto no-scrollbar pb-8" data-aos="fade-up">
          <table className="w-full border-collapse glass-panel rounded-2xl overflow-hidden min-w-[800px]">
            <thead>
              <tr className="bg-surface-container-high text-left">
                <th className="p-8 headline-sm text-primary">Benefits</th>
                <th className="p-8 text-center border-x border-outline-variant/30">
                  <div className="headline-sm text-secondary uppercase">Silver</div>
                  <div className="label-md text-on-surface-variant font-normal mt-2">₵5,000</div>
                </th>
                <th className="p-8 text-center border-x border-outline-variant/30 bg-primary-fixed/5">
                  <div className="headline-sm text-primary-fixed uppercase">Gold</div>
                  <div className="label-md text-on-surface-variant font-normal mt-2">₵15,000</div>
                </th>
                <th className="p-8 text-center">
                  <div className="headline-sm text-primary uppercase">Diamond</div>
                  <div className="label-md text-on-surface-variant font-normal mt-2">₵35,000</div>
                </th>
              </tr>
            </thead>
            <tbody className="text-on-surface">
              {[
                ["Exhibition Booth Size", "3x3m Standard", "6x3m Premium", "9x6m Custom Island"],
                ["Speaking Slot", "✕", "15 Min Keynote", "30 Min + Panel"],
                ["Logo Placement", "Marketing Assets", "Premium Assets", "Primary Branding"],
                ["VIP Tickets", "2", "5", "15"],
                ["Talent Access", "✕", "✔", "✔"]
              ].map((row, i) => (
                <tr key={i} className="border-t border-outline-variant/20 hover:bg-white/5 transition-colors">
                  <td className="p-6 label-md text-primary font-bold uppercase">{row[0]}</td>
                  <td className="p-6 text-center border-x border-outline-variant/20 text-sm md:text-base">{row[1]}</td>
                  <td className="p-6 text-center border-x border-outline-variant/20 bg-primary-fixed/5 font-bold text-sm md:text-base text-primary-fixed">{row[2]}</td>
                  <td className="p-6 text-center text-sm md:text-base">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-[10px] md:label-md text-on-surface-variant uppercase tracking-widest mt-4">Scroll horizontally to view all tiers</p>
      </section>

      {/* Why Sponsor */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { 
              icon: "groups", 
              title: "Network with Leaders", 
              desc: "Connect directly with CTOs, Founders, and Policy makers from across the ECOWAS region." 
            },
            { 
              icon: "campaign", 
              title: "Brand Visibility", 
              desc: "Your brand showcased across 20+ media outlets and a combined reach of over 1.2M tech enthusiasts." 
            },
            { 
              icon: "school", 
              title: "Talent Pipeline", 
              desc: "Recruit from a curated pool of top-tier developers and engineers specializing in modern stacks." 
            }
          ].map((item, i) => (
            <div key={i} className="glass-panel p-10 rounded-2xl relative overflow-hidden group hover:border-primary-fixed transition-all duration-500" data-aos="fade-up" data-aos-delay={i * 100}>
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-[100px] md:text-[120px]">{item.icon}</span>
              </div>
              <h3 className="headline-sm text-primary mb-4 uppercase font-bold">{item.title}</h3>
              <p className="text-sm md:body-md text-on-surface-variant relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Partner Inquiry Form */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop" id="inquiry">
        <div className="glass-panel rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-5 border border-outline-variant/30 shadow-2xl">
          <div className="lg:col-span-2 p-8 md:p-12 bg-surface-container-high/50 border-r border-outline-variant/20">
            <h2 className="text-2xl md:headline-md text-primary mb-6 uppercase font-bold">Partner <span className="text-primary-fixed">Inquiry</span></h2>
            <p className="text-sm md:body-md text-on-surface-variant mb-10">
              Ready to make an impact? Fill out the form and our partnership team will reach out within 24 hours.
            </p>
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed/10 flex items-center justify-center border border-primary-fixed/20">
                  <span className="material-symbols-outlined text-primary-fixed">mail</span>
                </div>
                <div>
                  <p className="text-[10px] label-md text-on-surface-variant uppercase tracking-widest font-black">Email Us</p>
                  <p className="text-sm md:body-md text-primary font-bold">partners@ummahtechfest.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary-fixed/10 flex items-center justify-center border border-primary-fixed/20">
                  <span className="material-symbols-outlined text-primary-fixed">call</span>
                </div>
                <div>
                  <p className="text-[10px] label-md text-on-surface-variant uppercase tracking-widest font-black">Phone</p>
                  <p className="text-sm md:body-md text-primary font-bold">+233 24 086 3405</p>
                  <p className="text-sm md:body-md text-primary font-bold">+233 24 584 5315</p>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 p-8 md:p-12">
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] label-md text-secondary uppercase tracking-widest font-black">Full Name</label>
                <input className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all text-sm" placeholder="Your Name" type="text"/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] label-md text-secondary uppercase tracking-widest font-black">Company Name</label>
                <input className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all text-sm" placeholder="Org Name" type="text"/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] label-md text-secondary uppercase tracking-widest font-black">Work Email</label>
                <input className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all text-sm" placeholder="email@company.com" type="email"/>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] label-md text-secondary uppercase tracking-widest font-black">Interest Tier</label>
                <div className="relative">
                  <select className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all appearance-none text-sm cursor-pointer">
                    <option>Diamond Partner</option>
                    <option>Gold Partner</option>
                    <option>Silver Partner</option>
                    <option>Custom Sponsorship</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] label-md text-secondary uppercase tracking-widest font-black">Requirements</label>
                <textarea className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-xl p-4 focus:border-primary-fixed focus:ring-1 focus:ring-primary-fixed outline-none text-on-surface transition-all text-sm" placeholder="How can we help?" rows="4"></textarea>
              </div>
              <div className="md:col-span-2">
                <button className="w-full btn-primary py-5 rounded-xl font-bold uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95" type="submit">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
