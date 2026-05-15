import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function CreateAccount() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Branding & Cinematic Visual (Left Side Desktop) */}
      <section className="hidden md:flex md:w-1/2 lg:w-3/5 bg-surface-container-lowest relative overflow-hidden items-center justify-center px-margin-desktop">
        <div className="absolute inset-0 kente-tech-pattern z-0"></div>
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            className="w-full h-full object-cover opacity-40 mix-blend-luminosity"
            alt="Cinematic high-tech digital art"
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1200&auto=format&fit=crop"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 max-w-xl text-center md:text-left" data-aos="fade-right">
          <Link to="/" className="inline-flex items-center gap-base mb-8 group">
            <img src={logo} alt="Ummah Tech Fest" className="h-14 w-auto object-contain" />
            <div className="h-px w-12 bg-primary-fixed/30 group-hover:w-20 transition-all"></div>
          </Link>
          <h1 className="headline-xl mb-base text-primary">Cultivating Ihsaan in the <span className="text-primary-fixed">Digital Realm.</span></h1>
          <p className="body-lg text-on-surface-variant max-w-lg">
            Join Ghana's premier gathering of tech visionaries and cultural pioneers. Experience a fusion of innovation and Islamic values.
          </p>

          {/* Quote Block */}
          <div className="mt-16 p-6 border-l-4 border-secondary-fixed glass-card rounded-lg max-w-md backdrop-blur-xl">
            <p className="italic text-on-surface mb-2 body-md">"Excellence (Ihsaan) is to worship Allah as if you see Him; for if you do not see Him, He sees you."</p>
            <span className="label-md text-secondary-fixed uppercase tracking-widest">— The Theme of 2026</span>
          </div>
        </div>
      </section>

      {/* Registration Form Side (Right Side) */}
      <section className="flex-1 flex flex-col justify-center items-center py-12 px-margin-mobile md:px-margin-desktop bg-surface-dim relative" data-aos="fade-left">
        {/* Mobile Header */}
        <div className="md:hidden w-full text-center mb-12 flex justify-center">
          <Link to="/">
            <img src={logo} alt="Ummah Tech Fest" className="h-12 w-auto object-contain" />
          </Link>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-10 text-center md:text-left">
            <h2 className="headline-lg text-primary mb-2">Create Account</h2>
            <p className="body-md text-on-surface-variant">Join the community of excellence.</p>
          </div>

          {/* Google Sign Up */}
          <button className="w-full h-14 rounded-lg border border-outline-variant/30 flex items-center justify-center gap-base label-md text-on-surface hover:bg-surface-variant/50 transition-all active:scale-95 duration-200 mb-8">
            <img
              alt="Google Logo"
              className="w-5 h-5"
              src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png"
            />
            <span>Sign up with Google</span>
          </button>

          <div className="relative flex items-center mb-8">
            <div className="flex-grow border-t border-outline-variant/20"></div>
            <span className="flex-shrink mx-4 label-md text-on-surface-variant">or register with email</span>
            <div className="flex-grow border-t border-outline-variant/20"></div>
          </div>

          {/* Registration Form */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Full Name */}
            <div className="group">
              <label className="block label-md text-on-surface-variant mb-2 group-focus-within:text-secondary-fixed transition-colors">Full Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">person</span>
                <input
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg pl-12 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed/50 focus:border-primary-fixed outline-none transition-all"
                  placeholder="Zaid Abubakar"
                  type="text"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="group">
              <label className="block label-md text-on-surface-variant mb-2 group-focus-within:text-secondary-fixed transition-colors">Email Address</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">mail</span>
                <input
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg pl-12 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed/50 focus:border-primary-fixed outline-none transition-all"
                  placeholder="zaid@example.com"
                  type="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block label-md text-on-surface-variant mb-2 group-focus-within:text-secondary-fixed transition-colors">Password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">lock</span>
                <input
                  className="w-full h-14 bg-surface-container-low border border-outline-variant/30 rounded-lg pl-12 text-on-surface placeholder:text-on-surface-variant/40 focus:ring-2 focus:ring-primary-fixed/50 focus:border-primary-fixed outline-none transition-all"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
            </div>

            {/* Primary Action Button */}
            <button className="w-full h-14 bg-primary-fixed text-on-primary-fixed label-md font-bold rounded-lg hover:shadow-[0_0_20px_rgba(163,250,1,0.4)] transition-all active:scale-95 duration-200 uppercase tracking-widest" type="submit">
              Apply Now
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="body-md text-on-surface-variant">
              Already have an account?
              <Link className="text-secondary-fixed font-bold hover:underline decoration-2 underline-offset-4 ml-1" to="/login">Login</Link>
            </p>
          </div>
        </div>

      </section>
    </main>
  )
}
