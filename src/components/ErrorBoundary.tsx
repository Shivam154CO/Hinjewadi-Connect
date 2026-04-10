import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In production, integrate services here: Sentry.captureException(error);
    console.error('CRASH REPORT (Caught by Boundary):', error, errorInfo);
  }

  private handleRestart = () => {
    // Resetting state will attempt to re-render the children
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.icon}>⚠️</Text>
                <Text style={styles.title}>Oops, something went wrong</Text>
                <Text style={styles.subtitle}>
                    We apologize for the inconvenience. An unexpected error occurred.
                </Text>
                
                {/* Shows the exact code error only during development */}
                {__DEV__ && this.state.error && (
                    <Text style={styles.errorText}>{this.state.error.toString()}</Text>
                )}
                
                <TouchableOpacity style={styles.button} onPress={this.handleRestart}>
                    <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  icon: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#6B7280', textAlign: 'center', marginBottom: 24, lineHeight: 24 },
  errorText: { backgroundColor: '#FEE2E2', color: '#B91C1C', padding: 12, borderRadius: 8, marginBottom: 24, fontSize: 12, width: '100%', fontFamily: 'monospace' },
  button: { backgroundColor: '#4F46E5', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' }
});
