'use client'

import { useEffect, useState } from 'react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Set initial network state
    const currentOffline = !navigator.onLine;
    setIsOffline(currentOffline);
    if (currentOffline) {
      setLastChecked(new Date().toLocaleTimeString());
    }

    const handleOnline = () => {
      setIsOffline(false);
      setLastChecked(null);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setLastChecked(new Date().toLocaleTimeString());
    };

    const handleCustomOffline = () => {
      setIsOffline(true);
      setLastChecked((prev) => prev || new Date().toLocaleTimeString());
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('app-offline-active', handleCustomOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('app-offline-active', handleCustomOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '16px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 99999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '10px 20px',
      backgroundColor: 'rgba(30, 24, 15, 0.75)',
      backdropFilter: 'blur(16px) saturate(130%)',
      WebkitBackdropFilter: 'blur(16px) saturate(130%)',
      border: '1px solid rgba(251, 191, 36, 0.25)',
      borderRadius: '30px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      color: '#fbbf24',
      fontSize: '13px',
      fontWeight: 500,
      fontFamily: 'var(--font-oxanium), sans-serif',
      letterSpacing: '0.5px',
      animation: 'fadeInDown 0.3s ease-out forwards',
    }}>
      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes pulseDot {
          0% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 8px rgba(251, 191, 36, 0);
          }
          100% {
            transform: scale(0.9);
            box-shadow: 0 0 0 0 rgba(251, 191, 36, 0);
          }
        }
      `}} />
      
      {/* Pulsing warning indicator dot */}
      <span style={{
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: '#fbbf24',
        display: 'inline-block',
        animation: 'pulseDot 1.8s infinite',
        flexShrink: 0
      }} />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
        <span><strong>Offline Mode</strong> — Displaying cached local inventory</span>
        {lastChecked && (
          <span style={{ fontSize: '10px', opacity: 0.65 }}>Offline since {lastChecked}</span>
        )}
      </div>

      <button 
        onClick={() => window.location.reload()}
        style={{
          marginLeft: '8px',
          padding: '4px 12px',
          backgroundColor: 'rgba(251, 191, 36, 0.15)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '15px',
          color: '#fbbf24',
          fontSize: '11px',
          fontWeight: 'bold',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.25)';
          e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(251, 191, 36, 0.15)';
          e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.3)';
        }}
      >
        Retry
      </button>
    </div>
  );
}
