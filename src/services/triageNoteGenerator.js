/**
 * Clinical Triage Note Generator
 * Produces structured, auditable, and traceable clinical triage notes.
 * 
 * Complies strictly with the 3 evidence partitions:
 * 1. PATIENT-REPORTED INFORMATION
 * 2. FOLLOW-UP ESTABLISHED
 * 3. REMAINING UNKNOWN
 */

import { COMPLAINT_CONFIG } from "../data/triageRules";

export function generateTriageNote(patientData, triageEvaluation, safetyResult) {
  const { complaint, symptoms, sources, duration, severityRating, rawText, patientReportedStatements } = patientData;
  const config = COMPLAINT_CONFIG[complaint] || { label: "General Medical", fieldLabels: {} };

  // -------------------------------------------------------------
  // 1. PATIENT-REPORTED INFORMATION
  // -------------------------------------------------------------
  const patientReported = [];
  if (rawText) {
    patientReported.push(`Initial description: "${rawText}"`);
  }
  if (duration && duration !== "Unknown") {
    patientReported.push(`Onset / Duration: ${duration}`);
  }
  if (severityRating !== null && sources.severe_pain === "patient") {
    patientReported.push(`Reported pain severity: ${severityRating}/10`);
  }

  // Any symptoms detected directly from patient text
  for (const [key, val] of Object.entries(symptoms)) {
    if (sources[key] === "patient" && key !== "severe_pain") {
      const label = config.fieldLabels[key] || key.replace(/_/g, " ");
      patientReported.push(`${label}: ${val ? "Yes" : "No"}`);
    }
  }

  if (patientReported.length === 0) {
    patientReported.push("No specific symptom parameters detected in initial statement.");
  }

  // -------------------------------------------------------------
  // 2. FOLLOW-UP ESTABLISHED
  // -------------------------------------------------------------
  const followUpEstablished = [];
  for (const [key, val] of Object.entries(symptoms)) {
    if (sources[key] === "follow_up" && val !== null && val !== undefined) {
      const label = config.fieldLabels[key] || key.replace(/_/g, " ");
      if (typeof val === "boolean") {
        followUpEstablished.push(`${label}: ${val ? "Yes (Confirmed)" : "No (Denied)"}`);
      } else {
        followUpEstablished.push(`${label}: ${val}`);
      }
    }
  }

  if (followUpEstablished.length === 0) {
    followUpEstablished.push("No additional parameters established via follow-up.");
  }

  // -------------------------------------------------------------
  // 3. REMAINING UNKNOWN (Crucial Safety Transparency)
  // -------------------------------------------------------------
  const remainingUnknown = [];
  const requiredFields = config.requiredFields || [];

  for (const field of requiredFields) {
    if (symptoms[field] === null || symptoms[field] === undefined) {
      const label = config.fieldLabels[field] || field.replace(/_/g, " ");
      remainingUnknown.push(`${label}: Unknown / Unanswered`);
    }
  }

  // Standard clinical context unknowns
  remainingUnknown.push("Vital signs (Blood pressure, Heart rate, SpO2, Temp): Pending triage desk measurement");
  remainingUnknown.push("Past medical / cardiac history: Unverified");
  remainingUnknown.push("Current medications & allergy list: Pending clinical review");

  // -------------------------------------------------------------
  // 4. FORMAT PLAIN TEXT TRIAGE NOTE
  // -------------------------------------------------------------
  const plainTextNote = `--------------------------------------------------
PATIENT INTAKE TRIAGE NOTE
Track ID: PS01 | System: CareRoute AI
Timestamp: ${new Date().toLocaleString()}
--------------------------------------------------

Chief Complaint:
${config.label}

Recommended Urgency:
${triageEvaluation.urgency}

Recommended Department:
${triageEvaluation.department}

Rule Applied:
${triageEvaluation.citation} - ${triageEvaluation.matchedRule ? triageEvaluation.matchedRule.ruleName : ""}

Reason:
${triageEvaluation.reason}

PATIENT-REPORTED INFORMATION:
${patientReported.map(item => `• ${item}`).join("\n")}

FOLLOW-UP ESTABLISHED:
${followUpEstablished.map(item => `• ${item}`).join("\n")}

REMAINING UNKNOWN:
${remainingUnknown.map(item => `• ${item}`).join("\n")}

AI LIMITATION:
This is a triage acuity recommendation and routing guide, NOT a medical diagnosis. All patients require qualified clinical evaluation.

HUMAN ESCALATION:
${safetyResult.finalEscalation ? "YES" : "NO"}

Reason for escalation:
${safetyResult.finalEscalation ? safetyResult.escalationReasons.join("; ") : "N/A - Standard clinical pathway applies."}
--------------------------------------------------`;

  // -------------------------------------------------------------
  // 5. STRUCTURED FHIR-COMPATIBLE JSON OBJECT
  // -------------------------------------------------------------
  const fhirPayload = {
    resourceType: "ClinicalImpression",
    identifier: [
      {
        system: "urn:careroute:triage:ps01",
        value: `TRIAGE-${Date.now()}`
      }
    ],
    status: "in-progress",
    effectiveDateTime: new Date().toISOString(),
    protocol: [
      {
        ruleId: triageEvaluation.ruleId,
        citation: triageEvaluation.citation,
        name: triageEvaluation.matchedRule ? triageEvaluation.matchedRule.ruleName : ""
      }
    ],
    urgencyLevel: triageEvaluation.urgencyLevel,
    urgencyClassification: triageEvaluation.urgency,
    recommendedLocation: {
      display: triageEvaluation.department
    },
    humanEscalationRequired: safetyResult.finalEscalation,
    escalationRationale: safetyResult.escalationReasons,
    evidenceBreakdown: {
      patientReported,
      followUpEstablished,
      remainingUnknown
    },
    internalPatientState: {
      complaint: patientData.complaint,
      symptoms: patientData.symptoms,
      duration: patientData.duration,
      sources: patientData.sources
    },
    disclaimer: "Non-diagnostic triage decision support. Cites deterministic rule guidelines."
  };

  return {
    plainText: plainTextNote,
    fhirPayload,
    patientReported,
    followUpEstablished,
    remainingUnknown
  };
}
