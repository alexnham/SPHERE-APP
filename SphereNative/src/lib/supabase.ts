import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Supabase configuration - using the same project as dashboard.html
const SUPABASE_URL = 'https://dvzwvyjdsrgcgnvejbhs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2end2eWpkc3JnY2dudmVqYmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MTU4MzAsImV4cCI6MjA4MzQ5MTgzMH0.WzE4suOD63FzmyLPJEffr1kGCM7OOOoDhqj-G-kmLJk';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// API URL for backend calls (Plaid token exchange, etc.)
// TODO: Replace with your active ngrok URL or deployed backend URL
export const API_URL = 'https://d1959890d7c7.ngrok-free.app'; // Change to your backend URL

// Helper to get auth token
export const getAuthToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
};

// API helper with authentication
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const token = await getAuthToken();
  
  if (!token) {
    throw new Error('Not authenticated');
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      // Try to parse error response body
      let errorMessage = `API call failed: ${response.status} ${response.statusText || 'Unknown error'}`;
      
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = `API call failed: ${errorData.error}`;
        } else if (errorData.message) {
          errorMessage = `API call failed: ${errorData.message}`;
        }
      } catch (e) {
        // If JSON parsing fails, try to get text
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = `API call failed: ${errorText.substring(0, 200)}`;
          }
        } catch (textError) {
          // Use default error message
        }
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }
    // Handle network errors or other fetch failures
    throw new Error(`Network error: ${error}`);
  }
};
