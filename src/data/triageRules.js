/**
 * Predefined Deterministic Clinical Triage Rules Database
 * Track ID: PS01 - Patient Intake Triage Assistant
 * 
 * Rules are deterministic, auditable, and cite-able.
 * System never diagnoses disease; it evaluates acuity and routing.
 */

export const TRIAGE_RULES = [
  // -------------------------------------------------------------
  // 1. CHEST PAIN RULES
  // -------------------------------------------------------------
  {
    ruleId: "CP-01",
    complaint: "chest_pain",
    ruleName: "Chest Pain with High-Risk Features",
    urgency: "EMERGENCY",
    urgencyLevel: 1,
    urgencyColor: "#EF4444",
    department: "Emergency Department - Acute Resuscitation / Cardiac Bay",
    human_escalation: true,
    conditions: [
      "chest_pain == true",
      "(severe_pain == true OR breathing_difficulty == true OR fainting == true OR severe_sweating == true OR radiating_pain == true)"
    ],
    reason: "Patient reports chest pain with high-risk clinical features (severe pressure, radiating discomfort, respiratory distress, diaphoresis, or syncope). This meets the immediate emergent triage criteria defined by rule CP-01 for immediate acute monitoring.",
    citation: "CP-01",
    requiredFields: ["chest_pain", "breathing_difficulty", "fainting", "severe_sweating", "severity"],
    clinicalRationale: "Acuity Level 1/2. Non-diagnostic escalation for potential acute coronary or cardiopulmonary compromise requiring immediate 12-lead ECG and physician evaluation."
  },
  {
    ruleId: "CP-02",
    complaint: "chest_pain",
    ruleName: "Atypical / Low-Risk Localized Chest Discomfort",
    urgency: "PRIORITY",
    urgencyLevel: 3,
    urgencyColor: "#F59E0B",
    department: "Rapid Medical Assessment / Urgent Care Clinic",
    human_escalation: false,
    conditions: [
      "chest_pain == true",
      "breathing_difficulty == false",
      "fainting == false",
      "severe_sweating == false",
      "radiating_pain == false",
      "severe_pain == false"
    ],
    reason: "Patient reports localized or mild chest discomfort without high-risk features (no breathing distress, no fainting, no sweating, no radiation, mild-to-moderate severity). Requires prompt medical evaluation but without immediate resuscitation bay mobilization.",
    citation: "CP-02",
    requiredFields: ["chest_pain", "breathing_difficulty", "fainting", "severe_sweating", "severity"],
    clinicalRationale: "Acuity Level 3. Priority evaluation to rule out cardiac/pulmonary etiologies and evaluate musculoskeletal or localized causes."
  },

  // -------------------------------------------------------------
  // 2. BREATHING DIFFICULTY RULES
  // -------------------------------------------------------------
  {
    ruleId: "BD-01",
    complaint: "breathing_difficulty",
    ruleName: "Severe Respiratory Distress / Speech Inability",
    urgency: "EMERGENCY",
    urgencyLevel: 1,
    urgencyColor: "#EF4444",
    department: "Emergency Department - Acute Respiratory Bay",
    human_escalation: true,
    conditions: [
      "breathing_difficulty == true",
      "(unable_to_speak == true OR severe_distress == true OR blue_lips_cyanosis == true OR stridor == true OR severe_pain == true)"
    ],
    reason: "Patient reports breathing difficulty with inability to speak in full sentences, cyanosis, stridor, or severe distress. Immediate emergent airway and oxygenation support is required under rule BD-01.",
    citation: "BD-01",
    requiredFields: ["breathing_difficulty", "unable_to_speak", "severe_distress", "blue_lips_cyanosis"],
    clinicalRationale: "Acuity Level 1. Critical airway/breathing impairment requiring immediate supplemental oxygen, SpO2 monitoring, and respiratory intervention."
  },
  {
    ruleId: "BD-02",
    complaint: "breathing_difficulty",
    ruleName: "Moderate / Stable Breathing Discomfort",
    urgency: "URGENT",
    urgencyLevel: 2,
    urgencyColor: "#F97316",
    department: "Emergency / Rapid Respiratory Assessment",
    human_escalation: true,
    conditions: [
      "breathing_difficulty == true",
      "unable_to_speak == false",
      "blue_lips_cyanosis == false",
      "severe_distress == false"
    ],
    reason: "Patient reports breathing discomfort but can speak and is not in imminent asphyxia. Prompt clinical assessment and pulse oximetry are required under rule BD-02.",
    citation: "BD-02",
    requiredFields: ["breathing_difficulty", "unable_to_speak", "severe_distress", "blue_lips_cyanosis"],
    clinicalRationale: "Acuity Level 2/3. Urgent assessment for bronchospasm, asthma flare, or lower respiratory infection."
  },

  // -------------------------------------------------------------
  // 3. INJURY & TRAUMA RULES
  // -------------------------------------------------------------
  {
    ruleId: "INJ-01",
    complaint: "injury",
    ruleName: "High-Risk Injury with Neurovascular / Structural Compromise",
    urgency: "URGENT",
    urgencyLevel: 2,
    urgencyColor: "#EF4444",
    department: "Emergency Department - Trauma / Orthopedic Bay",
    human_escalation: true,
    conditions: [
      "injury == true",
      "(uncontrolled_bleeding == true OR loss_of_consciousness == true OR unable_to_use_limb == true OR deformity == true OR severe_pain == true)"
    ],
    reason: "Patient reports injury accompanied by high-risk indicators: severe deformity, uncontrolled bleeding, loss of consciousness, severe pain, or inability to bear weight / use the injured limb. Meets rule INJ-01 criteria.",
    citation: "INJ-01",
    requiredFields: ["injury", "uncontrolled_bleeding", "loss_of_consciousness", "unable_to_use_limb", "deformity"],
    clinicalRationale: "Acuity Level 2. Potential fracture, dislocation, active hemorrhage, or traumatic brain injury requiring imaging and surgical/orthopedic stabilization."
  },
  {
    ruleId: "INJ-02",
    complaint: "injury",
    ruleName: "Minor Superficial Injury / Contusion",
    urgency: "ROUTINE",
    urgencyLevel: 4,
    urgencyColor: "#10B981",
    department: "Minor Injuries Unit / Fast-Track Walk-in Clinic",
    human_escalation: false,
    conditions: [
      "injury == true",
      "uncontrolled_bleeding == false",
      "loss_of_consciousness == false",
      "unable_to_use_limb == false",
      "deformity == false",
      "severe_pain == false"
    ],
    reason: "Patient reports minor isolated trauma without deformity, bleeding is controlled, full range of motion intact, and no neurological symptoms. Meets rule INJ-02.",
    citation: "INJ-02",
    requiredFields: ["injury", "uncontrolled_bleeding", "loss_of_consciousness", "unable_to_use_limb", "deformity"],
    clinicalRationale: "Acuity Level 4/5. Minor wound management, simple dressing, or superficial contusion care."
  },

  // -------------------------------------------------------------
  // 4. FEVER & INFECTION RULES
  // -------------------------------------------------------------
  {
    ruleId: "FEVER-01",
    complaint: "fever",
    ruleName: "Fever with Systemic Deterioration or High-Risk Host",
    urgency: "EMERGENCY",
    urgencyLevel: 1,
    urgencyColor: "#EF4444",
    department: "Emergency Department - Acute Medical / Pediatric Emergency",
    human_escalation: true,
    conditions: [
      "fever == true",
      "(severe_deterioration == true OR confusion == true OR breathing_difficulty == true OR infant_under_3_months == true OR stiff_neck == true OR non_blanching_rash == true)"
    ],
    reason: "Patient reports fever accompanied by systemic red flags (altered mental status/confusion, respiratory compromise, stiff neck/meningismus, or neonate/infant < 3 months). Meets emergency criteria under rule FEVER-01.",
    citation: "FEVER-01",
    requiredFields: ["fever", "severe_deterioration", "confusion", "breathing_difficulty", "infant_under_3_months"],
    clinicalRationale: "Acuity Level 1/2. Rule-out sepsis, meningitis, or severe pediatric systemic infection requiring emergent blood cultures, IV access, and physician evaluation."
  },
  {
    ruleId: "FEVER-02",
    complaint: "fever",
    ruleName: "Isolated Fever without Red Flags (Hydrated & Alert)",
    urgency: "ROUTINE",
    urgencyLevel: 4,
    urgencyColor: "#10B981",
    department: "General Medicine / Outpatient Care Clinic",
    human_escalation: false,
    conditions: [
      "fever == true",
      "severe_deterioration == false",
      "confusion == false",
      "breathing_difficulty == false",
      "infant_under_3_months == false",
      "stiff_neck == false",
      "can_eat_and_drink == true"
    ],
    reason: "Patient reports fever but maintains normal oral intake, no neurological symptoms, normal breathing, and no high-risk systemic deterioration. Meets routine criteria under rule FEVER-02.",
    citation: "FEVER-02",
    requiredFields: ["fever", "severe_deterioration", "confusion", "breathing_difficulty", "can_eat_and_drink"],
    clinicalRationale: "Acuity Level 4. Likely uncomplicated viral or localized infection suitable for outpatient assessment and supportive care."
  },

  // -------------------------------------------------------------
  // 5. ABDOMINAL PAIN RULES
  // -------------------------------------------------------------
  {
    ruleId: "ABD-01",
    complaint: "abdominal_pain",
    ruleName: "Acute Abdomen with High-Risk Features",
    urgency: "URGENT",
    urgencyLevel: 2,
    urgencyColor: "#EF4444",
    department: "Emergency Department - Acute Surgical Assessment",
    human_escalation: true,
    conditions: [
      "abdominal_pain == true",
      "(severe_pain == true OR fainting == true OR persistent_vomiting == true OR significant_bleeding == true OR rigid_abdomen == true)"
    ],
    reason: "Patient reports abdominal pain with alarming features (severe pain intensity, syncope/fainting, persistent vomiting, GI bleeding, or peritoneal rigidity). Meets high-risk criteria under rule ABD-01.",
    citation: "ABD-01",
    requiredFields: ["abdominal_pain", "severe_pain", "fainting", "persistent_vomiting", "significant_bleeding"],
    clinicalRationale: "Acuity Level 2. Potential acute surgical abdomen (e.g. appendicitis, perforation, ectopic pregnancy, acute GI bleed) requiring urgent imaging and surgical consultation."
  },
  {
    ruleId: "ABD-02",
    complaint: "abdominal_pain",
    ruleName: "Mild Uncomplicated Abdominal Discomfort",
    urgency: "ROUTINE",
    urgencyLevel: 4,
    urgencyColor: "#10B981",
    department: "General Medicine / Ambulatory Outpatient Clinic",
    human_escalation: false,
    conditions: [
      "abdominal_pain == true",
      "severe_pain == false",
      "fainting == false",
      "persistent_vomiting == false",
      "significant_bleeding == false",
      "rigid_abdomen == false"
    ],
    reason: "Patient reports mild-to-moderate abdominal cramping without red flags (no syncope, no persistent emesis, no bleeding, no peritoneal signs). Meets routine criteria under rule ABD-02.",
    citation: "ABD-02",
    requiredFields: ["abdominal_pain", "severe_pain", "fainting", "persistent_vomiting", "significant_bleeding"],
    clinicalRationale: "Acuity Level 4. Uncomplicated gastroenteritis, dyspepsia, or benign abdominal cramping suitable for ambulatory evaluation."
  },

  // -------------------------------------------------------------
  // 6. SAFETY ESCALATION RULES (UNCERTAINTY & MULTI-RISK)
  // -------------------------------------------------------------
  {
    ruleId: "ESC-UNCERTAIN",
    complaint: "any",
    ruleName: "Clinical Information Gap / High Uncertainty Escalation",
    urgency: "URGENT HUMAN REVIEW",
    urgencyLevel: 2,
    urgencyColor: "#8B5CF6",
    department: "Triage Nurse Assessment Bay / Senior Clinician Review",
    human_escalation: true,
    conditions: [
      "critical_information_missing == true OR patient_unable_to_answer == true"
    ],
    reason: "Required critical clinical information could not be established from patient interaction. The system will NOT infer or assume missing parameters are negative. Explicitly escalated to human triage nurse under rule ESC-UNCERTAIN.",
    citation: "ESC-UNCERTAIN",
    requiredFields: [],
    clinicalRationale: "Safety Governance Protocol. Missing red-flag fields cannot be defaulted to false; human clinical verification is mandatory."
  }
];

