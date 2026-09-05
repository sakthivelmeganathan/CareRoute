import React, { useState } from 'react';
import { TRIAGE_RULES, COMPLAINT_CONFIG } from '../data/triageRules';
import { BookOpen, Search, ShieldAlert, CheckCircle, AlertTriangle, ArrowRight, Filter } from 'lucide-react';

export default function RuleBookView() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRules = TRIAGE_RULES.filter(rule => {
    const matchesCategory = selectedCategory === "all" || rule.complaint === selectedCategory;
    const matchesQuery =
      rule.ruleId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const getUrgencyBadgeClass = (urgency) => {
    switch (urgency) {
      case "EMERGENCY": return "emergency";
      case "URGENT": return "emergency";
      case "PRIORITY": return "uncertain";
      case "ROUTINE": return "routine";
      case "URGENT HUMAN REVIEW": return "uncertain";
      default: return "routine";
    }
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BookOpen size={22} color="#38BDF8" />
            <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF' }}>Predefined Clinical Triage Rule Database</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Transparent, deterministic rule catalog. The AI retrieves and cites these rules rather than inventing decisions.
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            placeholder="Search rules, IDs, symptoms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.8rem 0.6rem 2.2rem',
              borderRadius: '8px',
              background: 'rgba(31, 41, 55, 0.7)',
              border: '1px solid var(--border-subtle)',
              color: '#FFFFFF'
            }}
          />
        </div>
      </div>

      {/* Category Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        <button
          className={`nav-tab-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          All Complaints ({TRIAGE_RULES.length})
        </button>
        {Object.entries(COMPLAINT_CONFIG).map(([key, config]) => (
          <button
            key={key}
            className={`nav-tab-btn ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(key)}
          >
            {config.label}
          </button>
        ))}
        <button
          className={`nav-tab-btn ${selectedCategory === 'any' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('any')}
        >
          Safety Escalation Rules
        </button>
      </div>

      {/* Rules Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {filteredRules.map((rule) => (
          <div
            key={rule.ruleId}
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid var(--border-glass)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.6rem',
                  borderRadius: '6px',
                  background: '#090D16',
                  color: '#38BDF8',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                RULE {rule.ruleId}
              </span>
              <span className={`preset-tag ${getUrgencyBadgeClass(rule.urgency)}`}>
                {rule.urgency}
              </span>
            </div>

            <h3 style={{ fontSize: '1.05rem', color: '#FFFFFF' }}>{rule.ruleName}</h3>

            {/* IF Conditions */}
            <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '0.75rem', borderRadius: '8px', fontSize: '0.8rem' }}>
              <div style={{ color: '#94A3B8', fontWeight: 700, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                IF Conditions:
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {rule.conditions.map((cond, idx) => (
                  <li key={idx} style={{ fontFamily: 'var(--font-mono)', color: '#34D399' }}>
                    ↳ {cond}
                  </li>
                ))}
              </ul>
            </div>

            {/* THEN Urgency & Department */}
            <div style={{ fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div>
                <strong style={{ color: '#94A3B8' }}>THEN Routing: </strong>
                <span style={{ color: '#FFFFFF' }}>{rule.department}</span>
              </div>
              <div>
                <strong style={{ color: '#94A3B8' }}>Human Escalation: </strong>
                <span style={{ color: rule.human_escalation ? '#EF4444' : '#10B981', fontWeight: 700 }}>
                  {rule.human_escalation ? "YES (Mandatory)" : "NO (Standard)"}
                </span>
              </div>
            </div>

            {/* REASON */}
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem' }}>
              <strong>Clinical Rationale: </strong> {rule.reason}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
