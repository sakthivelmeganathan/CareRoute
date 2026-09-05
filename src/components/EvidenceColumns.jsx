import React from 'react';
import { UserCheck, MessageSquareCheck, HelpCircle } from 'lucide-react';

export default function EvidenceColumns({
  patientReported = [],
  followUpEstablished = [],
  remainingUnknown = []
}) {
  return (
    <div className="evidence-columns-grid">
      {/* 1. PATIENT-REPORTED INFORMATION */}
      <div className="evidence-col patient-rep">
        <div className="evidence-col-title" style={{ color: '#38BDF8' }}>
          <UserCheck size={16} />
          Patient-Reported
        </div>
        <ul className="evidence-list">
          {patientReported.length > 0 ? (
            patientReported.map((item, idx) => (
              <li key={idx} id={`patient-rep-item-${idx}`}>{item}</li>
            ))
          ) : (
            <li style={{ color: 'var(--text-muted)' }}>No initial cues detected</li>
          )}
        </ul>
      </div>

      {/* 2. FOLLOW-UP ESTABLISHED */}
      <div className="evidence-col followup-est">
        <div className="evidence-col-title" style={{ color: '#34D399' }}>
          <MessageSquareCheck size={16} />
          Follow-Up Established
        </div>
        <ul className="evidence-list">
          {followUpEstablished.length > 0 ? (
            followUpEstablished.map((item, idx) => (
              <li key={idx} id={`followup-est-item-${idx}`}>{item}</li>
            ))
          ) : (
            <li style={{ color: 'var(--text-muted)' }}>Pending follow-up questions</li>
          )}
        </ul>
      </div>

      {/* 3. REMAINING UNKNOWN */}
      <div className="evidence-col remain-unk">
        <div className="evidence-col-title" style={{ color: '#C084FC' }}>
          <HelpCircle size={16} />
          Remaining Unknown
        </div>
        <ul className="evidence-list">
          {remainingUnknown.length > 0 ? (
            remainingUnknown.map((item, idx) => (
              <li key={idx} id={`remain-unk-item-${idx}`}>{item}</li>
            ))
          ) : (
            <li style={{ color: 'var(--text-muted)' }}>No critical unknowns remaining</li>
          )}
        </ul>
      </div>
    </div>
  );
}
