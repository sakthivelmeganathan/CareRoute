import React from 'react';
import { History, ShieldCheck, Download, Trash2, FileText, CheckCircle } from 'lucide-react';

export default function AuditLogView({ auditLogs, onClearLogs }) {
  const exportAllLogs = () => {
    const blob = new Blob([JSON.stringify(auditLogs, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `careroute_audit_trail_${Date.now()}.json`;
    a.click();
  };

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={24} color="#38BDF8" />
            <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF' }}>Clinical Triage Audit Trail</h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Complete traceability log of patient intakes, rule citations, evidence partitions, and escalation decisions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={exportAllLogs}
            disabled={auditLogs.length === 0}
            className="btn-secondary"
            id="btn-export-audit-json"
          >
            <Download size={14} />
            Export Audit JSON
          </button>
          <button
            type="button"
            onClick={onClearLogs}
            disabled={auditLogs.length === 0}
            className="btn-secondary"
            style={{ color: '#EF4444' }}
            id="btn-clear-audit-logs"
          >
            <Trash2 size={14} />
            Clear
          </button>
        </div>
      </div>

      {auditLogs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <History size={36} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <div>No triage decisions logged in this session yet.</div>
          <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>Process a case in the Triage Console to see it recorded here.</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {auditLogs.map((log, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(30, 41, 59, 0.6)',
                border: '1px solid var(--border-glass)',
                borderRadius: '10px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#94A3B8' }}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    padding: '0.15rem 0.5rem',
                    borderRadius: '4px',
                    background: '#090D16',
                    color: '#38BDF8'
                  }}>
                    Rule: {log.triageEvaluation.citation}
                  </span>
                  <span className="preset-tag emergency" style={{ fontSize: '0.7rem' }}>
                    {log.triageEvaluation.urgency}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#FFFFFF' }}>
                  Dept: <strong>{log.triageEvaluation.department}</strong>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                <strong>Patient Statement: </strong> "{log.patientData.rawText}"
              </div>

              <div style={{ fontSize: '0.8rem', color: '#94A3B8', borderTop: '1px solid var(--border-glass)', paddingTop: '0.5rem' }}>
                <strong>Reason: </strong> {log.triageEvaluation.reason}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
