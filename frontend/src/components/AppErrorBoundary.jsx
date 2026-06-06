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
          <div className="max-w-lg space-y-4 text-center">
            <h1 className="text-xl font-bold text-primary-fixed">Something went wrong</h1>
            <p className="text-sm text-on-surface-variant">
              The page crashed while loading. Try a hard refresh (Ctrl+Shift+R). If you use Brave,
              disable Shields for this site or use{' '}
              <a href="http://localhost:5173" className="text-primary-fixed underline">
                localhost:5173
              </a>
              .
            </p>
            <pre className="text-left text-xs bg-surface-container p-4 rounded-lg overflow-auto text-error">
              {this.state.error.message}
            </pre>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
