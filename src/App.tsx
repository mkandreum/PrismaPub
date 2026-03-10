/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import EventsSection from './components/EventsSection';
import Gallery from './components/Gallery';
import Marquee from './components/Marquee';
import Banners from './components/Banners';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import Ticket from './pages/Ticket';
import { ToastProvider } from './components/Toast';
import { MapPin, Instagram } from 'lucide-react';

// ── MAIN SINGLE-PAGE APP ──────────────────────────────
function MainApp() {
  const [currentView, setCurrentView] = useState<'home' | 'login' | 'admin'>('home');
  const [settings, setSettings] = useState<Record<string, string>>({});

  // Fetch all settings once
  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {});
  }, []);

  // If there's a valid token, allow quick access to admin
  useEffect(() => {
    const token = localStorage.getItem('prisma_token');
    if (token) {
      fetch('/api/admin/stats', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => { if (!r.ok) localStorage.removeItem('prisma_token'); });
    }
  }, []);

  const handleLogin = (_token: string) => {
    setCurrentView('admin');
  };

  // Re-fetch settings when returning from admin
  const handleBackToHome = () => {
    fetch('/api/settings').then(r => r.json()).then(setSettings).catch(() => {});
    setCurrentView('home');
    window.scrollTo(0, 0);
  };

  return (
    <ToastProvider>
      <div className="app-shell noise-bg min-h-screen bg-prisma-dark font-sans selection:bg-prisma-accent selection:text-white">
        {currentView === 'home' && (
          <>
            <Banners />
            <Navbar
              onLoginClick={() => setCurrentView('login')}
              onLogoClick={() => { setCurrentView('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              settings={settings}
            />
            <main>
              <Hero />
              <Marquee text={settings.marquee_1 || 'PRISMA PUB • SAFE SPACE • GOOD VIBES • '} />
              <EventsSection />
              <Marquee text={settings.marquee_2 || 'GALLERY • UNFORGETTABLE NIGHTS • '} reverse />
              <Gallery />
              <Footer settings={settings} />
            </main>
          </>
        )}

        {currentView === 'login' && (
          <Login onLogin={handleLogin} onBack={() => setCurrentView('home')} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onLogout={() => { localStorage.removeItem('prisma_token'); handleBackToHome(); }} />
        )}
      </div>
    </ToastProvider>
  );
}

// ── FOOTER ────────────────────────────────────────────
function Footer({ settings }: { settings: Record<string, string> }) {
  const siteName = settings.site_name || 'PRISMA PUB';
  const logoUrl = settings.logo_url;
  const footerText = settings.footer_text || 'Your safe space for unforgettable nights. Music, love, and freedom.';

  return (
    <footer id="contact" className="bg-prisma-dark border-t border-prisma-purple/20 py-16 px-4 md:px-8 relative overflow-hidden">
      {/* Subtle footer glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-prisma-purple/5 rounded-full blur-[150px] -z-0" />
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <span className="font-display text-3xl text-white tracking-wider">{siteName.replace(' PUB', '')}</span>
                  <div className="h-6 w-8 flex flex-col rounded-sm overflow-hidden">
                    <div className="h-1/6 w-full bg-[#E40303]" />
                    <div className="h-1/6 w-full bg-[#FF8C00]" />
                    <div className="h-1/6 w-full bg-[#FFED00]" />
                    <div className="h-1/6 w-full bg-[#008026]" />
                    <div className="h-1/6 w-full bg-[#24408E]" />
                    <div className="h-1/6 w-full bg-[#732982]" />
                  </div>
                </>
              )}
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {footerText}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-lg uppercase text-white mb-4">Navigate</h4>
            <div className="flex flex-col gap-2">
              {['events', 'gallery', 'contact'].map(section => (
                <button
                  key={section}
                  onClick={() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-gray-400 hover:text-prisma-accent transition-colors text-sm capitalize text-left"
                >
                  {section}
                </button>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display text-lg uppercase text-white mb-4">Find Us</h4>
            {settings.address && (
              <p className="text-gray-400 text-sm flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-prisma-accent flex-shrink-0" />
                {settings.address}
              </p>
            )}
            {settings.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-prisma-accent transition-colors text-sm flex items-center gap-2"
              >
                <Instagram size={16} />
                Instagram
              </a>
            )}
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-gray-500 text-xs uppercase tracking-widest">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── TICKET PAGE WRAPPER ──────────────────────────────
function TicketPage() {
  return (
    <div className="app-shell noise-bg min-h-screen bg-prisma-dark font-sans selection:bg-prisma-accent selection:text-white">
      <Ticket />
    </div>
  );
}

// ── ROOT WITH ROUTER ─────────────────────────────────
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/ticket/:qr_code" element={<TicketPage />} />
        <Route path="*" element={<MainApp />} />
      </Routes>
    </Router>
  );
}
