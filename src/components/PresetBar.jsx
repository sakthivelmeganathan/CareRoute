import React from 'react';
import { PRESET_CASES } from '../data/presetCases';
import { Sparkles, Play, ShieldAlert, HeartPulse, HelpCircle, Activity } from 'lucide-react';

export default function PresetBar({ activePresetId, onSelectPreset }) {
  const demoCases = PRESET_CASES.slice(0, 3);
  const otherCases = PRESET_CASES.slice(3);

  const getTagClass = (urgency) => {
    if (urgency === "EMERGENCY") return "emergency";
    if (urgency === "ROUTINE") return "routine";
    if (urgency === "URGENT HUMAN REVIEW") return "uncertain";
    return "routine";
  };

  const getIcon = (category) => {
    switch (category) {
      case "chest_pain": return <HeartPulse size={14} />;
      case "breathing_difficulty": return <Activity size={14} />;
      case "injury": return <ShieldAlert size={14} />;
      case "abdominal_pain": return <HelpCircle size={14} />;
      default: return <Sparkles size={14} />;
    }
  };

  return (
    <div className="preset-bar">
      <div className="preset-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={16} color="#38BDF8" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#E2E8F0' }}>
            Live Demo Scenarios (One-Click Clinical Vignettes)
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
          Click any scenario to simulate walk-in intake & follow-up reasoning
        </span>
      </div>

      <div className="preset-pills-row">
        {PRESET_CASES.map((preset) => {
          const isActive = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              className={`preset-card ${isActive ? 'active-preset' : ''}`}
              onClick={() => onSelectPreset(preset)}
              id={`preset-btn-${preset.id}`}
            >
              <div className="preset-badge-row">
                <span className={`preset-tag ${getTagClass(preset.expectedUrgency)}`}>
                  {preset.expectedUrgency}
                </span>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontFamily: 'var(--font-mono)' }}>
                  {preset.expectedRule}
                </span>
              </div>
              <div className="preset-title" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {getIcon(preset.category)}
                {preset.title}
              </div>
              <div className="preset-snippet">
                "{preset.patientInput}"
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
