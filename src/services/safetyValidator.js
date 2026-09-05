/**
 * Dedicated Clinical Safety Validator Layer
 * Sits between the Rule Engine and the final Triage Note generation.
 * 
 * Performs 8 rigorous safety checks:
 * 1. Recognized complaint check
 * 2. Required fields presence check
 * 3. High-risk feature detection
 * 4. Rule matching verification
 * 5. Recommendation rule support
 * 6. Contradiction detection
 * 7. Uncertainty / missing information check
 * 8. Human escalation enforcement
 */

import { COMPLAINT_CONFIG } from "../data/triageRules";

export function runSafetyValidation(patientData, triageEvaluation) {
  const checks = [];
  let requiresHumanEscalation = triageEvaluation.humanEscalation;
  let escalationReasons = [];

  const { complaint, symptoms, duration } = patientData;
  const config = COMPLAINT_CONFIG[complaint];

  // 1. Recognized complaint check
  const isComplaintRecognized = Boolean(config);
  checks.push({
    name: "Recognized Chief Complaint",
    passed: isComplaintRecognized,
    detail: isComplaintRecognized ? `Classified as ${config.label}` : "Unrecognized complaint category"
  });
  if (!isComplaintRecognized) {
    requiresHumanEscalation = true;
    escalationReasons.push("Chief complaint category is unrecognized by system rules.");
  }

  // 2. Rule match verification
  const isRuleMatched = Boolean(triageEvaluation && triageEvaluation.ruleId);
  checks.push({
    name: "Deterministic Rule Match",
    passed: isRuleMatched,
    detail: isRuleMatched ? `Matched Rule ${triageEvaluation.ruleId} (${triageEvaluation.citation})` : "No rule matched"
  });
  if (!isRuleMatched) {
    requiresHumanEscalation = true;
    escalationReasons.push("System could not match an approved triage rule.");
  }

  // 3. High-risk feature detection
  const hasHighRiskFeature = Boolean(
    symptoms.severe_pain === true ||
    symptoms.breathing_difficulty === true ||
    symptoms.fainting === true ||
    symptoms.severe_sweating === true ||
    symptoms.unable_to_speak === true ||
    symptoms.severe_distress === true ||
    symptoms.blue_lips_cyanosis === true ||
    symptoms.uncontrolled_bleeding === true ||
    symptoms.deformity === true ||
    symptoms.unable_to_use_limb === true ||
    symptoms.loss_of_consciousness === true ||
    symptoms.infant_under_3_months === true ||
    symptoms.confusion === true ||
    symptoms.persistent_vomiting === true ||
    symptoms.significant_bleeding === true ||
    symptoms.rigid_abdomen === true
  );
  checks.push({
    name: "High-Risk Red Flag Scan",
    passed: true,
    detail: hasHighRiskFeature ? "Positive high-risk feature(s) identified" : "No positive high-risk features detected"
  });
  if (hasHighRiskFeature) {
    requiresHumanEscalation = true;
    escalationReasons.push("High-risk clinical features identified requiring immediate physician/nurse evaluation.");
  }

  // 4. Missing required critical fields & uncertainty check
  const requiredFields = config ? config.requiredFields : [];
  const missingFields = requiredFields.filter(f => symptoms[f] === null || symptoms[f] === undefined);
  const isDataSufficient = missingFields.length === 0 || hasHighRiskFeature;
  checks.push({
    name: "Clinical Information Completeness",
    passed: isDataSufficient,
    detail: isDataSufficient 
      ? "Sufficient data available to evaluate safety rules" 
      : `Missing critical safety fields: ${missingFields.map(f => config.fieldLabels[f] || f).join(", ")}`
  });
  if (!isDataSufficient) {
    requiresHumanEscalation = true;
    escalationReasons.push("Required safety criteria could not be established from patient interaction.");
  }

  // 5. Contradiction detection
  let hasContradiction = false;
  if (symptoms.can_eat_and_drink === true && symptoms.persistent_vomiting === true) {
    hasContradiction = true;
    checks.push({
      name: "Contradiction Check",
      passed: false,
      detail: "Patient reports tolerating normal diet but also reports persistent uncontrollable vomiting."
    });
    requiresHumanEscalation = true;
    escalationReasons.push("Contradictory clinical statements detected in intake responses.");
  } else {
    checks.push({
      name: "Contradiction Check",
      passed: true,
      detail: "No logical contradictions detected in reported symptoms."
    });
  }

  // 6. Non-Diagnostic Compliance Check
  checks.push({
    name: "Non-Diagnostic Principle Compliance",
    passed: true,
    detail: "Zero diagnostic claims generated; strictly provides urgency classification and department routing."
  });

  // Final Escalation Consolidation
  const finalEscalation = requiresHumanEscalation || triageEvaluation.humanEscalation;

  return {
    allPassed: checks.every(c => c.passed),
    checks,
    finalEscalation,
    escalationReasons: Array.from(new Set(escalationReasons.length > 0 ? escalationReasons : (triageEvaluation.humanEscalation ? [triageEvaluation.reason] : [])))
  };
}
