"use client";
import axios from "axios";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
});

// Function to get token from NextAuth session or localStorage/sessionStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Try to get from NextAuth session first
    const sessionData = sessionStorage.getItem('next-auth.session-token') || 
                       sessionStorage.getItem('__Secure-next-auth.session-token') ||
                       localStorage.getItem('next-auth.session-token');
    
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        const token = session?.accessToken || session?.user?.accessToken;
        if (token) return token;
      } catch (e) {
        // If parsing fails, continue to fallback
      }
    }
    
    // Fallback to localStorage/sessionStorage
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    return token;
  }
  return null;
};

client.interceptors.request.use(
  function (config) {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle 401 errors
client.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    if (error.response?.status === 401) {
      // Token expired or invalid, clear it
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        sessionStorage.removeItem('accessToken');
      }
      // Redirect to login or show error
      console.error('Authentication failed, please login again');
    }
    return Promise.reject(error);
  }
);

export default client;
