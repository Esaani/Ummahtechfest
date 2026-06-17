import { Component } from 'react'

export default class AppErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <main
          className="min-h-screen flex items-center justify-center px-6 py-16"
          style={{ background: '#131313', color: '#e5e2e1' }}
        >
          <div className="max-w-lg space-y-6 text-center">
            <h1 className="text-xl font-bold text-primary-fixed">Something went wrong</h1>
            <p className="text-sm text-on-surface-variant">
              An unexpected error occurred. Try refreshing the page — if the problem persists,
              please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 rounded-lg bg-primary-fixed text-on-primary-fixed text-sm font-bold uppercase tracking-widest"
              >
                Reload page
              </button>
              <a
                href="/"
                className="px-6 py-3 rounded-lg border border-outline-variant/50 text-on-surface-variant text-sm font-bold uppercase tracking-widest"
              >
                Go to home
              </a>
            </div>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
