import React from 'react';
import { ShieldCheck, Stethoscope, BookOpen, CheckCircle2, History, AlertTriangle } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, auditCount }) {
  return (
    <header className="header-wrapper">
      <div className="brand-section">
        <div className="brand-logo-badge">
          <Stethoscope size={24} />
        </div>
        <div>
          <div className="brand-title">
            CareRoute
            <span className="track-badge">TRACK_ID=PS01</span>
          </div>
          <div className="brand-subtitle">
            Rule-Grounded Patient Intake Triage Assistant • Non-Diagnostic Decision Support
          </div>
        </div>
      </div>

      <nav className="header-nav">
        <button
          className={`nav-tab-btn ${activeTab === 'triage' ? 'active' : ''}`}
          onClick={() => setActiveTab('triage')}
          id="nav-tab-triage"
        >
          <Stethoscope size={16} />
          Triage Console
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
          onClick={() => setActiveTab('rules')}
          id="nav-tab-rules"
        >
          <BookOpen size={16} />
          Rule Database
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'benchmark' ? 'active' : ''}`}
          onClick={() => setActiveTab('benchmark')}
          id="nav-tab-benchmark"
        >
          <CheckCircle2 size={16} />
          Benchmark Suite
        </button>
        <button
          className={`nav-tab-btn ${activeTab === 'audit' ? 'active' : ''}`}
          onClick={() => setActiveTab('audit')}
          id="nav-tab-audit"
        >
          <History size={16} />
          Audit Logs ({auditCount})
        </button>
      </nav>
    </header>
  );
}
