import React, { useState } from 'react';
import { Send, Mic, Sparkles, RefreshCw, AlertCircle, ArrowRight } from 'lucide-react';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const isSpeechRecognitionSupported = !!SpeechRecognition;

export default function IntakeForm({
  inputText,
  setInputText,
  onAnalyze,
  onReset,
  isLoading
}) {
  const [isRecording, setIsRecording] = useState(false);

  const quickSymptoms = [
    "Chest tightness since morning",
    "Fever for 2 days, drinking water",
    "Stomach pain and feeling faint",
    "Twisted ankle, can't walk",
    "Shortness of breath, gasping"
  ];

  const handleToggleListening = () => {
    if (!isSpeechRecognitionSupported) {
      // Fallback to simulated voice
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInputText("I have chest pain since morning and feel a little dizzy.");
      }, 1200);
      return;
    }
    // If already recording, stop (optional)
    if (isRecording) {
      // No explicit stop logic as SpeechRecognition instance is short-lived
      setIsRecording(false);
      return;
    }
    const recognizer = new SpeechRecognition();
    recognizer.continuous = false;
    recognizer.interimResults = false;
    recognizer.lang = 'en-US';
    recognizer.onstart = () => setIsRecording(true);
    recognizer.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join(' ');
      setInputText(transcript);
    };
    recognizer.onerror = () => setIsRecording(false);
    recognizer.onend = () => setIsRecording(false);
    recognizer.start();
  };

  return (
    <div className="glass-card intake-section">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', color: '#FFFFFF' }}>1. Patient Plain Language Intake</h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            Patients describe symptoms in everyday, informal terms. The assistant extracts facts & spots missing critical data.
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleListening}
          className="btn-secondary"
          title="Simulate Voice Dictation"
          style={{ borderColor: isRecording ? '#EF4444' : 'var(--border-subtle)' }}
        >
          <Mic size={15} color={isRecording ? '#EF4444' : '#38BDF8'} />
          {isRecording ? "Listening..." : "Simulate Speech"}
        </button>
      </div>

      <textarea
        className="intake-textarea"
        placeholder="Type or paste patient's description (e.g. 'I've had a bad headache and fever since yesterday, feeling really weak' or 'My chest hurts and I feel tight when breathing')..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={4}
        id="patient-intake-input"
      />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Phrases:</span>
        {quickSymptoms.map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(phrase)}
            style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              background: 'rgba(31, 41, 55, 0.7)',
              border: '1px solid var(--border-subtle)',
              color: '#94A3B8'
            }}
          >
            + {phrase}
          </button>
        ))}
      </div>

      <div className="intake-toolbar">
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary"
          id="btn-reset-intake"
        >
          <RefreshCw size={14} />
          Reset Form
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={!inputText.trim() || isLoading}
          className="btn-primary"
          id="btn-analyze-intake"
          style={{ opacity: !inputText.trim() ? 0.6 : 1 }}
        >
          <Sparkles size={16} />
          Process Intake & Spot Missing Data
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
