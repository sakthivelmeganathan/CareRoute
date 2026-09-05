/**
 * Clinical NLP & Intake Information Extractor
 * Converts unstructured plain language patient descriptions into structured internal data.
 * 
 * Safety Rule: Unmentioned fields remain null (UNKNOWN).
 * Unknown is NEVER converted to false.
 */

export function parsePatientIntake(rawText) {
  if (!rawText || typeof rawText !== "string") {
    return {
      rawText: "",
      complaint: null,
      confidence: 0,
      duration: "Unknown",
      severityRating: null,
      symptoms: {},
      sources: {},
      patientReportedStatements: []
    };
  }

  const text = rawText.toLowerCase().trim();
  const symptoms = {};
  const sources = {};
  const patientReportedStatements = [];

  // Helper to mark symptom from initial patient text
  const markSymptom = (key, value, statement) => {
    symptoms[key] = value;
    sources[key] = "patient";
    if (statement && !patientReportedStatements.includes(statement)) {
      patientReportedStatements.push(statement);
    }
  };

  // -------------------------------------------------------------
  // 1. DURATION EXTRACTION
  // -------------------------------------------------------------
  let duration = "Unknown";
  const durationPatterns = [
    { regex: /since\s+(morning|yesterday|last\s+night|this\s+morning|last\s+week|a\s+few\s+days)/i, match: (m) => `Since ${m[1]}` },
    { regex: /for\s+(\d+\s*(?:hours?|hrs?|days?|weeks?|minutes?|mins?))/i, match: (m) => `For ${m[1]}` },
    { regex: /(\d+)\s*(?:hours?|hrs?|days?|weeks?|minutes?|mins?)\s+ago/i, match: (m) => `${m[0]}` },
    { regex: /(just\s+now|suddenly|started\s+today)/i, match: (m) => `${m[1]}` }
  ];

  for (const p of durationPatterns) {
    const match = text.match(p.regex);
    if (match) {
      duration = p.match(match);
      patientReportedStatements.push(`Duration: ${duration}`);
      break;
    }
  }

  // -------------------------------------------------------------
  // 2. SEVERITY EXTRACTION (1-10 or descriptive)
  // -------------------------------------------------------------
  let severityRating = null;
  const numSeverityMatch = text.match(/(\d{1,2})\s*(?:\/|\s*out\s*of\s*)\s*10/);
  if (numSeverityMatch) {
    severityRating = parseInt(numSeverityMatch[1], 10);
  } else if (text.includes("severe") || text.includes("crushing") || text.includes("badly") || text.includes("unbearable") || text.includes("extreme") || text.includes("hurts badly")) {
    severityRating = 8;
    markSymptom("severe_pain", true, "Reported high pain intensity / severe discomfort");
  } else if (text.includes("mild") || text.includes("slight") || text.includes("a little") || text.includes("tender")) {
    severityRating = 3;
    markSymptom("severe_pain", false, "Reported mild/slight discomfort");
  }

  if (severityRating !== null && !symptoms["severe_pain"]) {
    markSymptom("severe_pain", severityRating >= 7, `Reported pain severity: ${severityRating}/10`);
  }

  // -------------------------------------------------------------
  // 3. COMPLAINT CATEGORY CLASSIFICATION
  // -------------------------------------------------------------
  const complaintScores = {
    chest_pain: 0,
    breathing_difficulty: 0,
    injury: 0,
    fever: 0,
    abdominal_pain: 0
  };

  // Keywords for Chest Pain
  if (/chest|heart|sternum|pectoral|rib\s*cage|angina|palpitation/i.test(text)) {
    complaintScores.chest_pain += 5;
    markSymptom("chest_pain", true, "Chest discomfort/pain reported");
  }

  // Keywords for Breathing
  if (/breath|gasping|air|choking|wheez|inhal|respirat|stridor|asthma/i.test(text)) {
    complaintScores.breathing_difficulty += 5;
    markSymptom("breathing_difficulty", true, "Breathing difficulty reported");
  }

  // Keywords for Injury
  if (/fell|fall|trip|twisted|fracture|broke|wound|cut|bleeding|scrape|accident|curb|ankle|wrist|arm|leg|hit|sprain/i.test(text)) {
    complaintScores.injury += 5;
    markSymptom("injury", true, "Injury / Trauma incident reported");
  }

  // Keywords for Fever
  if (/fever|temperature|chills|shivering|hot|102|101|103|100\.\d|feverish/i.test(text)) {
    complaintScores.fever += 5;
    markSymptom("fever", true, "Fever / Elevated temperature reported");
  }

  // Keywords for Abdomen
  if (/stomach|belly|abdomen|abdominal|gut|cramp|tummy|nausea|vomit|diarrhea/i.test(text)) {
    complaintScores.abdominal_pain += 5;
    markSymptom("abdominal_pain", true, "Abdominal / Stomach symptoms reported");
  }

  // Pick dominant complaint category
  let primaryComplaint = null;
  let maxScore = 0;
  for (const [comp, score] of Object.entries(complaintScores)) {
    if (score > maxScore) {
      maxScore = score;
      primaryComplaint = comp;
    }
  }

  // If ambiguous or no direct match, check sub-clues
  if (!primaryComplaint) {
    if (/pain/i.test(text)) {
      primaryComplaint = "chest_pain"; // Default candidate for review
    } else {
      primaryComplaint = "chest_pain"; // Will trigger follow-up confirmation or uncertain escalation
    }
  }

  // -------------------------------------------------------------
  // 4. DETECT SPECIFIC RED FLAGS & CONTEXT FROM TEXT
  // -------------------------------------------------------------
  
  // Breathing details
  if (/(can't|cannot|unable to)\s+(speak|talk|finish words|breathe)/i.test(text) || /gasping/i.test(text)) {
    markSymptom("unable_to_speak", true, "Unable to speak in full sentences / severe gasping");
    markSymptom("severe_distress", true, "Severe respiratory distress");
  }

  // Syncope / Dizziness / Fainting
  if (/faint|passed out|blacked out|nearly fainted|syncope|dizzy|lightheaded/i.test(text)) {
    if (/not dizzy|no dizziness|no fainting/i.test(text)) {
      markSymptom("fainting", false, "Denies fainting or dizziness");
    } else {
      markSymptom("fainting", true, "Fainting, near-syncope, or dizziness reported");
    }
  }

  // Sweating / Diaphoresis
  if (/sweat|cold sweat|clammy|diaphoresis/i.test(text)) {
    if (/no sweat/i.test(text)) {
      markSymptom("severe_sweating", false, "Denies profuse sweating");
    } else {
      markSymptom("severe_sweating", true, "Cold sweats / diaphoresis reported");
    }
  }

  // Radiation of pain
  if (/(radiat|spread|shoots|shooting|goes to|jaw|arm|back|shoulder)/i.test(text)) {
    markSymptom("radiating_pain", true, "Pain radiation to arm, jaw, or back reported");
  }

  // Bleeding
  if (/bleeding/i.test(text)) {
    if (/bleeding stopped|controlled|bandaid|small scrape|no bleeding/i.test(text)) {
      markSymptom("uncontrolled_bleeding", false, "Bleeding reported as controlled / minor");
    } else if (/uncontrolled|heavy bleeding|pouring|soaking/i.test(text)) {
      markSymptom("uncontrolled_bleeding", true, "Uncontrolled active bleeding reported");
    }
  }

  // Deformity & limb mobility
  if (/bent|deformed|twisted|bone|crooked|unnatural/i.test(text)) {
    markSymptom("deformity", true, "Visible limb deformity reported");
  }
  if (/(can't|cannot|unable to)\s+(move|walk|bear weight|use my)/i.test(text) || /numb/i.test(text)) {
    markSymptom("unable_to_use_limb", true, "Loss of mobility or inability to bear weight reported");
  }

  // Pediatric & high-risk fever
  if (/baby|infant|newborn|week-old|month-old|8-week|2-month|6-week/i.test(text)) {
    const ageMonthMatch = text.match(/(\d+)\s*(?:month|mo)/i);
    const ageWeekMatch = text.match(/(\d+)\s*(?:week|wk)/i);
    if ((ageMonthMatch && parseInt(ageMonthMatch[1], 10) < 3) || (ageWeekMatch && parseInt(ageWeekMatch[1], 10) < 13) || /newborn|baby|infant/i.test(text)) {
      markSymptom("infant_under_3_months", true, "Patient is a young infant / baby (< 3 months)");
    }
  }

  // Oral intake / hydration
  if (/can eat and drink|drinking normally|eating normally|tolerating fluids/i.test(text)) {
    markSymptom("can_eat_and_drink", true, "Normal oral intake and fluid hydration reported");
  } else if (/won't (?:take|drink|nurse)|cannot drink|refuses to nurse|vomiting everything/i.test(text)) {
    markSymptom("can_eat_and_drink", false, "Unable to tolerate oral fluids / refusing feed");
    markSymptom("severe_deterioration", true, "Poor fluid intake / deterioration");
  }

  // GI Red flags (vomiting, bleeding, rigidity)
  if (/vomit|throwing up|threw up/i.test(text)) {
    if (/no vomit/i.test(text)) {
      markSymptom("persistent_vomiting", false, "Denies vomiting");
    } else if (/persistent|uncontrollable|keeps vomiting|makes me throw up/i.test(text)) {
      markSymptom("persistent_vomiting", true, "Vomiting reported");
    }
  }

  if (/blood in stool|black stool|throwing up blood|bloody/i.test(text)) {
    markSymptom("significant_bleeding", true, "Gastrointestinal bleeding reported");
  }

  return {
    rawText,
    complaint: primaryComplaint,
    duration,
    severityRating,
    symptoms,
    sources,
    patientReportedStatements
  };
}
