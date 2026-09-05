import React, { useState } from 'react';
import {
  FileText, Copy, Download, Code, Check, AlertTriangle, ShieldCheck,
  Building2, ArrowRight, BookmarkCheck, HeartHandshake, Eye
} from 'lucide-react';
import EvidenceColumns from './EvidenceColumns';

export default function TriageNoteCard({
  triageEvaluation,
  triageNote,
  safetyResult,
  onReset
}) {
  const [copied, setCopied] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);

  if (!triageEvaluation || !triageNote) {
    return (
      <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
        <FileText size={36} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ color: 'var(--text-secondary)' }}>Awaiting Patient Intake Analysis</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '400px', margin: '0.5rem auto' }}>
          Select a live demo scenario above or enter a patient description to generate an auditable clinical triage note.
        </p>
      </div>
    );
  }

  const handleCopyNote = () => {
    navigator.clipboard.writeText(triageNote.plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadNote = () => {
    const blob = new Blob([triageNote.plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `triage_note_${triageEvaluation.ruleId}_${Date.now()}.txt`;
    link.click();
  };

  const getUrgencyBg = (urgency) => {
    switch (urgency) {
      case "EMERGENCY":
        return { bg: "rgba(239, 68, 68, 0.15)", border: "rgba(239, 68, 68, 0.5)", text: "#EF4444" };
      case "URGENT":
        return { bg: "rgba(249, 115, 22, 0.15)", border: "rgba(249, 115, 22, 0.5)", text: "#F97316" };
      case "PRIORITY":
        return { bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.5)", text: "#F59E0B" };
      case "ROUTINE":
        return { bg: "rgba(16, 185, 129, 0.15)", border: "rgba(16, 185, 129, 0.5)", text: "#10B981" };
      case "URGENT HUMAN REVIEW":
        return { bg: "rgba(139, 92, 246, 0.18)", border: "rgba(139, 92, 246, 0.5)", text: "#A855F7" };
      default:
        return { bg: "rgba(31, 41, 55, 0.7)", border: "var(--border-subtle)", text: "#94A3B8" };
    }
  };

  const styleConfig = getUrgencyBg(triageEvaluation.urgency);

  return (
    <div className="glass-card triage-note-card" id="triage-note-container">
      {/* Header & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <BookmarkCheck size={20} color="#38BDF8" />
          <h2 style={{ fontSize: '1.2rem', color: '#FFFFFF' }}>2. Generated Triage Note</h2>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleCopyNote}
            className="btn-secondary"
            id="btn-copy-note"
          >
            {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            {copied ? "Copied to Clipboard!" : "Copy Note"}
          </button>
          <button
            type="button"
            onClick={handleDownloadNote}
            className="btn-secondary"
            id="btn-download-note"
          >
            <Download size={14} />
            Export TXT
          </button>
          <button
            type="button"
            onClick={() => setShowJsonModal(true)}
            className="btn-secondary"
            id="btn-view-fhir-json"
          >
            <Code size={14} />
            FHIR JSON
          </button>
        </div>
      </div>

      {/* Urgency & Routing Banner */}
      <div
        className="triage-urgency-banner"
        style={{
          background: styleConfig.bg,
          borderColor: styleConfig.border
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="urgency-badge-main" style={{ color: styleConfig.text }}>
            <span style={{ fontSize: '0.85rem', color: '#94A3B8', textTransform: 'uppercase' }}>Acuity:</span>
            {triageEvaluation.urgency}
          </div>
          <div className="rule-citation-chip">
            <ShieldCheck size={14} color="#38BDF8" />
            Citing Rule: <strong style={{ color: '#38BDF8' }}>{triageEvaluation.citation}</strong>
          </div>
        </div>

        <div className="routing-dept-box">
          <Building2 size={18} color="#94A3B8" />
          <span>Routing: <strong>{triageEvaluation.department}</strong></span>
        </div>
      </div>

      {/* Clinical Reason */}
      <div className="triage-reason-box">
        <div className="triage-reason-label">Clinical Rule Rationale & Trigger</div>
        <p style={{ color: '#F1F5F9' }}>{triageEvaluation.reason}</p>
      </div>

      {/* Human Escalation Alert */}
      {safetyResult.finalEscalation && (
        <div className={`escalation-alert-card ${triageEvaluation.isUncertain ? 'uncertainty' : ''}`} id="escalation-alert-banner">
          <AlertTriangle size={22} className="escalation-icon" />
          <div className="escalation-content">
            <div className="escalation-title">
              HUMAN ESCALATION REQUIRED: YES
            </div>
            <div className="escalation-text">
              <strong>Reason: </strong>
              {safetyResult.escalationReasons.join("; ")}
            </div>
          </div>
        </div>
      )}

      {/* 3-Column Evidence Breakdown */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94A3B8', marginBottom: '0.5rem' }}>
          CLINICAL EVIDENCE BREAKDOWN
        </div>
        <EvidenceColumns
          patientReported={triageNote.patientReported}
          followUpEstablished={triageNote.followUpEstablished}
          remainingUnknown={triageNote.remainingUnknown}
        />
      </div>

      {/* Safety Non-Diagnostic Disclaimer */}
      <div className="safety-seal-box">
        <ShieldCheck size={18} color="#0D9488" />
        <span>
          <strong>AI Limitation & Safety Governance:</strong> This system strictly generates triage acuity recommendations and care routing based on predefined clinical rules. It does <strong>NOT</strong> diagnose medical diseases or formulate treatment plans.
        </span>
      </div>

      {/* FHIR JSON Modal */}
      {showJsonModal && (
        <div className="modal-overlay" onClick={() => setShowJsonModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Code size={20} color="#38BDF8" />
                <h3 style={{ color: '#FFFFFF' }}>FHIR HL7-Compatible Triage Note JSON Payload</h3>
              </div>
              <button
                className="btn-secondary"
                onClick={() => setShowJsonModal(false)}
              >
                Close
              </button>
            </div>
            <div className="modal-body">
              <pre style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                background: '#090D16',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                overflowX: 'auto',
                color: '#38BDF8'
              }}>
                {JSON.stringify(triageNote.fhirPayload, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
