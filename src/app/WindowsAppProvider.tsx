'use client'

import { AppTheme } from 'react-windows-ui';
import { useEffect, useState } from 'react';
import OfflineBanner from './components/OfflineBanner';
import { getCachedAllItems } from '@/lib/offlineCache';

export default function WindowsAppProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;

    const updateStockBadge = () => {
      if (!('setAppBadge' in navigator)) return;

      try {
        const cachedItems = getCachedAllItems();
        const lowStockCount = cachedItems.filter(item => {
          const amount = Number(item.amount);
          const minAmount = Number(item.min_amount);
          return !isNaN(amount) && !isNaN(minAmount) && minAmount > 0 && amount <= minAmount;
        }).length;

        if (lowStockCount > 0) {
          navigator.setAppBadge(lowStockCount).catch(err => {
            console.warn('[PWA Badging] Failed to set badge', err);
          });
        } else {
          navigator.clearAppBadge().catch(err => {
            console.warn('[PWA Badging] Failed to clear badge', err);
          });
        }
      } catch (e) {
        console.error('[PWA Badging] Error calculating badge count', e);
      }
    };

    // Run initially
    updateStockBadge();

    // Listen to focus, offline activations, and cross-tab storage changes
    window.addEventListener('focus', updateStockBadge);
    window.addEventListener('app-offline-active', updateStockBadge);
    window.addEventListener('storage', updateStockBadge);

    return () => {
      window.removeEventListener('focus', updateStockBadge);
      window.removeEventListener('app-offline-active', updateStockBadge);
      window.removeEventListener('storage', updateStockBadge);
    };
  }, [mounted]);
  
  if (!mounted) {
    return null;
  }

  return (
    <>
      <AppTheme scheme="system" />
      <OfflineBanner />
      {children}
    </>
  );
}
