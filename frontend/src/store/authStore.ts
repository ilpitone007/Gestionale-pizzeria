import { create } from 'zustand';

interface Utente {
  id: number;
  username: string;
  ruolo: string;
}

interface AuthState {
  token: string | null;
  utente: Utente | null;
  login: (token: string, utente: Utente) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Inizializza dal localStorage
  const storedToken = localStorage.getItem('auth_token');
  const storedUtente = localStorage.getItem('auth_utente');

  return {
    token: storedToken,
    utente: storedUtente ? JSON.parse(storedUtente) : null,
    login: (token, utente) => {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_utente', JSON.stringify(utente));
      set({ token, utente });
    },
    logout: () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_utente');
      set({ token: null, utente: null });
    },
  };
});
