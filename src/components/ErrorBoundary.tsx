'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary для обработки ошибок React компонентов
 * Предотвращает полный краш приложения при ошибках в компонентах
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Логируем ошибку для мониторинга
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    
    // В продакшене можно отправить в систему мониторинга
    if (process.env.NODE_ENV === 'production') {
      // Можно интегрировать с Sentry, LogRocket и т.д.
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    // Перезагружаем страницу для полного сброса состояния
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <div className="max-w-md w-full space-y-4">
            <Card className="border-destructive/50 bg-destructive/10">
              <CardHeader>
                <CardTitle className="text-destructive">Произошла ошибка</CardTitle>
                <CardDescription className="text-destructive/80">
                  {this.state.error?.message || 'Неожиданная ошибка приложения'}
                </CardDescription>
              </CardHeader>
            </Card>
            <div className="flex gap-2">
              <Button onClick={this.handleReset} className="flex-1">
                Перезагрузить страницу
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = '/'}
                className="flex-1"
              >
                На главную
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
