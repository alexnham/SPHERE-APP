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
export const API_URL = 'https://c6d6fb0949f4.ngrok-free.app'; // Change to your backend URL

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

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.statusText}`);
  }

  return response.json();
};
