import React, { useState } from 'react';
import { AnimatePresence } from 'motion/react';
import {
  X,
  Search,
  Check,
  Menu,
  Sparkles,
} from 'lucide-react';
import { AuthPage } from './AuthPage';
import { useAuthStore } from '../stores/authStore';
import '../styles/inkboard.css';

interface LandingPageProps {
  onEnterApp?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { token } = useAuthStore();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeUseCase, setActiveUseCase] = useState<'teams' | 'edu' | 'design' | 'eng'>('teams');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [helpSearchQuery, setHelpSearchQuery] = useState('');
  const [activeNavTab, setActiveNavTab] = useState<'home' | 'product' | 'pricing' | 'templates' | 'help'>('home');

  const handleStart = () => {
    if (token && onEnterApp) {
      onEnterApp();
    } else {
      setAuthModalOpen(true);
    }
  };

  const scrollToSection = (id: string, tab: 'home' | 'product' | 'pricing' | 'templates' | 'help') => {
    setActiveNavTab(tab);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const helpArticles = [
    { title: 'How to create your first board', time: '3 min read', cat: 'getting started' },
    { title: 'Inviting teammates and setting permissions', time: '4 min read', cat: 'collaboration' },
    { title: 'Exporting a board as PDF or image', time: '2 min read', cat: 'export' },
    { title: 'Keyboard shortcuts cheat sheet', time: '5 min read', cat: 'tools' },
    { title: 'Upgrading or changing your plan', time: '2 min read', cat: 'billing' },
  ];

  const filteredArticles = helpArticles.filter(
    (a) =>
      a.title.toLowerCase().includes(helpSearchQuery.toLowerCase()) ||
      a.cat.toLowerCase().includes(helpSearchQuery.toLowerCase())
  );

  return (
    <div className="inkboard-page h-screen w-full overflow-y-auto selection:bg-[#F6E7DE] selection:text-[#A2502F]">
      {/* ========================================================= */}
      {/* ── 1. NAVBAR ── */}
      {/* ========================================================= */}
      <nav className="navbar" id="navbar">
        <div className="container nav-inner">
          <button
            onClick={() => scrollToSection('home', 'home')}
            className="logo bg-transparent border-none p-0 cursor-pointer flex items-center"
          >
            <img
              src="/sankalplabs-by-kk.png"
              alt="SankalpLabs"
              className="h-8 w-auto object-contain"
            />
          </button>

          <ul className={`nav-links ${mobileMenuOpen ? 'open' : ''}`} id="navLinks">
            <li>
              <a
                onClick={() => scrollToSection('home', 'home')}
                className={activeNavTab === 'home' ? 'active' : ''}
              >
                Home
              </a>
            </li>
            <li>
              <a
                onClick={() => scrollToSection('product', 'product')}
                className={activeNavTab === 'product' ? 'active' : ''}
              >
                Product
              </a>
            </li>
            <li>
              <a
                onClick={() => scrollToSection('templates', 'templates')}
                className={activeNavTab === 'templates' ? 'active' : ''}
              >
                Templates
              </a>
            </li>
            <li>
              <a
                onClick={() => scrollToSection('pricing', 'pricing')}
                className={activeNavTab === 'pricing' ? 'active' : ''}
              >
                Pricing
              </a>
            </li>
            <li>
              <a
                onClick={() => scrollToSection('help', 'help')}
                className={activeNavTab === 'help' ? 'active' : ''}
              >
                Help
              </a>
            </li>

            {/* Mobile-only CTA */}
            {mobileMenuOpen && (
              <li className="pt-2 flex flex-col gap-2">
                <button
                  onClick={handleStart}
                  className="btn btn-ghost w-full justify-center"
                >
                  Log in
                </button>
                <button
                  onClick={handleStart}
                  className="btn btn-primary w-full justify-center"
                >
                  Sign up free
                </button>
              </li>
            )}
          </ul>

          <div className="nav-actions">
            <button onClick={handleStart} className="login">
              Log in
            </button>
            <button onClick={handleStart} className="btn btn-primary">
              Sign up free
            </button>
            <button
              className="menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-[#1A1917]" />
            </button>
          </div>
        </div>
      </nav>

      <main>
        {/* ========================================================= */}
        {/* ── 2. HERO SECTION ── */}
        {/* ========================================================= */}
        <section className="hero" id="home">
          <div className="container">
            <div className="hero-stage">
              {/* Aisha's Drifting Cursor */}
              <div className="cursor hero-cursor" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M3 2l7 19 2.5-7.5L20 11z"
                    style={{ fill: 'var(--accent)', stroke: 'var(--bg)' }}
                    strokeWidth="1.5"
                  />
                </svg>
                <b>Aisha</b>
              </div>

              <div className="hero-content">
                <span className="eyebrow">
                  <Sparkles className="w-3.5 h-3.5 text-[#D9542C] inline-block mr-1" />
                  New: AI-powered canvas copilot & templates
                </span>
                <h1>
                  Where great ideas <em>take shape</em>, together
                </h1>
                <p>
                  The online whiteboard for brainstorming, planning and teaching,
                  together in real time.
                </p>
                <div className="hero-cta">
                  <button onClick={handleStart} className="btn btn-primary btn-lg">
                    Start whiteboarding — it's free
                  </button>
                  <button
                    onClick={() => scrollToSection('features', 'product')}
                    className="btn btn-ghost btn-lg"
                  >
                    See how it works
                  </button>
                </div>
                <p className="hero-note">Free forever plan · No credit card needed</p>
              </div>
            </div>

            {/* Whiteboard Mockup (Pure HTML/CSS) */}
            <div className="board" aria-hidden="true">
              <div className="board-topbar">
                <div className="dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className="board-title">Q4 Product Brainstorm · SankalpLabs</div>
                <div className="avatars">
                  <span>AK</span>
                  <span>RM</span>
                  <span>SJ</span>
                  <span style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
                    +4
                  </span>
                </div>
              </div>

              <div className="board-toolbar">
                <span className="on" title="Select pointer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m4 4 7 16 2.5-6.5L20 11z" />
                  </svg>
                </span>
                <span title="Pen drawing">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </span>
                <span title="Rectangle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                  </svg>
                </span>
                <span title="Circle">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                </span>
                <span title="Text">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M5 6h14M12 6v13" />
                  </svg>
                </span>
                <span title="Sticky note">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <path d="M5 4h14v11l-5 5H5z" />
                    <path d="M14 20v-5h5" />
                  </svg>
                </span>
              </div>

              {/* Hand-drawn SVG connectors & launch ellipse */}
              <svg className="board-svg" viewBox="0 0 1040 480" preserveAspectRatio="none">
                <path
                  d="M270 160 C 340 150, 380 150, 430 170"
                  fill="none"
                  style={{ stroke: 'var(--faint)' }}
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  strokeLinecap="round"
                />
                <path
                  d="M330 320 C 410 340, 460 340, 520 330"
                  fill="none"
                  style={{ stroke: 'var(--faint)' }}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M512 325 l 10 5 -10 6"
                  fill="none"
                  style={{ stroke: 'var(--faint)' }}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <ellipse
                  cx="830"
                  cy="380"
                  rx="90"
                  ry="34"
                  fill="none"
                  style={{ stroke: 'var(--faint)' }}
                  strokeWidth="2"
                  transform="rotate(-4 830 380)"
                />
                <text
                  x="782"
                  y="386"
                  fontFamily="Geist, sans-serif"
                  fontWeight="500"
                  fontSize="16"
                  style={{ fill: 'var(--text)' }}
                >
                  Launch 🚀
                </text>
              </svg>

              <div className="sticky s1">
                Real-time cursors for everyone<small>— Aisha</small>
              </div>
              <div className="sticky s2">
                Template library for retros<small>— Rahul</small>
              </div>
              <div className="sticky s3">
                Export to PDF &amp; PNG<small>— Sara</small>
              </div>
              <div className="sticky s4">
                AI diagrams on demand<small>— Dev</small>
              </div>

              <div className="board-card">
                <h4>Sprint progress</h4>
                <div className="bar"><i style={{ width: '82%' }}></i></div>
                <div className="bar"><i style={{ width: '58%' }}></i></div>
                <div className="bar"><i style={{ width: '34%' }}></i></div>
                <p style={{ fontSize: '0.78rem', margin: '6px 0 0' }}>
                  12 of 18 ideas shortlisted
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 3. LOGOS TICKER ── */}
        {/* ========================================================= */}
        <section className="logos">
          <div className="container">
            <p>Trusted by 2 million+ people at teams and schools worldwide</p>
            <div className="logo-row">
              <span>Northwind</span>
              <span>Lumora</span>
              <span>Vertexa</span>
              <span>Quanta</span>
              <span>Brightpath</span>
              <span>Orbitly</span>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 4. FEATURES GRID ── */}
        {/* ========================================================= */}
        <section className="section" id="features">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Features</span>
              <h2>
                Everything you need to <em>think visually</em>
              </h2>
              <p>From quick sketches to company-wide plans, all on one canvas.</p>
            </div>
            <div className="grid grid-3">
              <div className="card">
                <div className="icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M3 12h18M12 3v18" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <h3>Infinite canvas</h3>
                <p>Zoom, pan and organise unlimited ideas on one frictionless board.</p>
              </div>

              <div className="card">
                <div className="icon-box teal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="9" cy="8" r="3" />
                    <circle cx="17" cy="9" r="2.5" />
                    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2 1-4 3.5-4S22 18 22 20" />
                  </svg>
                </div>
                <h3>Real-time collaboration</h3>
                <p>See live cursors and instant CRDT edits as your team works together.</p>
              </div>

              <div className="card">
                <div className="icon-box pink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <h3>300+ templates</h3>
                <p>Mind maps, agile retros, system architecture, flowcharts and lesson plans.</p>
              </div>

              <div className="card">
                <div className="icon-box amber">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </div>
                <h3>Smart drawing tools</h3>
                <p>Rough sketches snap automatically into clean geometric shapes and connectors.</p>
              </div>

              <div className="card">
                <div className="icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>Comments &amp; voting</h3>
                <p>Inline discussion pins on the board, @mentions, and dot-voting for agile workshops.</p>
              </div>

              <div className="card">
                <div className="icon-box teal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </div>
                <h3>Export &amp; share</h3>
                <p>Instant guest share links, or high-res vector export as PDF, PNG and SVG.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 5. USE CASES (INTERACTIVE TABS) ── */}
        {/* ========================================================= */}
        <section className="section alt-bg" id="usecases">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Use cases</span>
              <h2>
                One board, <em>endless possibilities</em>
              </h2>
              <p>Teams, classrooms and creators turn messy thinking into clear plans.</p>
            </div>

            <div className="tabs">
              <button
                className={`tab ${activeUseCase === 'teams' ? 'active' : ''}`}
                onClick={() => setActiveUseCase('teams')}
              >
                Teams
              </button>
              <button
                className={`tab ${activeUseCase === 'edu' ? 'active' : ''}`}
                onClick={() => setActiveUseCase('edu')}
              >
                Education
              </button>
              <button
                className={`tab ${activeUseCase === 'design' ? 'active' : ''}`}
                onClick={() => setActiveUseCase('design')}
              >
                Design
              </button>
              <button
                className={`tab ${activeUseCase === 'eng' ? 'active' : ''}`}
                onClick={() => setActiveUseCase('eng')}
              >
                Engineering
              </button>
            </div>

            {activeUseCase === 'teams' && (
              <div className="usecase">
                <div>
                  <h2>Run meetings people <em>actually enjoy</em></h2>
                  <p>Stand-ups, retros and quarterly planning on one shared visual workspace.</p>
                  <ul className="checklist">
                    <li>Built-in workshop timer and dot-voting for focused rituals</li>
                    <li>Agile retros, sprint roadmap and OKR templates ready in 1 click</li>
                    <li>Integrates with Slack, Google Meet, Zoom, and MS Teams</li>
                  </ul>
                  <button onClick={handleStart} className="btn btn-primary">
                    Explore for teams
                  </button>
                </div>
                <div className="visual">
                  <div
                    className="sticky float"
                    style={{ top: '40px', left: '40px', background: 'var(--note-yellow)', ['--r' as any]: '-3deg' }}
                  >
                    What went well? 🎉
                  </div>
                  <div
                    className="sticky float"
                    style={{ top: '60px', left: '200px', background: 'var(--note-pink)', ['--r' as any]: '2deg', animationDelay: '-2s' }}
                  >
                    What can improve?
                  </div>
                  <div
                    className="sticky float"
                    style={{ top: '190px', left: '110px', background: 'var(--note-green)', ['--r' as any]: '-1deg', animationDelay: '-4s' }}
                  >
                    Action items ✅
                  </div>
                </div>
              </div>
            )}

            {activeUseCase === 'edu' && (
              <div className="usecase">
                <div>
                  <h2>Make every lesson <em>interactive</em></h2>
                  <p>Lively lessons, group whiteboarding and collaborative study in a safe space.</p>
                  <ul className="checklist">
                    <li>Free forever for verified teachers and students</li>
                    <li>Curated lesson plans, interactive worksheets and graphic organizers</li>
                    <li>Classroom mode with teacher permissions &amp; attention spotlight</li>
                  </ul>
                  <button onClick={handleStart} className="btn btn-primary">
                    See education plans
                  </button>
                </div>
                <div className="visual">
                  <div
                    className="sticky float"
                    style={{ top: '40px', left: '50px', background: 'var(--note-blue)', ['--r' as any]: '-2deg' }}
                  >
                    The Water Cycle 💧
                  </div>
                  <div
                    className="sticky float"
                    style={{ top: '80px', left: '220px', background: 'var(--note-green)', ['--r' as any]: '3deg', animationDelay: '-3s' }}
                  >
                    Evaporation → Condensation
                  </div>
                  <div
                    className="sticky float"
                    style={{ top: '200px', left: '130px', background: 'var(--note-yellow)', ['--r' as any]: '-1deg', animationDelay: '-1s' }}
                  >
                    Group 3: Precipitation
                  </div>
                </div>
              </div>
            )}

            {activeUseCase === 'design' && (
              <div className="usecase">
                <div>
                  <h2>From <em>moodboard</em> to wireframe</h2>
                  <p>Gather visual inspiration, map journeys, and sketch wireframes before pixel perfection.</p>
                  <ul className="checklist">
                    <li>Drag &amp; drop images, Figma embeds, vector links and color palettes</li>
                    <li>Wireframe UI kits, user journey maps and storyboarding</li>
                    <li>Threaded feedback tied directly to any visual component</li>
                  </ul>
                  <button onClick={handleStart} className="btn btn-primary">
                    Explore for designers
                  </button>
                </div>
                <div className="visual">
                  <div
                    className="sticky float"
                    style={{ top: '40px', left: '40px', background: 'var(--note-pink)', ['--r' as any]: '-2deg' }}
                  >
                    Moodboard: soft &amp; editorial
                  </div>
                  <div
                    className="sticky float"
                    style={{ top: '70px', left: '210px', background: 'var(--note-yellow)', ['--r' as any]: '2deg', animationDelay: '-2s' }}
                  >
                    Onboarding flow v2
                  </div>
                  <div
                    className="sticky float"
                    style={{ top: '200px', left: '100px', background: 'var(--note-blue)', ['--r' as any]: '-3deg', animationDelay: '-4s' }}
                  >
                    Feedback: bigger CTA
                  </div>
                </div>
              </div>
            )}

            {activeUseCase === 'eng' && (
              <div className="usecase">
                <div>
                  <h2>Map systems <em>before</em> you build them</h2>
                  <p>Diagram microservice architectures, sequence flows, and sprint deliverables with your team.</p>
                  <ul className="checklist">
                    <li>Cloud infrastructure (AWS, GCP, Azure, K8s) shape libraries</li>
                    <li>Embed interactive boards in Jira, GitHub PRs, Notion and Confluence</li>
                    <li>Granular version history to inspect changes and restore any milestone</li>
                  </ul>
                  <button onClick={handleStart} className="btn btn-primary">
                    Explore for engineers
                  </button>
                </div>
                <div className="visual">
                  <div
                    className="sticky float"
                    style={{ top: '40px', left: '40px', background: 'var(--note-blue)', ['--r' as any]: '-1deg' }}
                  >
                    Client → Fastify Gateway
                  </div>
                  <div
                    className="sticky float"
                    style={{ top: '80px', left: '220px', background: 'var(--note-green)', ['--r' as any]: '2deg', animationDelay: '-3s' }}
                  >
                    Auth service (JWT)
                  </div>
                  <div
                    className="sticky float"
                    style={{ top: '200px', left: '120px', background: 'var(--note-yellow)', ['--r' as any]: '-2deg', animationDelay: '-1s' }}
                  >
                    PostgreSQL &amp; Redis Cache
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 6. HOW IT WORKS ── */}
        {/* ========================================================= */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">How it works</span>
              <h2>
                Up and running in <em>under a minute</em>
              </h2>
              <p>Three straightforward steps from a blank canvas to an aligned team.</p>
            </div>

            <div className="frames">
              <div className="frame">
                <span className="frame-label">Frame 01</span>
                <h3>Create a board</h3>
                <p>Start from a blank canvas or jumpstart with one of 300+ pre-built templates.</p>
              </div>
              <div className="frame">
                <span className="frame-label">Frame 02</span>
                <h3>Invite your people</h3>
                <p>Share a simple secure link. No mandatory installs; teammates join in seconds.</p>
              </div>
              <div className="frame">
                <span className="frame-label">Frame 03</span>
                <h3>Create together</h3>
                <p>Draw, vote, comment live, invoke AI copilot, and export high-res vector artifacts.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 7. TEMPLATES GALLERY ── */}
        {/* ========================================================= */}
        <section className="section alt-bg" id="templates">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Templates</span>
              <h2>
                Start with a template, <em>not a blank page</em>
              </h2>
              <p>Ready-made boards designed for the rituals your team already does.</p>
            </div>

            <div className="grid grid-4">
              <div onClick={handleStart} className="card template">
                <div className="template-preview">
                  <i style={{ left: '40%', top: '40%', width: '20%', height: '20%', background: 'var(--faint)', borderRadius: '50%', border: 0 }} />
                  <i style={{ left: '12%', top: '18%', width: '20%', height: '16%', background: 'var(--note-yellow)' }} />
                  <i style={{ left: '68%', top: '18%', width: '20%', height: '16%', background: 'var(--note-pink)' }} />
                  <i style={{ left: '12%', top: '66%', width: '20%', height: '16%', background: 'var(--note-green)' }} />
                  <i style={{ left: '68%', top: '66%', width: '20%', height: '16%', background: 'var(--note-blue)' }} />
                </div>
                <div className="template-body">
                  <h3>Mind map</h3>
                  <p>Branch out ideas and brainstorm fast</p>
                </div>
              </div>

              <div onClick={handleStart} className="card template">
                <div className="template-preview">
                  <i style={{ left: '8%', top: '15%', width: '26%', height: '70%', background: 'var(--surface)', border: '1px solid var(--line)' }} />
                  <i style={{ left: '37%', top: '15%', width: '26%', height: '70%', background: 'var(--surface)', border: '1px solid var(--line)' }} />
                  <i style={{ left: '66%', top: '15%', width: '26%', height: '70%', background: 'var(--surface)', border: '1px solid var(--line)' }} />
                  <i style={{ left: '12%', top: '25%', width: '18%', height: '14%', background: 'var(--note-green)' }} />
                  <i style={{ left: '41%', top: '25%', width: '18%', height: '14%', background: 'var(--note-yellow)' }} />
                  <i style={{ left: '70%', top: '25%', width: '18%', height: '14%', background: 'var(--note-pink)' }} />
                </div>
                <div className="template-body">
                  <h3>Sprint retro</h3>
                  <p>Reflect, vote, and improve delivery</p>
                </div>
              </div>

              <div onClick={handleStart} className="card template">
                <div className="template-preview">
                  <i style={{ left: '10%', top: '40%', width: '18%', height: '20%', background: 'var(--note-blue)' }} />
                  <i style={{ left: '41%', top: '20%', width: '18%', height: '20%', background: 'var(--note-pink)', transform: 'rotate(45deg)' }} />
                  <i style={{ left: '41%', top: '62%', width: '18%', height: '20%', background: 'var(--note-yellow)' }} />
                  <i style={{ left: '72%', top: '40%', width: '18%', height: '20%', background: 'var(--note-green)', borderRadius: '50%' }} />
                </div>
                <div className="template-body">
                  <h3>Flowchart</h3>
                  <p>Map complex system logic &amp; user journeys</p>
                </div>
              </div>

              <div onClick={handleStart} className="card template">
                <div className="template-preview">
                  <i style={{ left: '8%', top: '22%', width: '84%', height: '8%', background: 'var(--note-yellow)' }} />
                  <i style={{ left: '8%', top: '42%', width: '55%', height: '8%', background: 'var(--note-green)' }} />
                  <i style={{ left: '30%', top: '62%', width: '50%', height: '8%', background: 'var(--note-blue)' }} />
                  <i style={{ left: '50%', top: '80%', width: '40%', height: '8%', background: 'var(--note-pink)' }} />
                </div>
                <div className="template-body">
                  <h3>Roadmap</h3>
                  <p>Quarterly epics and milestone delivery</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 8. DEEP-DIVE PRODUCT FEATURES (from product.html) ── */}
        {/* ========================================================= */}
        <section className="section" id="product">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Product Capabilities</span>
              <h2>
                A whiteboard that <em>thinks with you</em>
              </h2>
              <p>Every tool to sketch, organise and present ideas, on one blazingly fast WebGL canvas.</p>
            </div>

            <div className="feature-row">
              <div className="feature-text">
                <span className="eyebrow">Canvas Engine</span>
                <h2>Infinite space for <em>infinite ideas</em></h2>
                <p>Zoom smoothly from a 30,000-foot overview down to fine details. Group work into structured frames and layers.</p>
                <ul className="checklist">
                  <li>60fps infinite canvas powered by PixiJS WebGL</li>
                  <li>Frames, sections, layers, and locked backgrounds</li>
                  <li>Minimap and lightning-fast search across all board elements</li>
                </ul>
              </div>
              <div className="visual">
                <div className="sticky float" style={{ top: '50px', left: '50px', background: 'var(--note-yellow)', ['--r' as any]: '-3deg' }}>
                  Frame: Discovery
                </div>
                <div className="sticky float" style={{ top: '90px', left: '230px', background: 'var(--note-blue)', ['--r' as any]: '2deg', animationDelay: '-2s' }}>
                  Frame: Prototypes
                </div>
                <div className="sticky float" style={{ top: '210px', left: '120px', background: 'var(--note-green)', ['--r' as any]: '-1deg', animationDelay: '-4s' }}>
                  Frame: Architecture
                </div>
              </div>
            </div>

            <div className="feature-row reverse">
              <div className="feature-text">
                <span className="eyebrow">Multiplayer Sync</span>
                <h2>Work together, <em>live or async</em></h2>
                <p>Collaborate with your squad across timezones. Never miss context with threaded notes next to the canvas.</p>
                <ul className="checklist">
                  <li>Real-time WebSocket CRDT presence and screen follow mode</li>
                  <li>Threaded element comments with @mentions</li>
                  <li>Live workshop voting and countdown timers</li>
                </ul>
              </div>
              <div className="visual">
                <div className="sticky float" style={{ top: '50px', left: '60px', background: 'var(--note-pink)', ['--r' as any]: '2deg' }}>
                  👍 6 votes on this
                </div>
                <div className="sticky float" style={{ top: '80px', left: '240px', background: 'var(--note-yellow)', ['--r' as any]: '-2deg', animationDelay: '-3s' }}>
                  @Kishan check token flow
                </div>
                <div className="sticky float" style={{ top: '210px', left: '140px', background: 'var(--note-green)', ['--r' as any]: '1deg', animationDelay: '-1s' }}>
                  ⏱ 04:59 workshop left
                </div>
              </div>
            </div>

            <div className="feature-row">
              <div className="feature-text">
                <span className="eyebrow">Smart Drawing</span>
                <h2>Draw freely, <em>finish cleanly</em></h2>
                <p>Sketch natural lines with Apple Pencil, stylus or mouse, and let smart shape recognition neaten everything up.</p>
                <ul className="checklist">
                  <li>Brush, highlighter, geometric shapes, and smart magnetic connectors</li>
                  <li>Intelligent shape snapping and auto-alignment guides</li>
                  <li>Rich sticky notes, Markdown text cards, and image assets</li>
                </ul>
              </div>
              <div className="visual">
                <div className="sticky float" style={{ top: '50px', left: '50px', background: 'var(--note-blue)', ['--r' as any]: '-2deg' }}>
                  ✏️ Freehand sketch
                </div>
                <div className="sticky float" style={{ top: '90px', left: '230px', background: 'var(--note-pink)', ['--r' as any]: '3deg', animationDelay: '-2s' }}>
                  ⬛ Auto snap to shape
                </div>
                <div className="sticky float" style={{ top: '210px', left: '130px', background: 'var(--note-yellow)', ['--r' as any]: '-1deg', animationDelay: '-4s' }}>
                  ➡️ Auto connect arrows
                </div>
              </div>
            </div>

            <div className="feature-row reverse">
              <div className="feature-text">
                <span className="eyebrow">AI Copilot</span>
                <h2>Get <em>unstuck</em> with Sankalp AI</h2>
                <p>Generate full architecture flowcharts from text prompts, auto-cluster sticky notes, and summarize meeting outcomes.</p>
                <ul className="checklist">
                  <li>Natural language to visual diagrams and workflow models</li>
                  <li>Auto-cluster and semantic summarization of brainstorm stickies</li>
                  <li>Export boards into structured sprint tasks and executive briefs</li>
                </ul>
              </div>
              <div className="visual">
                <div className="sticky float" style={{ top: '50px', left: '60px', background: 'var(--note-green)', ['--r' as any]: '1deg' }}>
                  ✨ "Diagram auth pipeline"
                </div>
                <div className="sticky float" style={{ top: '90px', left: '240px', background: 'var(--note-yellow)', ['--r' as any]: '-2deg', animationDelay: '-3s' }}>
                  Theme: Security (8 notes)
                </div>
                <div className="sticky float" style={{ top: '210px', left: '130px', background: 'var(--note-blue)', ['--r' as any]: '2deg', animationDelay: '-1s' }}>
                  Canvas summary ready ✅
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 9. INTEGRATIONS (from product.html) ── */}
        {/* ========================================================= */}
        <section className="section alt-bg" id="integrations">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Ecosystem</span>
              <h2>
                Plays <em>nicely</em> with your existing stack
              </h2>
              <p>Connect seamlessly to the development and collaboration tools your squad uses every day.</p>
            </div>

            <div className="grid grid-4">
              <div className="card integration">
                <div className="int-logo">S</div>
                <div>
                  <h3>Slack</h3>
                  <p>Real-time board notifications in team channels</p>
                </div>
              </div>
              <div className="card integration">
                <div className="int-logo">Z</div>
                <div>
                  <h3>Zoom</h3>
                  <p>Launch live collaborative whiteboard in meetings</p>
                </div>
              </div>
              <div className="card integration">
                <div className="int-logo">J</div>
                <div>
                  <h3>Jira</h3>
                  <p>Convert whiteboard cards directly into sprint backlog</p>
                </div>
              </div>
              <div className="card integration">
                <div className="int-logo">G</div>
                <div>
                  <h3>GitHub</h3>
                  <p>Embed board links in PRs, issues and release notes</p>
                </div>
              </div>
              <div className="card integration">
                <div className="int-logo">D</div>
                <div>
                  <h3>Google Drive</h3>
                  <p>Sync assets, spreadsheets and presentation decks</p>
                </div>
              </div>
              <div className="card integration">
                <div className="int-logo">T</div>
                <div>
                  <h3>Microsoft Teams</h3>
                  <p>Interactive shared tab inside team workspace channels</p>
                </div>
              </div>
              <div className="card integration">
                <div className="int-logo">N</div>
                <div>
                  <h3>Notion</h3>
                  <p>Embed interactive canvas directly into engineering wikis</p>
                </div>
              </div>
              <div className="card integration">
                <div className="int-logo">F</div>
                <div>
                  <h3>Figma</h3>
                  <p>Import UI design frames, mockups and vector components</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 10. ENTERPRISE SECURITY (from product.html) ── */}
        {/* ========================================================= */}
        <section className="section" id="security">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Enterprise Security</span>
              <h2>
                Bank-grade security, <em>built from day one</em>
              </h2>
              <p>Your ideas and internal architectures are valuable. We keep them strictly protected.</p>
            </div>
            <div className="grid grid-3">
              <div className="card">
                <div className="icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                  </svg>
                </div>
                <h3>Encryption everywhere</h3>
                <p>AES-256 encryption at rest and TLS 1.3 in transit for all boards, media, and websocket messages.</p>
              </div>

              <div className="card">
                <div className="icon-box teal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="4" y="10" width="16" height="11" rx="2" />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                  </svg>
                </div>
                <h3>SSO &amp; Granular RBAC</h3>
                <p>SAML 2.0 / Okta SSO, SCIM automated user provisioning, and role-based permissions per team folder.</p>
              </div>

              <div className="card">
                <div className="icon-box pink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                </div>
                <h3>SOC 2 Type II &amp; GDPR</h3>
                <p>Independently audited compliance, GDPR data subject rights, and enterprise custom data residency.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 11. PRICING PLANS (from pricing.html) ── */}
        {/* ========================================================= */}
        <section className="section alt-bg" id="pricing">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Transparent Pricing</span>
              <h2>
                Simple plans for <em>every team</em>
              </h2>
              <p>Start free and upgrade seamlessly as your team expands.</p>

              <div className="billing-toggle mt-6">
                <button
                  className={billingPeriod === 'monthly' ? 'active' : ''}
                  onClick={() => setBillingPeriod('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={billingPeriod === 'yearly' ? 'active' : ''}
                  onClick={() => setBillingPeriod('yearly')}
                >
                  Yearly <span className="save-badge">Save 20%</span>
                </button>
              </div>
            </div>

            <div className="grid grid-3 plans">
              {/* Free Plan */}
              <div className="card plan">
                <h3>Free Forever</h3>
                <p>For individuals and quick ideation.</p>
                <div className="price">
                  <strong>$0</strong>
                  <span>/ forever</span>
                </div>
                <p className="price-note">No credit card required</p>
                <ul className="checklist">
                  <li>3 editable boards</li>
                  <li>Unlimited guest viewers</li>
                  <li>50+ basic templates</li>
                  <li>Standard PNG export</li>
                </ul>
                <button onClick={handleStart} className="btn btn-ghost btn-block">
                  Get started free
                </button>
              </div>

              {/* Pro Plan */}
              <div className="card plan featured">
                <span className="popular">Most popular</span>
                <h3>Pro</h3>
                <p>For high-performing professionals and agile pods.</p>
                <div className="price">
                  <strong>{billingPeriod === 'yearly' ? '$6.40' : '$8'}</strong>
                  <span>/ user / month</span>
                </div>
                <p className="price-note">
                  {billingPeriod === 'yearly' ? 'Billed $76.80 yearly' : 'Billed monthly'}
                </p>
                <ul className="checklist">
                  <li>Unlimited boards &amp; objects</li>
                  <li>All 300+ pro templates</li>
                  <li>Sankalp AI copilot (500 credits/mo)</li>
                  <li>Export as PDF, PNG &amp; SVG</li>
                  <li>Version history (90 days)</li>
                </ul>
                <button onClick={handleStart} className="btn btn-primary btn-block">
                  Start 14-day free trial
                </button>
              </div>

              {/* Business Plan */}
              <div className="card plan">
                <h3>Business</h3>
                <p>For scaling organisations and multi-team collaboration.</p>
                <div className="price">
                  <strong>{billingPeriod === 'yearly' ? '$12.80' : '$16'}</strong>
                  <span>/ user / month</span>
                </div>
                <p className="price-note">
                  {billingPeriod === 'yearly' ? 'Billed $153.60 yearly' : 'Billed monthly'}
                </p>
                <ul className="checklist">
                  <li>Everything in Pro</li>
                  <li>Unlimited AI copilot generation</li>
                  <li>SAML SSO &amp; admin audit logs</li>
                  <li>Private workspace folders</li>
                  <li>Priority 24/7 support</li>
                </ul>
                <button onClick={handleStart} className="btn btn-ghost btn-block">
                  Start free trial
                </button>
              </div>
            </div>

            {/* Enterprise Card */}
            <div
              className="card mt-8 flex flex-col md:flex-row justify-between items-center gap-6"
              style={{ padding: '28px 36px' }}
            >
              <div>
                <h3 className="text-xl mb-1">Enterprise</h3>
                <p className="m-0 text-sm">
                  Dedicated customer success manager, custom SLA, SCIM user provisioning, and private cloud deployment.
                </p>
              </div>
              <button
                onClick={() => scrollToSection('contact', 'help')}
                className="btn btn-primary whitespace-nowrap"
              >
                Contact sales
              </button>
            </div>
            <p className="center mt-6 text-sm text-[#5E5C56]">
              Verified teachers and students receive Pro free. <button onClick={() => scrollToSection('help', 'help')} className="link bg-transparent border-none p-0 cursor-pointer">Learn how →</button>
            </p>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 12. PLAN COMPARISON TABLE ── */}
        {/* ========================================================= */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>Compare <em>plans</em></h2>
              <p>All feature specifications side by side.</p>
            </div>
            <div className="compare-wrap">
              <table className="compare">
                <thead>
                  <tr>
                    <th>Features</th>
                    <th>Free</th>
                    <th>Pro</th>
                    <th>Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="group">
                    <td colSpan={4}>Boards &amp; Canvas</td>
                  </tr>
                  <tr>
                    <td>Editable boards</td>
                    <td>3</td>
                    <td>Unlimited</td>
                    <td>Unlimited</td>
                  </tr>
                  <tr>
                    <td>Templates</td>
                    <td>50+</td>
                    <td>300+</td>
                    <td>300+ &amp; Custom</td>
                  </tr>
                  <tr>
                    <td>Version history</td>
                    <td className="no">—</td>
                    <td>90 days</td>
                    <td>Unlimited</td>
                  </tr>

                  <tr className="group">
                    <td colSpan={4}>Collaboration</td>
                  </tr>
                  <tr>
                    <td>Real-time multiplayer</td>
                    <td className="yes"><Check className="w-4 h-4 mx-auto text-[#1A1917]" /></td>
                    <td className="yes"><Check className="w-4 h-4 mx-auto text-[#1A1917]" /></td>
                    <td className="yes"><Check className="w-4 h-4 mx-auto text-[#1A1917]" /></td>
                  </tr>
                  <tr>
                    <td>Comments &amp; voting</td>
                    <td className="yes"><Check className="w-4 h-4 mx-auto text-[#1A1917]" /></td>
                    <td className="yes"><Check className="w-4 h-4 mx-auto text-[#1A1917]" /></td>
                    <td className="yes"><Check className="w-4 h-4 mx-auto text-[#1A1917]" /></td>
                  </tr>
                  <tr>
                    <td>Workshop timer &amp; facilitator tools</td>
                    <td className="no">—</td>
                    <td className="yes"><Check className="w-4 h-4 mx-auto text-[#1A1917]" /></td>
                    <td className="yes"><Check className="w-4 h-4 mx-auto text-[#1A1917]" /></td>
                  </tr>

                  <tr className="group">
                    <td colSpan={4}>Productivity &amp; AI</td>
                  </tr>
                  <tr>
                    <td>AI Copilot assist</td>
                    <td className="no">—</td>
                    <td>500 credits</td>
                    <td>Unlimited</td>
                  </tr>
                  <tr>
                    <td>Export formats</td>
                    <td>PNG</td>
                    <td>PNG, PDF, SVG</td>
                    <td>PNG, PDF, SVG</td>
                  </tr>
                  <tr>
                    <td>Third-party integrations</td>
                    <td>Basic</td>
                    <td>All</td>
                    <td>All</td>
                  </tr>

                  <tr className="group">
                    <td colSpan={4}>Security &amp; Administration</td>
                  </tr>
                  <tr>
                    <td>SAML SSO &amp; SCIM</td>
                    <td className="no">—</td>
                    <td className="no">—</td>
                    <td className="yes"><Check className="w-4 h-4 mx-auto text-[#1A1917]" /></td>
                  </tr>
                  <tr>
                    <td>Admin Console</td>
                    <td className="no">—</td>
                    <td className="no">—</td>
                    <td className="yes"><Check className="w-4 h-4 mx-auto text-[#1A1917]" /></td>
                  </tr>
                  <tr>
                    <td>Support channel</td>
                    <td>Community</td>
                    <td>Email</td>
                    <td>Priority 24/7</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 13. HELP CENTER & SEARCH (from help.html) ── */}
        {/* ========================================================= */}
        <section className="section alt-bg" id="help">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Help Center</span>
              <h2>How can we <em>help you?</em></h2>
              <p>Search guides, documentation and tutorials for Sankalp Whiteboard.</p>

              <div className="search-box mt-6">
                <Search className="w-5 h-5" />
                <input
                  type="search"
                  placeholder="Search articles, e.g. 'export', 'templates', 'sharing'..."
                  value={helpSearchQuery}
                  onChange={(e) => setHelpSearchQuery(e.target.value)}
                />
              </div>

              <div className="popular-tags">
                <span>Popular:</span>
                <button onClick={() => setHelpSearchQuery('sharing')}>sharing</button>
                <button onClick={() => setHelpSearchQuery('export')}>export</button>
                <button onClick={() => setHelpSearchQuery('templates')}>templates</button>
                <button onClick={() => setHelpSearchQuery('billing')}>billing</button>
              </div>
            </div>

            <div className="grid grid-3">
              <div className="card help-cat">
                <div className="icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
                <h3>Getting started</h3>
                <p>Create your account, start your first board, and learn the essential canvas shortcuts.</p>
                <span className="count">12 articles</span>
              </div>

              <div className="card help-cat">
                <div className="icon-box amber">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4Z" />
                  </svg>
                </div>
                <h3>Drawing &amp; tools</h3>
                <p>Pens, shapes, sticky notes, connectors, and smart drawing recognition.</p>
                <span className="count">18 articles</span>
              </div>

              <div className="card help-cat">
                <div className="icon-box teal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="9" cy="8" r="3" />
                    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                    <path d="M16 4a3 3 0 0 1 0 6M21 20c0-2.5-1.5-4.6-3.5-5.5" />
                  </svg>
                </div>
                <h3>Sharing &amp; collaboration</h3>
                <p>Invite teammates, configure role permissions, mention teammates, and follow presenter.</p>
                <span className="count">15 articles</span>
              </div>

              <div className="card help-cat">
                <div className="icon-box pink">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1.5" />
                    <rect x="14" y="3" width="7" height="7" rx="1.5" />
                    <rect x="3" y="14" width="7" height="7" rx="1.5" />
                    <rect x="14" y="14" width="7" height="7" rx="1.5" />
                  </svg>
                </div>
                <h3>Templates &amp; AI</h3>
                <p>Explore pre-built frameworks, customize boards, and generate diagrams with AI copilot.</p>
                <span className="count">9 articles</span>
              </div>

              <div className="card help-cat">
                <div className="icon-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                </div>
                <h3>Export &amp; present</h3>
                <p>Download boards as PDF, PNG or SVG and run live presentation mode in meetings.</p>
                <span className="count">7 articles</span>
              </div>

              <div className="card help-cat">
                <div className="icon-box teal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="5" width="20" height="14" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </div>
                <h3>Billing &amp; plans</h3>
                <p>Manage team subscriptions, invoices, student discounts, and custom enterprise licensing.</p>
                <span className="count">11 articles</span>
              </div>
            </div>

            {/* Filtered Articles List */}
            <div className="mt-12 max-w-[820px] mx-auto">
              <h3 className="text-xl mb-4 text-center">Popular <em>guides</em></h3>
              <ul className="article-list">
                {filteredArticles.map((art, idx) => (
                  <li key={idx}>
                    <a onClick={handleStart} className="cursor-pointer">
                      <span>{art.title}</span>
                      <span>{art.time}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 14. FREQUENTLY ASKED QUESTIONS ── */}
        {/* ========================================================= */}
        <section className="section" id="faq">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">FAQ</span>
              <h2>Frequently asked <em>questions</em></h2>
              <p>Everything you need to know about getting started.</p>
            </div>
            <div className="faq">
              <details open>
                <summary>Do I or my team need to install anything?</summary>
                <p>
                  No installation required! Sankalp Whiteboard runs entirely in any modern browser using high-performance WebGL. We also offer installable progressive desktop applications for Windows, Mac, and Linux.
                </p>
              </details>
              <details>
                <summary>Can people without an account join my board?</summary>
                <p>
                  Yes! You can generate a secure guest link with view or edit permissions, allowing external clients or stakeholders to participate immediately without requiring sign-up.
                </p>
              </details>
              <details>
                <summary>How many people can collaborate on a single board at once?</summary>
                <p>
                  Our WebGL and CRDT architecture effortlessly supports up to 300 concurrent collaborators with real-time cursors and shape modifications on paid plans, and up to 25 on the Free forever plan.
                </p>
              </details>
              <details>
                <summary>How does the Sankalp AI Copilot work?</summary>
                <p>
                  The AI Copilot understands natural language prompts (e.g., "Create a cloud microservice architecture" or "Cluster these retro stickies by sentiment") and translates them directly into interactive shapes, sticky notes, and connecting lines on your canvas.
                </p>
              </details>
              <details>
                <summary>Is my data secure and compliant?</summary>
                <p>
                  Yes. All canvas data is encrypted both in transit (TLS 1.3) and at rest (AES-256). We maintain SOC 2 Type II compliance standards and full GDPR compatibility.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 15. CONTACT SUPPORT (from help.html) ── */}
        {/* ========================================================= */}
        <section className="section alt-bg" id="contact">
          <div className="container">
            <div className="section-head">
              <h2>Still need <em>help?</em></h2>
              <p>Our engineering and support team is ready to help 24/7.</p>
            </div>
            <div className="grid grid-3">
              <div className="card center">
                <div className="icon-box" style={{ margin: '0 auto 18px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h3>Live chat</h3>
                <p>Average reply in under 5 minutes.</p>
                <button onClick={handleStart} className="btn btn-ghost">Start a chat</button>
              </div>

              <div className="card center">
                <div className="icon-box teal" style={{ margin: '0 auto 18px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="m3 7 9 6 9-6" />
                  </svg>
                </div>
                <h3>Email support</h3>
                <p>support@sankalplabs.com</p>
                <a href="mailto:support@sankalplabs.com" className="btn btn-ghost">Send an email</a>
              </div>

              <div className="card center">
                <div className="icon-box pink" style={{ margin: '0 auto 18px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="9" cy="8" r="3" />
                    <circle cx="17" cy="9" r="2.5" />
                    <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M15 20c0-2 1-4 3.5-4S22 18 22 20" />
                  </svg>
                </div>
                <h3>Community Discord</h3>
                <p>Share tips and custom templates.</p>
                <button onClick={handleStart} className="btn btn-ghost">Join community</button>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 16. STATS BAND ── */}
        {/* ========================================================= */}
        <section className="section-sm">
          <div className="container">
            <div className="stats grid grid-4 center">
              <div className="stat">
                <strong>2M+</strong>
                <span>Active users</span>
              </div>
              <div className="stat">
                <strong>15M</strong>
                <span>Boards created</span>
              </div>
              <div className="stat">
                <strong>190</strong>
                <span>Countries</span>
              </div>
              <div className="stat">
                <strong>4.8★</strong>
                <span>Average rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 17. TESTIMONIALS ── */}
        {/* ========================================================= */}
        <section className="section">
          <div className="container">
            <div className="section-head">
              <span className="eyebrow">Loved by teams</span>
              <h2>Don't just take <em>our word</em> for it</h2>
              <p>What engineering leads and designers say after switching to Sankalp Whiteboard.</p>
            </div>
            <div className="grid grid-3">
              <div className="card quote">
                <div className="stars">★★★★★</div>
                <p>
                  "Our remote sprint retros went from awkward silence to genuinely engaging collaborative sessions. Sankalp Whiteboard feels like everyone is in the same room."
                </p>
                <div className="person">
                  <div className="av">PN</div>
                  <div>
                    <b>Priya Nair</b>
                    <span>Engineering Manager, Lumora</span>
                  </div>
                </div>
              </div>

              <div className="card quote">
                <div className="stars">★★★★★</div>
                <p>
                  "My students collaborate on interactive mind maps and group diagrams every week. It's clean, snappy, and intuitive enough for anyone to use immediately."
                </p>
                <div className="person">
                  <div className="av">MD</div>
                  <div>
                    <b>Marcus Dean</b>
                    <span>Science Department Lead</span>
                  </div>
                </div>
              </div>

              <div className="card quote">
                <div className="stars">★★★★★</div>
                <p>
                  "We replaced three separate fragmented tools with Sankalp Whiteboard. Architecture diagrams, wireframe workshops, and product roadmaps all live in one unified space."
                </p>
                <div className="person">
                  <div className="av">LC</div>
                  <div>
                    <b>Lena Costa</b>
                    <span>Head of Product Design, Orbitly</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* ── 18. FINAL CTA ── */}
        {/* ========================================================= */}
        <section className="section-sm">
          <div className="container">
            <div className="cta">
              <h2>Ready to bring your ideas <em>to life?</em></h2>
              <p>Free to start forever. Your first collaborative board takes seconds.</p>
              <button onClick={handleStart} className="btn btn-white btn-lg">
                Create your first board
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================= */}
      {/* ── 19. FOOTER ── */}
      {/* ========================================================= */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo flex items-center">
                <img
                  src="/sankalplabs-by-kk.png"
                  alt="SankalpLabs"
                  className="h-9 w-auto object-contain"
                />
              </div>
              <p className="mt-3">
                The visual collaboration workspace where teams brainstorm, architect systems, and build great ideas together.
              </p>
              <div className="socials">
                <a href="#" aria-label="X / Twitter">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.5 3h3.3l-7.2 8.2L22 21h-6.6l-5.2-6.8L4.3 21H1l7.7-8.8L.8 3h6.8l4.7 6.2L17.5 3Zm-1.2 16h1.8L6.8 4.9H4.9L16.3 19Z" />
                  </svg>
                </a>
                <a href="#" aria-label="LinkedIn">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4V21H3V9.5Zm6.5 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.1c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5Z" />
                  </svg>
                </a>
                <a href="#" aria-label="GitHub">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
              </div>
            </div>

            <div>
              <h4>Product</h4>
              <ul>
                <li><a onClick={() => scrollToSection('features', 'product')} className="cursor-pointer">Features</a></li>
                <li><a onClick={() => scrollToSection('integrations', 'product')} className="cursor-pointer">Integrations</a></li>
                <li><a onClick={() => scrollToSection('templates', 'templates')} className="cursor-pointer">Templates</a></li>
                <li><a onClick={() => scrollToSection('pricing', 'pricing')} className="cursor-pointer">Pricing</a></li>
                <li><a onClick={() => scrollToSection('security', 'product')} className="cursor-pointer">Security</a></li>
              </ul>
            </div>

            <div>
              <h4>Solutions</h4>
              <ul>
                <li><a onClick={() => { scrollToSection('usecases', 'home'); setActiveUseCase('teams'); }} className="cursor-pointer">For teams</a></li>
                <li><a onClick={() => { scrollToSection('usecases', 'home'); setActiveUseCase('edu'); }} className="cursor-pointer">For education</a></li>
                <li><a onClick={() => { scrollToSection('usecases', 'home'); setActiveUseCase('design'); }} className="cursor-pointer">For designers</a></li>
                <li><a onClick={() => { scrollToSection('usecases', 'home'); setActiveUseCase('eng'); }} className="cursor-pointer">For engineers</a></li>
              </ul>
            </div>

            <div>
              <h4>Resources</h4>
              <ul>
                <li><a onClick={() => scrollToSection('help', 'help')} className="cursor-pointer">Help center</a></li>
                <li><a onClick={() => scrollToSection('faq', 'help')} className="cursor-pointer">FAQs</a></li>
                <li><a onClick={() => scrollToSection('templates', 'templates')} className="cursor-pointer">Template library</a></li>
                <li><a onClick={handleStart} className="cursor-pointer">Community forum</a></li>
              </ul>
            </div>

            <div>
              <h4>Company</h4>
              <ul>
                <li><a onClick={handleStart} className="cursor-pointer">About SankalpLabs</a></li>
                <li><a onClick={handleStart} className="cursor-pointer">Careers</a></li>
                <li><a onClick={() => scrollToSection('contact', 'help')} className="cursor-pointer">Contact sales</a></li>
                <li><a onClick={handleStart} className="cursor-pointer">Privacy &amp; Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} SankalpLabs, Inc. All rights reserved.</span>
            <div>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
              <a href="#">Security</a>
            </div>
          </div>
        </div>
      </footer>

      {/* ========================================================= */}
      {/* ── 20. AUTH MODAL POPUP ── */}
      {/* ========================================================= */}
      <AnimatePresence>
        {authModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1A1917]/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="relative w-full max-w-md">
              <button
                onClick={() => setAuthModalOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 text-[#5E5C56] hover:text-[#1A1917] rounded-full hover:bg-[#F3F2EE] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <AuthPage
                onSuccess={() => {
                  setAuthModalOpen(false);
                  if (onEnterApp) onEnterApp();
                }}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
