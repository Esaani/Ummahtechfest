import { Link } from 'react-router-dom'
import logo from '../assets/logo.png'

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex flex-col items-center justify-center px-margin-mobile md:px-margin-desktop py-24 text-center">
      <img src={logo} alt="" className="h-16 w-auto mb-8 opacity-90" />
      <p className="label-md text-primary-fixed uppercase tracking-[0.3em] mb-4">404</p>
      <h1 className="headline-lg text-primary mb-4 uppercase">Page not found</h1>
      <p className="body-lg text-on-surface-variant max-w-md mb-10">
        The page you are looking for does not exist, was moved, or is not available yet.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/" className="btn-primary">
          Back to home
        </Link>
        <Link to="/login" className="btn-secondary">
          Sign in
        </Link>
      </div>
    </main>
  )
}
