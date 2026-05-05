import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Heading, Text, VStack, Icon } from '@chakra-ui/react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors in child components
 * and display a fallback UI instead of crashing the whole app.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Box
          minH="400px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          p={8}
        >
          <VStack gap={6} textAlign="center" maxW="md">
            <Box
              w="80px"
              h="80px"
              borderRadius="full"
              bg="red.50"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Icon as={FiAlertTriangle} w={10} h={10} color="red.500" />
            </Box>

            <VStack gap={2}>
              <Heading size="lg" color="gray.800">
                Something went wrong
              </Heading>
              <Text color="gray.600" fontSize="sm">
                An unexpected error occurred. Please try again or refresh the page.
              </Text>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Box
                  mt={4}
                  p={4}
                  bg="gray.100"
                  borderRadius="md"
                  maxW="full"
                  overflowX="auto"
                >
                  <Text
                    fontFamily="mono"
                    fontSize="xs"
                    color="red.600"
                    whiteSpace="pre-wrap"
                    wordBreak="break-word"
                  >
                    {this.state.error.message}
                  </Text>
                </Box>
              )}
            </VStack>

            <VStack gap={3}>
              <Button
                onClick={this.handleReset}
                colorScheme="red"
                size="md"
                leftIcon={<FiRefreshCw />}
              >
                Try Again
              </Button>
              <Button
                onClick={this.handleReload}
                variant="ghost"
                size="sm"
                color="gray.600"
              >
                Reload Page
              </Button>
            </VStack>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}
