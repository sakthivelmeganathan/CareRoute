import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PresetBar from './components/PresetBar';
import IntakeForm from './components/IntakeForm';
import FollowUpCard from './components/FollowUpCard';
import TriageNoteCard from './components/TriageNoteCard';
import RuleBookView from './components/RuleBookView';
import BenchmarkSuite from './components/BenchmarkSuite';
import AuditLogView from './components/AuditLogView';

import { parsePatientIntake } from './services/intakeParser';
import { getPendingFollowUps } from './services/followUpEngine';
import { evaluateTriageRules } from './services/rulesEngine';
import { runSafetyValidation } from './services/safetyValidator';
import { generateTriageNote } from './services/triageNoteGenerator';
import { PRESET_CASES } from './data/presetCases';

export default function App() {
  const [activeTab, setActiveTab] = useState('triage');
  const [activePresetId, setActivePresetId] = useState(null);
  
  // Intake & Patient State
  const [inputText, setInputText] = useState('');
  const [patientData, setPatientData] = useState(null);
  const [pendingQuestions, setPendingQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Triage & Safety Outputs
  const [triageEvaluation, setTriageEvaluation] = useState(null);
  const [safetyResult, setSafetyResult] = useState(null);
  const [triageNote, setTriageNote] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);

  // -------------------------------------------------------------
  // 1. Process Patient Initial Intake
  // -------------------------------------------------------------
  const handleAnalyzeIntake = (textToAnalyze, forcedPreset = null) => {
    const raw = textToAnalyze || inputText;
    if (!raw.trim()) return;

    // Step 1: Parse NLP Entities & Extracted Parameters
    const initialPatientState = parsePatientIntake(raw);
    setPatientData(initialPatientState);

    // Step 2: Spot Missing Critical Information & Generate Follow-ups
    const missingQuestions = getPendingFollowUps(initialPatientState);
    setPendingQuestions(missingQuestions);
    setCurrentQuestionIndex(0);

    // If there are no missing questions, evaluate immediately
    if (missingQuestions.length === 0) {
      finalizeTriage(initialPatientState);
    } else {
      // Evaluate provisional state so user can see live reasoning
      finalizeTriage(initialPatientState);
    }
  };

  // -------------------------------------------------------------
  // 2. Handle Follow-Up Question Answer
  // -------------------------------------------------------------
  const handleAnswerQuestion = (question, selectedOption) => {
    if (!patientData) return;

    const updatedSymptoms = { ...patientData.symptoms };
    const updatedSources = { ...patientData.sources };
    let updatedDuration = patientData.duration;

    if (question.field === "duration") {
      updatedDuration = selectedOption.value || "Unknown";
    } else {
      updatedSymptoms[question.field] = selectedOption.value; // boolean or null (if unknown)
      updatedSources[question.field] = "follow_up";
    }

    const updatedPatientState = {
      ...patientData,
      duration: updatedDuration,
      symptoms: updatedSymptoms,
      sources: updatedSources
    };

    setPatientData(updatedPatientState);

    // Move to next question or finish
    if (currentQuestionIndex + 1 < pendingQuestions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      finalizeTriage(updatedPatientState);
    } else {
      // Completed all follow-ups
      setPendingQuestions([]);
      finalizeTriage(updatedPatientState);
    }
  };

  // -------------------------------------------------------------
  // 3. Mark Remaining as Unknown & Evaluate (Uncertainty Path)
  // -------------------------------------------------------------
  const handleSkipAll = () => {
    if (!patientData) return;

    const updatedSymptoms = { ...patientData.symptoms };
    const updatedSources = { ...patientData.sources };

    // Explicitly set unasked fields to null (UNKNOWN)
    pendingQuestions.forEach(q => {
      if (q.field !== "duration" && updatedSymptoms[q.field] === undefined) {
        updatedSymptoms[q.field] = null;
        updatedSources[q.field] = "follow_up";
      }
    });

    const updatedPatientState = {
      ...patientData,
      symptoms: updatedSymptoms,
      sources: updatedSources
    };

    setPatientData(updatedPatientState);
    setPendingQuestions([]);
    finalizeTriage(updatedPatientState);
  };

  // -------------------------------------------------------------
  // 4. Finalize Triage, Safety Validation & Note Generation
  // -------------------------------------------------------------
  const finalizeTriage = (stateToEvaluate) => {
    const evalResult = evaluateTriageRules(stateToEvaluate);
    const safety = runSafetyValidation(stateToEvaluate, evalResult);
    const note = generateTriageNote(stateToEvaluate, evalResult, safety);

    setTriageEvaluation(evalResult);
    setSafetyResult(safety);
    setTriageNote(note);

    // Record in Audit Trail
    const logEntry = {
      timestamp: new Date().toISOString(),
      patientData: stateToEvaluate,
      triageEvaluation: evalResult,
      safetyResult: safety
    };

    setAuditLogs(prev => [logEntry, ...prev.slice(0, 49)]);
  };

  // -------------------------------------------------------------
  // 5. Select Live Demo Scenario
  // -------------------------------------------------------------
  const handleSelectPreset = (preset) => {
    setActivePresetId(preset.id);
    setInputText(preset.patientInput);
    setActiveTab('triage');

    // Run intake analysis
    const initialPatientState = parsePatientIntake(preset.patientInput);
    setPatientData(initialPatientState);

    const missing = getPendingFollowUps(initialPatientState);
    setPendingQuestions(missing);
    setCurrentQuestionIndex(0);

    finalizeTriage(initialPatientState);
  };

  // -------------------------------------------------------------
  // 6. Reset Form
  // -------------------------------------------------------------
  const handleReset = () => {
    setActivePresetId(null);
    setInputText('');
    setPatientData(null);
    setPendingQuestions([]);
    setCurrentQuestionIndex(0);
    setTriageEvaluation(null);
    setSafetyResult(null);
    setTriageNote(null);
  };

  // Initialize with Demo Case 2 on first load for immediate wow experience
  useEffect(() => {
    const defaultDemo = PRESET_CASES[1]; // Chest Pain Emergency Demo
    handleSelectPreset(defaultDemo);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        auditCount={auditLogs.length}
      />

      {/* Philosophy Callout Banner */}
      <div className="philosophy-banner">
        <div>
          <span className="philosophy-highlight">Core Clinical Safety Principle: </span>
          The AI understands everyday patient language, but deterministic rules — not the AI — make the triage decision.
        </div>
        <div style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
          Strictly Non-Diagnostic • 100% Traceable Rule Citations
        </div>
      </div>

      {/* Tab 1: Triage Console */}
      {activeTab === 'triage' && (
        <>
          {/* Preset Demos Bar */}
          <PresetBar
            activePresetId={activePresetId}
            onSelectPreset={handleSelectPreset}
          />

          {/* Main 2-Column Grid */}
          <div className="main-grid">
            {/* Left Column: Intake & Follow-ups */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <IntakeForm
                inputText={inputText}
                setInputText={setInputText}
                onAnalyze={() => handleAnalyzeIntake(inputText)}
                onReset={handleReset}
                isLoading={false}
              />

              {pendingQuestions.length > 0 && (
                <FollowUpCard
                  pendingQuestions={pendingQuestions}
                  currentQuestionIndex={currentQuestionIndex}
                  onAnswerQuestion={handleAnswerQuestion}
                  onSkipAll={handleSkipAll}
                  patientData={patientData}
                />
              )}
            </div>

            {/* Right Column: Triage Note & Safety Citations */}
            <div>
              <TriageNoteCard
                triageEvaluation={triageEvaluation}
                triageNote={triageNote}
                safetyResult={safetyResult}
                onReset={handleReset}
              />
            </div>
          </div>
        </>
      )}

      {/* Tab 2: Rule Database */}
      {activeTab === 'rules' && <RuleBookView />}

      {/* Tab 3: Benchmark Suite */}
      {activeTab === 'benchmark' && <BenchmarkSuite />}

      {/* Tab 4: Audit Logs */}
      {activeTab === 'audit' && (
        <AuditLogView
          auditLogs={auditLogs}
          onClearLogs={() => setAuditLogs([])}
        />
      )}
    </div>
  );
}
