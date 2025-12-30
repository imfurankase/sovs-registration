import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';

/**
 * Hook to handle deep linking for Didit callback
 */
export const useDeepLink = (onDeepLink?: (url: string) => void) => {
  const [initialUrl, setInitialUrl] = useState<string | null>(null);

  useEffect(() => {
    const getInitialUrl = async () => {
      const url = await Linking.getInitialURL();
      if (url != null) {
        setInitialUrl(url);
        onDeepLink?.(url);
      }
    };

    const subscription = Linking.addEventListener('url', ({ url }) => {
      onDeepLink?.(url);
    });

    getInitialUrl();

    return () => {
      subscription.remove();
    };
  }, [onDeepLink]);

  return initialUrl;
};

/**
 * Extract session ID from deep link URL
 */
export const extractSessionIdFromUrl = (url: string): string | null => {
  try {
    const parsed = Linking.parse(url);
    const sessionId = parsed.queryParams?.session_id as string | null;
    return sessionId || null;
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
};
