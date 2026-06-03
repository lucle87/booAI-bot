"use client";

import React from 'react';

export class ClientErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ClientErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', color: '#ffb3b3', background: '#2a1222', minHeight: '100vh' }}>
          <h1 style={{ marginTop: 0 }}>Something went wrong</h1>
          <p>The app encountered an error while rendering. Please refresh the page or try again.</p>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: '1rem', color: '#ffd7d7' }}>
            {String(this.state.error)}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
