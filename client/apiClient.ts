"use client";
import axios from "axios";

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_HOST,
});

// Function to get token from localStorage or sessionStorage
const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    // Try to get from localStorage first, then sessionStorage
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
