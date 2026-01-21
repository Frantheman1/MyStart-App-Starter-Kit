/**
 * Error Boundary
 * 
 * Catches React errors and displays a fallback UI.
 * 
 * Usage:
 *   <ErrorBoundary>
 *     <App />
 *   </ErrorBoundary>
 */

import React, { Component, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from '@/components/ui';
import { logger } from '@/lib/logging/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    logger.error('React Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text variant="h2" align="center" style={styles.title}>
              Oops! Something went wrong
            </Text>
            <Text variant="body" color="secondary" align="center" style={styles.message}>
              We're sorry for the inconvenience. The error has been logged and we'll look into it.
            </Text>
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text variant="caption" color="error">
                  {this.state.error.message}
                </Text>
              </View>
            )}
            <Button variant="primary" onPress={this.handleReset} style={styles.button}>
              Try Again
            </Button>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
  },
  title: {
    marginBottom: 16,
  },
  message: {
    marginBottom: 24,
  },
  errorDetails: {
    padding: 12,
    backgroundColor: '#fee',
    borderRadius: 8,
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
});
