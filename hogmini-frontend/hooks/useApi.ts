'use client';

import { useAuth } from "@/app/contexts/AuthContext";
import { withApi } from "@/lib/api";

export function useApi() {
  const { logout } = useAuth();

  const apiCall = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(withApi(url), {
      ...options,
      headers,
    });

    // If unauthorized, logout user
    if (response.status === 401) {
      logout();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'API call failed');
    }

    return response.json();
  };

  return { apiCall };
}