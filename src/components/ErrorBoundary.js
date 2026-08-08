import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Page error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-ivory px-6 text-center">
          <p className="font-serif text-2xl text-emerald mb-4">Something went wrong</p>
          <p className="text-muted font-light mb-8 max-w-md">Please refresh the page. If the problem continues, try clearing your cart or signing in again.</p>
          <button
            type="button"
            onClick={() => { this.setState({ hasError: false }); window.location.href = '/'; }}
            className="luxury-btn"
          >
            Back to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
