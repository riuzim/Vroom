import { Component } from 'react';
import i18n from '@/i18n';
import { Button } from '@/components/ui/button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
          <h1 className="font-display text-2xl uppercase tracking-[0.22em] text-flame">
            {i18n.t('errorBoundary.title')}
          </h1>
          <p className="text-sm text-bone/60">{i18n.t('errorBoundary.body')}</p>
          <Button onClick={() => window.location.reload()}>
            {i18n.t('errorBoundary.reload')}
          </Button>
        </main>
      );
    }

    return this.props.children;
  }
}
