import React from 'react';
import { HelpCircle, AlertCircle, CheckCircle, ArrowRight, ShieldQuestion } from 'lucide-react';

export default function FollowUpCard({
  pendingQuestions,
  currentQuestionIndex,
  onAnswerQuestion,
  onSkipAll,
  patientData
}) {
  if (!pendingQuestions || pendingQuestions.length === 0) return null;

  const currentQ = pendingQuestions[currentQuestionIndex] || pendingQuestions[0];
  const total = pendingQuestions.length;
  const currentNum = Math.min(currentQuestionIndex + 1, total);

  return (
    <div className="followup-container" id="follow-up-engine-container">
      <div className="followup-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle size={18} color="#38BDF8" />
          <h3 style={{ fontSize: '1rem', color: '#FFFFFF' }}>
            Follow-Up Question Engine ({currentNum} of {total})
          </h3>
        </div>
        <span className="followup-step-pill">
          Targeting Missing Safety Data
        </span>
      </div>

      <div className="question-box">
        <div className="question-title">{currentQ.question}</div>
        {currentQ.subtext && (
          <div className="question-subtext">{currentQ.subtext}</div>
        )}
      </div>

      <div className="options-grid">
        {currentQ.options.map((opt, idx) => {
          const isRed = opt.isRedFlag;
          const isUnk = opt.isUnknown;

          return (
            <button
              key={idx}
              type="button"
              className={`option-btn ${isRed ? 'red-flag-opt' : ''} ${isUnk ? 'unknown-opt' : ''}`}
              onClick={() => onAnswerQuestion(currentQ, opt)}
              id={`option-btn-${currentQ.field}-${idx}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isRed && <AlertCircle size={14} color="#EF4444" />}
                {isUnk && <ShieldQuestion size={14} color="#C084FC" />}
                {!isRed && !isUnk && <CheckCircle size={14} color="#10B981" />}
                <span>{opt.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          * Unknown responses remain NULL and are never assumed negative.
        </span>
        {total > 1 && (
          <button
            type="button"
            onClick={onSkipAll}
            style={{
              fontSize: '0.78rem',
              color: '#94A3B8',
              textDecoration: 'underline'
            }}
          >
            Mark Remaining as Unknown & Evaluate
          </button>
        )}
      </div>
    </div>
  );
}
