/**
 * Preset Patient Walk-in Vignettes (Everyday Natural Language)
 * Includes the 3 Core Required Demo Scenarios + Additional Edge Cases
 */

export const PRESET_CASES = [
  // -------------------------------------------------------------
  // DEMO CASE 1 — ROUTINE (FEVER)
  // -------------------------------------------------------------
  {
    id: "demo-1-routine-fever",
    badge: "Demo Case 1 — Routine",
    title: "Mild Fever, Hydrated Adult",
    category: "fever",
    patientInput: "I have fever since yesterday. I can eat and drink normally.",
    expectedRule: "FEVER-02",
    expectedUrgency: "ROUTINE",
    expectedDepartment: "General Medicine / Outpatient Care Clinic",
    expectedEscalation: false,
    description: "Patient reports isolated fever with normal fluid intake and absence of high-risk red flags. Routed safely to General Medicine."
  },

  // -------------------------------------------------------------
  // DEMO CASE 2 — EMERGENCY (CHEST PAIN)
  // -------------------------------------------------------------
  {
    id: "demo-2-emergency-chest",
    badge: "Demo Case 2 — Emergency",
    title: "Chest Pain with Respiratory Distress",
    category: "chest_pain",
    patientInput: "My chest hurts and I am struggling to breathe.",
    expectedRule: "CP-01",
    expectedUrgency: "EMERGENCY",
    expectedDepartment: "Emergency Department - Acute Resuscitation / Cardiac Bay",
    expectedEscalation: true,
    description: "Immediate high-risk red flag: acute chest pain combined with dyspnea. Triggers Rule CP-01 and immediate human escalation."
  },

  // -------------------------------------------------------------
  // DEMO CASE 3 — UNCERTAIN (ABDOMINAL PAIN)
  // -------------------------------------------------------------
  {
    id: "demo-3-uncertain-abdomen",
    badge: "Demo Case 3 — Uncertainty Escalation",
    title: "Severe Stomach Pain with Unknown Red Flags",
    category: "abdominal_pain",
    patientInput: "My stomach hurts badly, but I'm not sure about the other symptoms.",
    expectedRule: "ESC-UNCERTAIN",
    expectedUrgency: "URGENT HUMAN REVIEW",
    expectedDepartment: "Triage Nurse Assessment Bay / Senior Clinician Review",
    expectedEscalation: true,
    simulateUnknownFollowUp: true,
    description: "Proves system self-awareness: critical fields cannot be answered or remain unknown. The system refuses to assume 'false' and escalates to a human clinician."
  },

  // -------------------------------------------------------------
  // ADDITIONAL CLINICAL BENCHMARKS
  // -------------------------------------------------------------
  {
    id: "case-4-trauma-limb",
    badge: "Trauma / Injury",
    title: "Fall with Deformity and Inability to Move Arm",
    category: "injury",
    patientInput: "I tripped over a curb and fell hard on my right arm. It looks bent and I can't move my fingers at all.",
    expectedRule: "INJ-01",
    expectedUrgency: "URGENT",
    expectedDepartment: "Emergency Department - Trauma / Orthopedic Bay",
    expectedEscalation: true,
    description: "Trauma with visible deformity and neurovascular/functional impairment. Routed to Emergency/Trauma."
  },
  {
    id: "case-5-infant-fever",
    badge: "Pediatric Emergency",
    title: "2-Month-Old Infant with High Fever",
    category: "fever",
    patientInput: "My 8-week-old baby has a 102 fever, crying weakly and won't take any bottle.",
    expectedRule: "FEVER-01",
    expectedUrgency: "EMERGENCY",
    expectedDepartment: "Emergency Department - Acute Medical / Pediatric Emergency",
    expectedEscalation: true,
    description: "Neonatal/young infant fever (< 3 months) is an emergency protocol trigger requiring immediate physician evaluation."
  },
  {
    id: "case-6-respiratory-stridor",
    badge: "Airway Emergency",
    title: "Severe Breathlessness / Cannot Speak",
    category: "breathing_difficulty",
    patientInput: "Gasping for air... can't finish words... throat feels tight.",
    expectedRule: "BD-01",
    expectedUrgency: "EMERGENCY",
    expectedDepartment: "Emergency Department - Acute Respiratory Bay",
    expectedEscalation: true,
    description: "Airway/speech compromise triggering immediate resuscitation bay routing under Rule BD-01."
  },
  {
    id: "case-7-minor-injury",
    badge: "Minor Trauma",
    title: "Superficial Scrape / Minor Ankle Twist",
    category: "injury",
    patientInput: "I scraped my shin against a coffee table, bleeding stopped right away with a bandaid, just a little tender.",
    expectedRule: "INJ-02",
    expectedUrgency: "ROUTINE",
    expectedDepartment: "Minor Injuries Unit / Fast-Track Walk-in Clinic",
    expectedEscalation: false,
    description: "Minor superficial contusion without deformity or mobility loss. Routed to Minor Injuries Unit."
  },
  {
    id: "case-8-mild-stomach",
    badge: "Routine GI",
    title: "Mild Stomach Cramp after Eating",
    category: "abdominal_pain",
    patientInput: "Slight bloating and mild tummy cramps for 2 hours after heavy dinner, no vomiting or dizziness.",
    expectedRule: "ABD-02",
    expectedUrgency: "ROUTINE",
    expectedDepartment: "General Medicine / Ambulatory Outpatient Clinic",
    expectedEscalation: false,
    description: "Mild abdominal discomfort with negative red flags routed to Outpatient Clinic."
  },
  {
    id: "case-9-localized-chest",
    badge: "Priority Musculoskeletal",
    title: "Rib Tenderness After Workout",
    category: "chest_pain",
    patientInput: "I have mild sore chest pain when I press on my pectoral muscle after gym, no shortness of breath, no sweating.",
    expectedRule: "CP-02",
    expectedUrgency: "PRIORITY",
    expectedDepartment: "Rapid Medical Assessment / Urgent Care Clinic",
    expectedEscalation: false,
    description: "Atypical localized chest discomfort without systemic red flags. Assigned Priority routing to Rapid Medical Assessment."
  }
];
