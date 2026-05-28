'use client'

import { useState } from 'react';
import { usePWAInstall } from '@/lib/hooks/usePWAInstall';
import WindowsPageContainer from '@/app/components/WindowsPageContainer';

export default function InstallPage() {
  const { isInstallable, isStandalone, install } = usePWAInstall();
  const [success, setSuccess] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleInstall = async () => {
    const installed = await install();
    if (installed) {
      setSuccess(true);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <WindowsPageContainer>
      <div 
        style={{ 
          padding: '40px 20px', 
          maxWidth: '800px', 
          margin: '0 auto', 
          fontFamily: 'var(--font-oxanium), sans-serif',
          color: '#ffffff'
        }}
      >
        {/* CSS for custom glassmorphism and animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          .glass-card {
            background: rgba(255, 255, 255, 0.02);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            margin-bottom: 30px;
          }
          .install-btn {
            background: linear-gradient(135deg, #a38cf4 0%, #7c5dfa 100%);
            border: none;
            padding: 12px 32px;
            color: #ffffff;
            font-size: 16px;
            font-weight: 700;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(163, 140, 244, 0.4);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            letter-spacing: 0.5px;
          }
          .install-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(163, 140, 244, 0.6);
            background: linear-gradient(135deg, #b4a0f5 0%, #8b71fc 100%);
          }
          .install-btn:active {
            transform: translateY(1px);
          }
          .guide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            background: rgba(255, 255, 255, 0.01);
            border: 1px solid rgba(255, 255, 255, 0.04);
            border-radius: 8px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .guide-header:hover {
            background: rgba(255, 255, 255, 0.03);
            border-color: rgba(255, 255, 255, 0.08);
          }
          .guide-content {
            padding: 0px 20px 20px 20px;
            font-size: 14px;
            line-height: 1.6;
            color: rgba(255, 255, 255, 0.8);
            border-bottom: 1px solid rgba(255, 255, 255, 0.04);
            margin-bottom: 12px;
          }
          .pulse-green {
            animation: pulse-green-glow 2s infinite;
          }
          @keyframes pulse-green-glow {
            0% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(74, 222, 128, 0); }
            100% { box-shadow: 0 0 0 0 rgba(74, 222, 128, 0); }
          }
        ` }} />

        {/* Title Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '12px',
            background: 'rgba(163, 140, 244, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(163, 140, 244, 0.2)'
          }}>
            <i className="icons10-download" style={{ fontSize: '28px', color: '#a38cf4' }}></i>
          </div>
          <div>
            <h1 style={{ fontSize: '32px', margin: 0, fontWeight: 700 }}>Application Installation</h1>
            <p style={{ margin: '5px 0 0 0', opacity: 0.6, fontSize: '15px' }}>Run Warehouse natively for full offline capability & extreme speed</p>
          </div>
        </div>

        {/* Interactive Main Action Card */}
        <div className="glass-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '4px',
            background: 'linear-gradient(90deg, #a38cf4, #4ade80)'
          }}></div>

          {isStandalone || success ? (
            <div>
              <div className="pulse-green" style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: 'rgba(74, 222, 128, 0.1)',
                border: '2px solid #4ade80',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px auto'
              }}>
                <span style={{ fontSize: '32px', color: '#4ade80' }}>✓</span>
              </div>
              <h2 style={{ fontSize: '22px', margin: '0 0 10px 0' }}>App Natively Installed!</h2>
              <p style={{ opacity: 0.7, fontSize: '14px', maxWidth: '500px', margin: '0 auto 20px auto', lineHeight: '1.6' }}>
                You are currently running the native standalone version of Warehouse. You now have full offline caching, desktop badging, and seamless background operations.
              </p>
              <button 
                onClick={() => window.location.href = '/'}
                className="install-btn" 
                style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)', boxShadow: '0 4px 15px rgba(74, 222, 128, 0.3)' }}
              >
                Go to Dashboard
              </button>
            </div>
          ) : isInstallable ? (
            <div>
              <h2 style={{ fontSize: '24px', margin: '0 0 12px 0' }}>Ready for Installation</h2>
              <p style={{ opacity: 0.7, fontSize: '14px', maxWidth: '500px', margin: '0 auto 24px auto', lineHeight: '1.6' }}>
                Install the application directly to your desktop or mobile home screen. It takes less than a second, uses minimal space, and functions perfectly in offline conditions.
              </p>
              <button onClick={handleInstall} className="install-btn">
                Install Warehouse App
              </button>
            </div>
          ) : (
            <div>
              <h2 style={{ fontSize: '22px', margin: '0 0 10px 0', color: 'rgba(255,255,255,0.9)' }}>Browser Installation Mode</h2>
              <p style={{ opacity: 0.7, fontSize: '14px', maxWidth: '550px', margin: '0 auto', lineHeight: '1.6' }}>
                Your current browser or display mode does not support automatic in-app PWA install triggers. However, you can easily install the app manually using the steps below!
              </p>
            </div>
          )}
        </div>

        {/* Browser Guides Section */}
        <h3 style={{ fontSize: '18px', margin: '40px 0 20px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
          Manual Setup Guide by OS & Browser
        </h3>

        {/* Guide 1: iOS Safari */}
        <div>
          <div className="guide-header" onClick={() => toggleSection('ios')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
              <span style={{ fontSize: '18px' }}></span> iPhone & iPad (Safari)
            </span>
            <span style={{ transform: expandedSection === 'ios' ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
          </div>
          {expandedSection === 'ios' && (
            <div className="guide-content">
              <ol style={{ paddingLeft: '20px', margin: '0' }}>
                <li style={{ marginBottom: '8px' }}>Open this page in the **Safari** app on your iPhone or iPad.</li>
                <li style={{ marginBottom: '8px' }}>Tap the **Share** button (the square icon with an upward-pointing arrow) at the bottom or top of the browser screen.</li>
                <li style={{ marginBottom: '8px' }}>Scroll down the sharing menu and tap **Add to Home Screen**.</li>
                <li>Give the app a name (e.g., "Warehouse") and tap **Add** in the top right.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Guide 2: Google Chrome & Microsoft Edge (Desktop) */}
        <div>
          <div className="guide-header" onClick={() => toggleSection('desktop')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
              <span style={{ fontSize: '18px' }}>💻</span> Chrome / Edge (Windows & Mac)
            </span>
            <span style={{ transform: expandedSection === 'desktop' ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
          </div>
          {expandedSection === 'desktop' && (
            <div className="guide-content">
              <ol style={{ paddingLeft: '20px', margin: '0' }}>
                <li style={{ marginBottom: '8px' }}>Look at your browser's address bar (URL bar) at the top of this window.</li>
                <li style={{ marginBottom: '8px' }}>Click on the **Install Icon** (it resembles a small desktop computer monitor with a down arrow, or overlapping squares).</li>
                <li>Alternatively, click the **three dots** in the top-right corner of Chrome/Edge and select **Cast, Save, and Share** or **Install Warehouse...**.</li>
              </ol>
            </div>
          )}
        </div>

        {/* Guide 3: Android (Chrome / Firefox) */}
        <div>
          <div className="guide-header" onClick={() => toggleSection('android')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 600 }}>
              <span style={{ fontSize: '18px' }}>🤖</span> Android Devices (Chrome)
            </span>
            <span style={{ transform: expandedSection === 'android' ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
          </div>
          {expandedSection === 'android' && (
            <div className="guide-content">
              <ol style={{ paddingLeft: '20px', margin: '0' }}>
                <li style={{ marginBottom: '8px' }}>Tap the **three dots menu** in the top-right corner of Google Chrome.</li>
                <li style={{ marginBottom: '8px' }}>Select **Add to Home Screen** or **Install app** from the menu.</li>
                <li>Follow the on-screen pop-up confirmation to pin it to your desktop.</li>
              </ol>
            </div>
          )}
        </div>
      </div>
    </WindowsPageContainer>
  );
}