export const COMPLAINT_CONFIG = {
  chest_pain: {
    label: "Chest Pain / Discomfort",
    icon: "HeartPulse",
    requiredFields: ["severe_pain", "breathing_difficulty", "fainting", "severe_sweating", "radiating_pain"],
    fieldLabels: {
      severe_pain: "Severe / Crushing Pain (Severity ≥ 7/10)",
      breathing_difficulty: "Associated Breathing Difficulty",
      fainting: "Fainting / Syncope / Near-passing out",
      severe_sweating: "Profuse Cold Sweating (Diaphoresis)",
      radiating_pain: "Pain spreading to arm, jaw, neck, or back"
    }
  },
  breathing_difficulty: {
    label: "Breathing Difficulty / Dyspnea",
    icon: "Wind",
    requiredFields: ["unable_to_speak", "severe_distress", "blue_lips_cyanosis", "stridor"],
    fieldLabels: {
      unable_to_speak: "Unable to speak in full sentences",
      severe_distress: "Severe gasping / struggling for air",
      blue_lips_cyanosis: "Blueish discoloration on lips or fingernails",
      stridor: "High-pitched wheezing / whistling / stridor sound"
    }
  },
  injury: {
    label: "Injury / Trauma / Falls",
    icon: "ShieldAlert",
    requiredFields: ["uncontrolled_bleeding", "loss_of_consciousness", "unable_to_use_limb", "deformity"],
    fieldLabels: {
      uncontrolled_bleeding: "Heavy / Uncontrolled bleeding",
      loss_of_consciousness: "Loss of consciousness or head injury dizziness",
      unable_to_use_limb: "Inability to move limb or bear weight",
      deformity: "Visible bone deformity / unnatural angle"
    }
  },
  fever: {
    label: "Fever / Systemic Infection",
    icon: "Thermometer",
    requiredFields: ["severe_deterioration", "confusion", "breathing_difficulty", "infant_under_3_months", "can_eat_and_drink"],
    fieldLabels: {
      severe_deterioration: "Severe lethargy / extreme weakness",
      confusion: "Confusion / Altered mental awareness",
      breathing_difficulty: "Rapid or labored breathing",
      infant_under_3_months: "Patient is an infant under 3 months old",
      stiff_neck: "Severe neck stiffness / sensitivity to light",
      can_eat_and_drink: "Able to drink fluids and tolerate oral intake"
    }
  },
  abdominal_pain: {
    label: "Abdominal Pain / Stomach Ache",
    icon: "Activity",
    requiredFields: ["severe_pain", "fainting", "persistent_vomiting", "significant_bleeding", "rigid_abdomen"],
    fieldLabels: {
      severe_pain: "Severe acute pain (Severity ≥ 7/10)",
      fainting: "Fainted / Lightheadedness upon standing",
      persistent_vomiting: "Persistent uncontrollable vomiting / cannot keep liquids down",
      significant_bleeding: "Blood in vomit or dark black/bloody stools",
      rigid_abdomen: "Stomach is board-hard or unbearable to light touch"
    }
  }
};
