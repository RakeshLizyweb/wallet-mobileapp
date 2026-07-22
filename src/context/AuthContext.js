import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import * as authApi from '../api/auth';
import { getStoredToken, setStoredToken, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);
  const [requiresPinSetup, setRequiresPinSetup] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [sessionPin, setSessionPin] = useState(null);

  const clearSession = useCallback(async () => {
    await setStoredToken(null);
    setUser(null);
    setRequiresPinSetup(false);
    setUnlocked(false);
    setSessionPin(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
  }, [clearSession]);

  useEffect(() => {
    (async () => {
      const token = await getStoredToken();
      if (token) {
        try {
          const res = await authApi.me();
          setUser(res.data);
        } catch (e) {
          await clearSession();
        }
      }
      setBootstrapping(false);
    })();
  }, [clearSession]);

  const completeAuth = useCallback(async (authData) => {
    await setStoredToken(authData.token);
    setUser(authData.user);
    setRequiresPinSetup(!!authData.requires_pin_setup);
    setUnlocked(false);
    setSessionPin(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await authApi.me();
    setUser(res.data);
    return res.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore network errors on logout, clear session locally regardless
    }
    await clearSession();
  }, [clearSession]);

  const markPinSetupDone = useCallback((pin) => {
    setRequiresPinSetup(false);
    setUnlocked(true);
    setSessionPin(pin ?? null);
  }, []);

  const unlockApp = useCallback((pin) => {
    setUnlocked(true);
    setSessionPin(pin ?? null);
  }, []);

  const lockApp = useCallback(() => {
    setUnlocked(false);
    setSessionPin(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      setUser,
      bootstrapping,
      isAuthenticated: !!user,
      requiresPinSetup,
      unlocked,
      sessionPin,
      setSessionPin,
      completeAuth,
      refreshUser,
      logout,
      clearSession,
      markPinSetupDone,
      unlockApp,
      lockApp,
    }),
    [user, bootstrapping, requiresPinSetup, unlocked, sessionPin, completeAuth, refreshUser, logout, clearSession, markPinSetupDone, unlockApp, lockApp]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
