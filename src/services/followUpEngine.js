/**
 * Follow-Up Question Engine
 * Analyzes patient state against required clinical criteria for the complaint.
 * Generates prioritized follow-up questions for missing information.
 * 
 * Critical Safety Rule:
 * Unknown options ("I don't know / Cannot answer") explicitly record null.
 * Missing required fields are not guessed.
 */

import { COMPLAINT_CONFIG } from "../data/triageRules";

export const QUESTION_DEFINITIONS = {
  // ---------------- CHEST PAIN ----------------
  chest_pain: [
    {
      id: "duration",
      field: "duration",
      type: "duration",
      question: "When did the chest pain or discomfort start?",
      subtext: "Timeline helps determine acuity and urgency window.",
      options: [
        { label: "Just now (< 1 hour)", value: "Just now (< 1 hour)" },
        { label: "A few hours ago", value: "A few hours ago" },
        { label: "Since this morning", value: "Since morning" },
        { label: "1-2 days ago", value: "1-2 days ago" },
        { label: "Unable to specify / Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "cp_severity",
      field: "severe_pain",
      type: "severity_scale",
      question: "How severe is your chest pain right now?",
      subtext: "Pain scale from 1 (very mild) to 10 (worst imaginable / crushing).",
      options: [
        { label: "Mild (1 - 3)", value: false, numeric: 2 },
        { label: "Moderate (4 - 6)", value: false, numeric: 5 },
        { label: "Severe / Crushing (7 - 10)", value: true, numeric: 8, isRedFlag: true },
        { label: "I can't tell / Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "cp_breathing",
      field: "breathing_difficulty",
      type: "boolean",
      question: "Are you having difficulty breathing or shortness of breath?",
      subtext: "Such as feeling breathless while resting or talking.",
      options: [
        { label: "Yes, struggling to breathe", value: true, isRedFlag: true },
        { label: "No, breathing normally", value: false },
        { label: "Unsure / Hard to say", value: null, isUnknown: true }
      ]
    },
    {
      id: "cp_fainting",
      field: "fainting",
      type: "boolean",
      question: "Have you fainted, blacked out, or felt close to passing out?",
      subtext: "Syncope or severe postural lightheadedness.",
      options: [
        { label: "Yes, fainted or nearly passed out", value: true, isRedFlag: true },
        { label: "No fainting or blackout", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "cp_sweating",
      field: "severe_sweating",
      type: "boolean",
      question: "Are you experiencing sudden cold sweats or heavy clammy perspiration?",
      subtext: "Unprovoked diaphoresis is a significant cardiac red flag.",
      options: [
        { label: "Yes, cold sweating profusely", value: true, isRedFlag: true },
        { label: "No cold sweats", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "cp_radiation",
      field: "radiating_pain",
      type: "boolean",
      question: "Does the chest pain radiate to your left arm, jaw, neck, or back?",
      subtext: "Radiation patterns assist emergency triage routing.",
      options: [
        { label: "Yes, radiates to arm/jaw/back", value: true, isRedFlag: true },
        { label: "No, localized to one spot", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    }
  ],

  // ---------------- BREATHING DIFFICULTY ----------------
  breathing_difficulty: [
    {
      id: "bd_speech",
      field: "unable_to_speak",
      type: "boolean",
      question: "Are you able to speak in full sentences without gasping?",
      subtext: "Inability to complete 4-word sentences indicates critical airway distress.",
      options: [
        { label: "No, can only gasp short words", value: true, isRedFlag: true },
        { label: "Yes, speaking comfortably", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "bd_distress",
      field: "severe_distress",
      type: "boolean",
      question: "Is the breathlessness severe, exhausting, or rapidly worsening?",
      subtext: "Rapid deterioration requires immediate resuscitation team notification.",
      options: [
        { label: "Yes, severe acute distress", value: true, isRedFlag: true },
        { label: "No, manageable / mild", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "bd_cyanosis",
      field: "blue_lips_cyanosis",
      type: "boolean",
      question: "Is there any blueish or grayish discoloration on the lips or nail beds?",
      subtext: "Cyanosis signals acute hypoxemia.",
      options: [
        { label: "Yes, lips or nails appear blue/gray", value: true, isRedFlag: true },
        { label: "No, normal skin color", value: false },
        { label: "Cannot tell / Unknown", value: null, isUnknown: true }
      ]
    },
    {
      id: "bd_stridor",
      field: "stridor",
      type: "boolean",
      question: "Is there an audible high-pitched whistle or harsh noise when breathing in?",
      subtext: "Stridor indicates potential upper airway obstruction.",
      options: [
        { label: "Yes, high-pitched whistling / stridor", value: true, isRedFlag: true },
        { label: "No high-pitched noise", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    }
  ],

  // ---------------- INJURY ----------------
  injury: [
    {
      id: "inj_deformity",
      field: "deformity",
      type: "boolean",
      question: "Is there any visible bone deformity, crooked angle, or bone penetrating skin?",
      subtext: "Suspected open or displaced fracture.",
      options: [
        { label: "Yes, limb is visibly deformed / crooked", value: true, isRedFlag: true },
        { label: "No, looks normal shape", value: false },
        { label: "Uncertain / Cannot inspect", value: null, isUnknown: true }
      ]
    },
    {
      id: "inj_mobility",
      field: "unable_to_use_limb",
      type: "boolean",
      question: "Are you unable to bear weight, move the limb, or feel your fingers/toes?",
      subtext: "Tests for functional loss and neurovascular deficit.",
      options: [
        { label: "Yes, cannot move limb / cannot bear weight", value: true, isRedFlag: true },
        { label: "No, can move and use limb with minor pain", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "inj_bleeding",
      field: "uncontrolled_bleeding",
      type: "boolean",
      question: "Is there continuous, heavy, or pulsing bleeding that won't stop?",
      subtext: "Active hemorrhage requires immediate trauma compression.",
      options: [
        { label: "Yes, bleeding heavily / soaking through cloth", value: true, isRedFlag: true },
        { label: "No, bleeding has stopped or minor scrape", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "inj_loc",
      field: "loss_of_consciousness",
      type: "boolean",
      question: "Did you hit your head, lose consciousness, or have severe memory loss?",
      subtext: "Traumatic brain injury evaluation.",
      options: [
        { label: "Yes, knocked out / blackout / head trauma", value: true, isRedFlag: true },
        { label: "No head injury or loss of consciousness", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    }
  ],

  // ---------------- FEVER ----------------
  fever: [
    {
      id: "fev_infant",
      field: "infant_under_3_months",
      type: "boolean",
      question: "Is the patient an infant or baby under 3 months (12 weeks) old?",
      subtext: "Neonatal fever is a mandatory emergency protocol regardless of appearance.",
      options: [
        { label: "Yes, infant under 3 months old", value: true, isRedFlag: true },
        { label: "No, older child or adult", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "fev_intake",
      field: "can_eat_and_drink",
      type: "boolean",
      question: "Is the patient able to drink fluids, tolerate liquids, and stay hydrated?",
      subtext: "Hydration tolerance assesses systemic stability.",
      options: [
        { label: "Yes, drinking fluids normally", value: true },
        { label: "No, refusing fluids / cannot keep sips down", value: false, isRedFlag: true },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "fev_confusion",
      field: "confusion",
      type: "boolean",
      question: "Is the patient unusually confused, drowsy, or difficult to awaken?",
      subtext: "Altered mental status flags potential central nervous system infection/sepsis.",
      options: [
        { label: "Yes, confused / extremely drowsy / unresponsive", value: true, isRedFlag: true },
        { label: "No, alert and answering normally", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "fev_breathing",
      field: "breathing_difficulty",
      type: "boolean",
      question: "Is there rapid, grunting, or labored breathing with the fever?",
      subtext: "Lower respiratory tract involvement assessment.",
      options: [
        { label: "Yes, breathing is fast / labored", value: true, isRedFlag: true },
        { label: "No breathing problems", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "fev_stiff_neck",
      field: "stiff_neck",
      type: "boolean",
      question: "Is there a painful stiff neck (cannot touch chin to chest) or bright light sensitivity?",
      subtext: "Meningeal irritation assessment.",
      options: [
        { label: "Yes, painful stiff neck / severe photophobia", value: true, isRedFlag: true },
        { label: "No stiff neck or light pain", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    }
  ],

  // ---------------- ABDOMINAL PAIN ----------------
  abdominal_pain: [
    {
      id: "abd_severity",
      field: "severe_pain",
      type: "severity_scale",
      question: "How severe is the abdominal pain on a scale of 1 to 10?",
      subtext: "Severe acute pain (7+) triggers surgical review rule.",
      options: [
        { label: "Mild (1 - 3)", value: false, numeric: 2 },
        { label: "Moderate (4 - 6)", value: false, numeric: 5 },
        { label: "Severe / Agonizing (7 - 10)", value: true, numeric: 8, isRedFlag: true },
        { label: "Uncertain / Cannot quantify", value: null, isUnknown: true }
      ]
    },
    {
      id: "abd_fainting",
      field: "fainting",
      type: "boolean",
      question: "Have you experienced fainting, severe dizziness, or felt like collapsing?",
      subtext: "May indicate hypovolemia or internal bleeding.",
      options: [
        { label: "Yes, fainted or extremely dizzy when standing", value: true, isRedFlag: true },
        { label: "No dizziness or fainting", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "abd_vomit",
      field: "persistent_vomiting",
      type: "boolean",
      question: "Are you vomiting persistently and unable to keep any fluids down?",
      subtext: "Dehydration and acute bowel obstruction risk.",
      options: [
        { label: "Yes, repeated persistent vomiting", value: true, isRedFlag: true },
        { label: "No vomiting or just single episode", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "abd_bleeding",
      field: "significant_bleeding",
      type: "boolean",
      question: "Have you seen any blood in your vomit, or black / tarry / bloody stools?",
      subtext: "Gastrointestinal hemorrhage indicator.",
      options: [
        { label: "Yes, blood in vomit or dark/bloody stool", value: true, isRedFlag: true },
        { label: "No blood seen", value: false },
        { label: "Uncertain", value: null, isUnknown: true }
      ]
    },
    {
      id: "abd_rigidity",
      field: "rigid_abdomen",
      type: "boolean",
      question: "Does your belly feel rock-hard, or is it severely painful when letting go after pressing?",
      subtext: "Peritoneal signs indicating surgical urgency.",
      options: [
        { label: "Yes, board-hard / severe rebound tenderness", value: true, isRedFlag: true },
        { label: "No, stomach is soft", value: false },
        { label: "Uncertain / Cannot tell", value: null, isUnknown: true }
      ]
    }
  ]
};

/**
 * Determine which follow-up questions are needed based on missing data
 */
export function getPendingFollowUps(patientData) {
  const complaint = patientData.complaint || "chest_pain";
  const questionList = QUESTION_DEFINITIONS[complaint] || [];
  const pending = [];

  for (const q of questionList) {
    if (q.field === "duration") {
      if (!patientData.duration || patientData.duration === "Unknown") {
        pending.push(q);
      }
    } else {
      // Check if symptom field is undefined or null (missing)
      if (patientData.symptoms[q.field] === undefined) {
        pending.push(q);
      }
    }
  }

  return pending;
}
