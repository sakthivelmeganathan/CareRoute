/**
 * Deterministic Clinical Triage Rules Engine
 * 
 * Rules are stored in structured form.
 * The system never diagnoses diseases; it evaluates acuity and routing based on explicit triage rules.
 * 
 * Core Safety Rule: unknown !== false
 * If information is insufficient to rule out a high-risk condition, the case escalates to a human.
 */

import { TRIAGE_RULES, COMPLAINT_CONFIG } from "../data/triageRules";

export function evaluateTriageRules(patientData) {
  const { complaint, symptoms } = patientData;

  // 1. Check for explicit missing/unknown data that prevents safe routing
  const complaintConfig = COMPLAINT_CONFIG[complaint];
  const requiredFields = complaintConfig ? complaintConfig.requiredFields : [];

  // -------------------------------------------------------------
  // RULE EVALUATION: CHEST PAIN
  // -------------------------------------------------------------
  if (complaint === "chest_pain") {
    // High-risk trigger conditions: severe_pain, breathing_difficulty, fainting, severe_sweating, radiating_pain
    const hasEmergencyFlag = 
      symptoms.severe_pain === true ||
      symptoms.breathing_difficulty === true ||
      symptoms.fainting === true ||
      symptoms.severe_sweating === true ||
      symptoms.radiating_pain === true;

    if (hasEmergencyFlag) {
      const rule = TRIAGE_RULES.find(r => r.ruleId === "CP-01");
      const matchedFactors = [];
      if (symptoms.severe_pain === true) matchedFactors.push("severe/crushing pain");
      if (symptoms.breathing_difficulty === true) matchedFactors.push("associated breathing difficulty");
      if (symptoms.fainting === true) matchedFactors.push("fainting / near-syncope");
      if (symptoms.severe_sweating === true) matchedFactors.push("profuse diaphoresis / cold sweat");
      if (symptoms.radiating_pain === true) matchedFactors.push("radiating pain to jaw/arm/back");

      return {
        matchedRule: rule,
        ruleId: rule.ruleId,
        urgency: rule.urgency,
        urgencyLevel: rule.urgencyLevel,
        urgencyColor: rule.urgencyColor,
        department: rule.department,
        humanEscalation: rule.human_escalation,
        reason: `Patient reports chest pain with high-risk clinical features (${matchedFactors.join(", ")}). Meets high-risk emergency criteria defined by rule CP-01.`,
        citation: rule.citation,
        matchedConditions: matchedFactors,
        isUncertain: false
      };
    }

    // Check if any critical field is still unknown/null
    const hasUnknowns = requiredFields.some(field => symptoms[field] === null || symptoms[field] === undefined);
    if (hasUnknowns) {
      const unknownRule = TRIAGE_RULES.find(r => r.ruleId === "ESC-UNCERTAIN");
      return {
        matchedRule: unknownRule,
        ruleId: unknownRule.ruleId,
        urgency: unknownRule.urgency,
        urgencyLevel: unknownRule.urgencyLevel,
        urgencyColor: unknownRule.urgencyColor,
        department: unknownRule.department,
        humanEscalation: true,
        reason: "Required critical chest pain parameters could not be established or remain unknown. Missing safety criteria cannot be assumed negative. Case is escalated for immediate human clinician evaluation.",
        citation: unknownRule.citation,
        matchedConditions: ["Critical clinical parameters unknown"],
        isUncertain: true
      };
    }

    // All red flags explicitly FALSE -> Low-risk localized chest discomfort
    if (
      symptoms.severe_pain === false &&
      symptoms.breathing_difficulty === false &&
      symptoms.fainting === false &&
      symptoms.severe_sweating === false
    ) {
      const rule = TRIAGE_RULES.find(r => r.ruleId === "CP-02");
      return {
        matchedRule: rule,
        ruleId: rule.ruleId,
        urgency: rule.urgency,
        urgencyLevel: rule.urgencyLevel,
        urgencyColor: rule.urgencyColor,
        department: rule.department,
        humanEscalation: rule.human_escalation,
        reason: "Localized chest discomfort confirmed without high-risk red flags (no dyspnea, syncope, diaphoresis, or radiation; mild-moderate intensity). Meets priority criteria defined by rule CP-02.",
        citation: rule.citation,
        matchedConditions: ["Absence of all cardiac red flags", "Mild/moderate severity"],
        isUncertain: false
      };
    }
  }

  // -------------------------------------------------------------
  // RULE EVALUATION: BREATHING DIFFICULTY
  // -------------------------------------------------------------
  if (complaint === "breathing_difficulty") {
    const hasEmergencyFlag = 
      symptoms.unable_to_speak === true ||
      symptoms.severe_distress === true ||
      symptoms.blue_lips_cyanosis === true ||
      symptoms.stridor === true ||
      symptoms.severe_pain === true;

    if (hasEmergencyFlag) {
      const rule = TRIAGE_RULES.find(r => r.ruleId === "BD-01");
      const matchedFactors = [];
      if (symptoms.unable_to_speak === true) matchedFactors.push("inability to speak in full sentences");
      if (symptoms.severe_distress === true) matchedFactors.push("severe respiratory distress");
      if (symptoms.blue_lips_cyanosis === true) matchedFactors.push("cyanosis on lips/nails");
      if (symptoms.stridor === true) matchedFactors.push("audible stridor / wheezing");

      return {
        matchedRule: rule,
        ruleId: rule.ruleId,
        urgency: rule.urgency,
        urgencyLevel: rule.urgencyLevel,
        urgencyColor: rule.urgencyColor,
        department: rule.department,
        humanEscalation: rule.human_escalation,
        reason: `Patient reports breathing difficulty with critical signs (${matchedFactors.join(", ")}). Meets acute respiratory emergency criteria defined by rule BD-01.`,
        citation: rule.citation,
        matchedConditions: matchedFactors,
        isUncertain: false
      };
    }

    const hasUnknowns = requiredFields.some(field => symptoms[field] === null || symptoms[field] === undefined);
    if (hasUnknowns) {
      const unknownRule = TRIAGE_RULES.find(r => r.ruleId === "ESC-UNCERTAIN");
      return {
        matchedRule: unknownRule,
        ruleId: unknownRule.ruleId,
        urgency: unknownRule.urgency,
        urgencyLevel: unknownRule.urgencyLevel,
        urgencyColor: unknownRule.urgencyColor,
        department: unknownRule.department,
        humanEscalation: true,
        reason: "Breathing difficulty reported, but critical airway/oxygenation variables remain unconfirmed. Immediate triage nurse review required.",
        citation: unknownRule.citation,
        matchedConditions: ["Incomplete respiratory assessment"],
        isUncertain: true
      };
    }

    // Stable breathing discomfort
    const rule = TRIAGE_RULES.find(r => r.ruleId === "BD-02");
    return {
      matchedRule: rule,
      ruleId: rule.ruleId,
      urgency: rule.urgency,
      urgencyLevel: rule.urgencyLevel,
      urgencyColor: rule.urgencyColor,
      department: rule.department,
      humanEscalation: rule.human_escalation,
      reason: "Patient reports breathing discomfort but is able to speak and not in acute cyanotic distress. Meets urgent assessment criteria defined by rule BD-02.",
      citation: rule.citation,
      matchedConditions: ["Speech intact", "No cyanosis", "Moderate distress"],
      isUncertain: false
    };
  }

  // -------------------------------------------------------------
  // RULE EVALUATION: INJURY / TRAUMA
  // -------------------------------------------------------------
  if (complaint === "injury") {
    const hasEmergencyFlag = 
      symptoms.uncontrolled_bleeding === true ||
      symptoms.loss_of_consciousness === true ||
      symptoms.unable_to_use_limb === true ||
      symptoms.deformity === true ||
      symptoms.severe_pain === true;

    if (hasEmergencyFlag) {
      const rule = TRIAGE_RULES.find(r => r.ruleId === "INJ-01");
      const matchedFactors = [];
      if (symptoms.deformity === true) matchedFactors.push("visible limb deformity");
      if (symptoms.unable_to_use_limb === true) matchedFactors.push("inability to move limb or bear weight");
      if (symptoms.uncontrolled_bleeding === true) matchedFactors.push("uncontrolled bleeding");
      if (symptoms.loss_of_consciousness === true) matchedFactors.push("loss of consciousness / head injury");
      if (symptoms.severe_pain === true) matchedFactors.push("severe trauma pain");

      return {
        matchedRule: rule,
        ruleId: rule.ruleId,
        urgency: rule.urgency,
        urgencyLevel: rule.urgencyLevel,
        urgencyColor: rule.urgencyColor,
        department: rule.department,
        humanEscalation: rule.human_escalation,
        reason: `Patient reports injury with high-risk structural or neurovascular features (${matchedFactors.join(", ")}). Meets urgent trauma criteria defined by rule INJ-01.`,
        citation: rule.citation,
        matchedConditions: matchedFactors,
        isUncertain: false
      };
    }

    const hasUnknowns = requiredFields.some(field => symptoms[field] === null || symptoms[field] === undefined);
    if (hasUnknowns) {
      const unknownRule = TRIAGE_RULES.find(r => r.ruleId === "ESC-UNCERTAIN");
      return {
        matchedRule: unknownRule,
        ruleId: unknownRule.ruleId,
        urgency: unknownRule.urgency,
        urgencyLevel: unknownRule.urgencyLevel,
        urgencyColor: unknownRule.urgencyColor,
        department: unknownRule.department,
        humanEscalation: true,
        reason: "Injury reported but deformity, neurovascular mobility, or bleeding control could not be confirmed. Escalated for human nurse inspection.",
        citation: unknownRule.citation,
        matchedConditions: ["Trauma severity parameters unknown"],
        isUncertain: true
      };
    }

    // Minor superficial injury
    const rule = TRIAGE_RULES.find(r => r.ruleId === "INJ-02");
    return {
      matchedRule: rule,
      ruleId: rule.ruleId,
      urgency: rule.urgency,
      urgencyLevel: rule.urgencyLevel,
      urgencyColor: rule.urgencyColor,
      department: rule.department,
      humanEscalation: rule.human_escalation,
      reason: "Minor isolated injury without deformity, controlled bleeding, intact mobility, and no neurological compromise. Meets routine criteria defined by rule INJ-02.",
      citation: rule.citation,
      matchedConditions: ["No deformity", "Mobility preserved", "Bleeding controlled"],
      isUncertain: false
    };
  }

  // -------------------------------------------------------------
  // RULE EVALUATION: FEVER & INFECTION
  // -------------------------------------------------------------
  if (complaint === "fever") {
    const hasEmergencyFlag = 
      symptoms.severe_deterioration === true ||
      symptoms.confusion === true ||
      symptoms.breathing_difficulty === true ||
      symptoms.infant_under_3_months === true ||
      symptoms.stiff_neck === true ||
      symptoms.can_eat_and_drink === false;

    if (hasEmergencyFlag) {
      const rule = TRIAGE_RULES.find(r => r.ruleId === "FEVER-01");
      const matchedFactors = [];
      if (symptoms.infant_under_3_months === true) matchedFactors.push("infant < 3 months old");
      if (symptoms.confusion === true) matchedFactors.push("altered mental status / confusion");
      if (symptoms.severe_deterioration === true) matchedFactors.push("severe systemic lethargy / deterioration");
      if (symptoms.breathing_difficulty === true) matchedFactors.push("associated respiratory distress");
      if (symptoms.stiff_neck === true) matchedFactors.push("meningeal signs / stiff neck");
      if (symptoms.can_eat_and_drink === false) matchedFactors.push("inability to tolerate oral fluids / dehydration");

      return {
        matchedRule: rule,
        ruleId: rule.ruleId,
        urgency: rule.urgency,
        urgencyLevel: rule.urgencyLevel,
        urgencyColor: rule.urgencyColor,
        department: rule.department,
        humanEscalation: rule.human_escalation,
        reason: `Patient reports fever accompanied by systemic red flags (${matchedFactors.join(", ")}). Meets high-risk infection criteria defined by rule FEVER-01.`,
        citation: rule.citation,
        matchedConditions: matchedFactors,
        isUncertain: false
      };
    }

    const hasUnknowns = requiredFields.some(field => symptoms[field] === null || symptoms[field] === undefined);
    if (hasUnknowns) {
      const unknownRule = TRIAGE_RULES.find(r => r.ruleId === "ESC-UNCERTAIN");
      return {
        matchedRule: unknownRule,
        ruleId: unknownRule.ruleId,
        urgency: unknownRule.urgency,
        urgencyLevel: unknownRule.urgencyLevel,
        urgencyColor: unknownRule.urgencyColor,
        department: unknownRule.department,
        humanEscalation: true,
        reason: "Fever reported but patient age, hydration tolerance, or alertness status could not be verified. Escalated to prevent missing occult sepsis.",
        citation: unknownRule.citation,
        matchedConditions: ["Fever risk parameters unknown"],
        isUncertain: true
      };
    }

    // Isolated uncomplicated fever
    const rule = TRIAGE_RULES.find(r => r.ruleId === "FEVER-02");
    return {
      matchedRule: rule,
      ruleId: rule.ruleId,
      urgency: rule.urgency,
      urgencyLevel: rule.urgencyLevel,
      urgencyColor: rule.urgencyColor,
      department: rule.department,
      humanEscalation: rule.human_escalation,
      reason: "Patient reports isolated fever with normal fluid intake, clear alertness, and absence of systemic red flags. Meets routine criteria defined by rule FEVER-02.",
      citation: rule.citation,
      matchedConditions: ["Normal hydration tolerance", "Alert & oriented", "No respiratory or meningeal signs"],
      isUncertain: false
    };
  }

  // -------------------------------------------------------------
  // RULE EVALUATION: ABDOMINAL PAIN
  // -------------------------------------------------------------
  if (complaint === "abdominal_pain") {
    const hasEmergencyFlag = 
      symptoms.severe_pain === true ||
      symptoms.fainting === true ||
      symptoms.persistent_vomiting === true ||
      symptoms.significant_bleeding === true ||
      symptoms.rigid_abdomen === true;

    if (hasEmergencyFlag) {
      const rule = TRIAGE_RULES.find(r => r.ruleId === "ABD-01");
      const matchedFactors = [];
      if (symptoms.severe_pain === true) matchedFactors.push("severe pain intensity (≥ 7/10)");
      if (symptoms.fainting === true) matchedFactors.push("syncope / severe postural dizziness");
      if (symptoms.persistent_vomiting === true) matchedFactors.push("persistent vomiting");
      if (symptoms.significant_bleeding === true) matchedFactors.push("GI bleeding");
      if (symptoms.rigid_abdomen === true) matchedFactors.push("peritoneal rigidity");

      return {
        matchedRule: rule,
        ruleId: rule.ruleId,
        urgency: rule.urgency,
        urgencyLevel: rule.urgencyLevel,
        urgencyColor: rule.urgencyColor,
        department: rule.department,
        humanEscalation: rule.human_escalation,
        reason: `Patient reports abdominal pain with alarming surgical features (${matchedFactors.join(", ")}). Meets acute abdominal criteria defined by rule ABD-01.`,
        citation: rule.citation,
        matchedConditions: matchedFactors,
        isUncertain: false
      };
    }

    const hasUnknowns = requiredFields.some(field => symptoms[field] === null || symptoms[field] === undefined);
    if (hasUnknowns) {
      const unknownRule = TRIAGE_RULES.find(r => r.ruleId === "ESC-UNCERTAIN");
      return {
        matchedRule: unknownRule,
        ruleId: unknownRule.ruleId,
        urgency: unknownRule.urgency,
        urgencyLevel: unknownRule.urgencyLevel,
        urgencyColor: unknownRule.urgencyColor,
        department: unknownRule.department,
        humanEscalation: true,
        reason: "Abdominal pain reported, but critical surgical red flags (syncope, bleeding, persistent emesis, rigidity) remain unconfirmed. The system refuses to assume negative and escalates to a human clinician.",
        citation: unknownRule.citation,
        matchedConditions: ["Surgical red flags unconfirmed"],
        isUncertain: true
      };
    }

    // Mild uncomplicated abdominal discomfort
    const rule = TRIAGE_RULES.find(r => r.ruleId === "ABD-02");
    return {
      matchedRule: rule,
      ruleId: rule.ruleId,
      urgency: rule.urgency,
      urgencyLevel: rule.urgencyLevel,
      urgencyColor: rule.urgencyColor,
      department: rule.department,
      humanEscalation: rule.human_escalation,
      reason: "Patient reports mild-to-moderate abdominal cramping without red flags (no syncope, persistent emesis, bleeding, or rigidity). Meets routine criteria defined by rule ABD-02.",
      citation: rule.citation,
      matchedConditions: ["Mild severity", "No vomiting/bleeding", "No syncope"],
      isUncertain: false
    };
  }

  // Fallback if complaint unknown
  const fallbackRule = TRIAGE_RULES.find(r => r.ruleId === "ESC-UNCERTAIN");
  return {
    matchedRule: fallbackRule,
    ruleId: fallbackRule.ruleId,
    urgency: fallbackRule.urgency,
    urgencyLevel: fallbackRule.urgencyLevel,
    urgencyColor: fallbackRule.urgencyColor,
    department: fallbackRule.department,
    humanEscalation: true,
    reason: "Chief complaint does not match recognized triage rule set or contains multi-system ambiguity. Mandatory escalation to Senior Triage Nurse.",
    citation: fallbackRule.citation,
    matchedConditions: ["Unrecognized or ambiguous complaint"],
    isUncertain: true
  };
}
