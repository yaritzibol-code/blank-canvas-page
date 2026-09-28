-- ATP 2025–2026: Chapter 1 Regulations, supplied ASA Library reader.
-- Only questions. Existing learning paths and all other chapters stay intact.
-- Upload the seven versioned PNGs to atp-images before applying this migration.
-- Replaced rows are hidden, retaining their IDs and historical references.
DO $migration$
DECLARE
  v_questions jsonb := $questions$
[
  {
    "id": "q_la_ATP_2026_9350",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "Unless otherwise authorized, when is the pilot-in-command required to hold a type rating?",
    "options": [
      "When operating an aircraft that is certificated for more than one pilot.",
      "When operating an aircraft having a gross weight of more than 12,500 pounds.",
      "When operating a multiengine aircraft having a gross weight of more than 6,000 pounds."
    ],
    "correctIndex": 1,
    "explanation": "A person must hold a type rating to act as PIC of a large aircraft (over 12,500 pounds gross takeoff weight) or turbojet-powered airplane. (PLT443, AA.I.G.K1) — 14 CFR §61.31 Answer (A) is incorrect because an aircraft requiring more than one pilot does not constitute the need for a type rating. Answer (C) is incorrect because it does not matter if the aircraft is single-engine or multi-engine, and the aircraft must weigh over 12,500 lbs., not 6,000.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-4 · question 9350 · ALL",
    "sourceQuestionId": "9350",
    "sourceEdition": "2025–2026",
    "sourcePage": 4,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9350_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "According to 14 CFR Part 121, what requirements must the second-in-command possess?",
    "options": [
      "ATP certificate with appropriate type rating.",
      "ATP certificate with appropriate second-in-command type rating.",
      "ATP certificate and Third Class Medical Certificate."
    ],
    "correctIndex": 0,
    "explanation": "No certificate holder may use nor may any pilot act as second-in-command (SIC) unless the pilot holds an Airline Transport Pilot Certificate and an appropriate aircraft type rating for the aircraft being flown. A SIC type rating obtained under 14 CFR §61.55 does not satisfy these requirements. (PLT450, AA.I.G.K4) — 14 CFR §121.436",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-4 · question 9350-1 · ALL",
    "sourceQuestionId": "9350-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 4,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9328",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "A commercial pilot has a type rating in a B-727 and B-737. A flight test is completed in a B-747 for the Airline Transport Pilot Certificate. What pilot privileges may be exercised regarding these airplanes?",
    "options": [
      "Commercial – B-737; ATP – B-727 and B-747.",
      "ATP – B-747; Commercial – B-727 and B-737.",
      "ATP – B-747, B-727, and B-737."
    ],
    "correctIndex": 2,
    "explanation": "Any type rating(s) on the pilot certificate of an applicant who successfully completes an ATP checkride will be included on the ATP Certificate with the privileges and limitations of that certificate, provided the applicant passes the checkride in the same category and class of aircraft for which the applicant holds the type rating(s). However, if a type rating for that category and class of aircraft on the superseded pilot certificate is limited to VFR, that limitation shall be carried forward to the person’s ATP Certificate level. (PLT443, AA.I.G.K1)—14 CFR §61.157",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-5 · question 9328 · ALL",
    "sourceQuestionId": "9328",
    "sourceEdition": "2025–2026",
    "sourcePage": 5,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9329",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "A commercial pilot has DC-3 and DC-9 type ratings. A flight test is completed for an Airline Transport Pilot Certificate in a B-727. What pilot privileges may be exercised?",
    "options": [
      "ATP – B-727 and DC-3; Commercial – DC-9.",
      "ATP – B-727 only; Commercial – DC-9 and DC 3.",
      "ATP – B-727, DC-3, and DC-9."
    ],
    "correctIndex": 2,
    "explanation": "Any type rating(s) on the pilot certificate of an applicant who successfully completes an ATP checkride will be included on the ATP Certificate with the privileges and limitations of that certificate, provided the applicant passes the checkride in the same category and class of aircraft for which the applicant holds the type rating(s). However, if a type rating for that category and class of aircraft on the superseded pilot certificate is limited to VFR, that limitation shall be carried forward to the person’s ATP Certificate level. (PLT442, AA.I.G.K1) — 14 CFR §61.157",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-5 · question 9329 · ALL",
    "sourceQuestionId": "9329",
    "sourceEdition": "2025–2026",
    "sourcePage": 5,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9329_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "The lowest CAT II minimums are",
    "options": [
      "DH 100 and RVR 1200.",
      "DH 150 and RVR 1600.",
      "DH 50 and RVR 1200."
    ],
    "correctIndex": 1,
    "explanation": "A CAT II or CAT III pilot authorization is issued by a letter of authorization as part of an applicant’s Instrument Rating or ATP Certificate. Upon original issue, the authorization contains the following limitations for CAT II operations: 1,600 feet RVR and a 150-foot DH. (PLT442, AA.I.G.K1) — 14 CFR §61.13",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-5 · question 9329-1 · ALL",
    "sourceQuestionId": "9329-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 5,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9329_2",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "The lowest authorized ILS minimums associated with CAT II approaches are",
    "options": [
      "Decision Height (DH) 200 feet and Runway Visual Range (RVR) 2,400 feet (with touchdown zone and centerline lighting, RVR 1,800 feet).",
      "DH 100 feet and RVR 1,200 feet.",
      "No DH or DH below 50 feet and RVR less than 700 feet but not less than 150 feet."
    ],
    "correctIndex": 1,
    "explanation": "A CAT I operation is a precision instrument approach and landing with a decision height that is not lower than 200 feet (60 meters) above the threshold and with either a visibility of not less than 1/2 SM (800 meters), or a runway visual range of not less than 1,800 feet (550 meters). A CAT II operation is a precision instrument approach and landing with a DH lower than 200 feet (60 meters), but not lower than 100 feet (30 meters), and with a RVR of not less than 1,200 feet (350 meters). A CAT III operation is a precision instrument approach and landing with a DH lower than 100 feet (30 meters) or no DH, and with a RVR less than 1,200 feet (350 meters). (PLT442, AA.I.C.K5) — FAA-H-8083-16",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-5 · question 9329-2 · ALL",
    "sourceQuestionId": "9329-2",
    "sourceEdition": "2025–2026",
    "sourcePage": 5,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9330",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "In a 24-hour consecutive period, what is the maximum time, excluding briefing and debriefing, that an airline transport pilot may instruct other pilots in air transportation service?",
    "options": [
      "6 hours.",
      "8 hours.",
      "10 hours."
    ],
    "correctIndex": 1,
    "explanation": "An ATP may instruct other pilots in air transportation service in aircraft of the category, class, and type for which the ATP is rated. However, the ATP may not instruct for more than 8 hours in one day nor more than 36 hours in any 7-day period. (PLT460, AA.I.G.K1) — 14 CFR §61.167",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-5 · question 9330 · ALL",
    "sourceQuestionId": "9330",
    "sourceEdition": "2025–2026",
    "sourcePage": 5,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9331",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "The flight instruction of other pilots in air transportation service by an airline transport pilot is restricted to",
    "options": [
      "30 hours in any 7-consecutive-day period.",
      "7 hours in any 24-consecutive-hour period.",
      "36 hours in any 7-consecutive-day period."
    ],
    "correctIndex": 2,
    "explanation": "The ATP may not instruct for more than 8 hours in one day nor more than 36 hours in any 7-day period. (PLT460, AA.I.G.K1) — 14 CFR §61.167",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-6 · question 9331 · ALL",
    "sourceQuestionId": "9331",
    "sourceEdition": "2025–2026",
    "sourcePage": 6,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9351",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "When a replacement is received for an airman’s medical certificate, for what maximum time is this document valid?",
    "options": [
      "30 days.",
      "60 days.",
      "90 days."
    ],
    "correctIndex": 1,
    "explanation": "A person who has lost an Airman’s Certificate or a Medical Certificate, or both, may obtain a document from the FAA confirming that it was issued. The document may be carried as temporary certificate(s) for a period not to exceed 60 days. (PLT447, AA.I.G.K1) — 14 CFR §61.29",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-6 · question 9351 · ALL",
    "sourceQuestionId": "9351",
    "sourceEdition": "2025–2026",
    "sourcePage": 6,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9332",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "How soon after the conviction for driving while intoxicated by alcohol or drugs shall it be reported to the FAA, Civil Aviation Security Division?",
    "options": [
      "No later than 30 working days after the motor vehicle action.",
      "No later than 60 days after the motor vehicle action.",
      "Required to be reported upon renewal of medical certificate."
    ],
    "correctIndex": 1,
    "explanation": "Each person holding a certificate issued under Part 61 shall provide a written report of each motor vehicle action to the FAA Civil Aviation Security Division, no later than 60 days after the motor vehicle action. (PLT463, AA.I.G.K1) — 14 CFR §61.15",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-6 · question 9332 · ALL",
    "sourceQuestionId": "9332",
    "sourceEdition": "2025–2026",
    "sourcePage": 6,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9325",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "Which is a definition of the term “crewmember”?",
    "options": [
      "Only a pilot, flight engineer, or flight navigator assigned to duty in an aircraft during flight time.",
      "A person assigned to perform duty in an aircraft during flight time.",
      "Any person assigned to duty in an aircraft during flight except a pilot or flight engineer."
    ],
    "correctIndex": 1,
    "explanation": "Crewmember means a person assigned to perform duty in an aircraft during flight time. (PLT395, AA.I.G.K4) — 14 CFR §1.1 Answer (A) is incorrect because crewmember pertains to anyone assigned duty in the aircraft during flight. Answer (C) is also incorrect because crewmember also includes the pilot and flight engineer.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-6 · question 9325 · ALL",
    "sourceQuestionId": "9325",
    "sourceEdition": "2025–2026",
    "sourcePage": 6,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9349",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "When a type rating is to be added to an Airline Transport Pilot Certificate, and the practical test is scheduled in an approved flight simulator and an aircraft, the applicant is",
    "options": [
      "required to have a least a current Third Class medical certificate.",
      "required to have a current First Class medical certificate.",
      "not required to hold a medical certificate."
    ],
    "correctIndex": 0,
    "explanation": "A prerequisite for taking a practical test requires that the applicant hold at least a current Third Class Medical Certificate, if a medical certificate is required. In this case, since part of the practical test is scheduled in an aircraft, the applicant is required to have at least a current Third Class Medical Certificate. (PLT427, AA.I.G.K1) — 14 CFR §61.39",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-6 · question 9349 · ATM, ATS, RTC",
    "sourceQuestionId": "9349",
    "sourceEdition": "2025–2026",
    "sourcePage": 6,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9335",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "An applicant who is taking a practical test for a type rating to be added to a Commercial Pilot Certificate, in an approved simulator, is",
    "options": [
      "required to have a First Class Medical Certificate.",
      "required to have a Second Class Medical Certificate.",
      "not required to have a medical certificate."
    ],
    "correctIndex": 2,
    "explanation": "A prerequisite for taking a practical test requires that the applicant hold at least a current Third Class Medical Certificate, if a medical certificate is required. The applicant is not required to hold a medical certificate when taking a test or check for a certificate, rating, or authorization conducted in a flight simulator or flight training device. In this case, since the practical test is scheduled in an approved flight simulator, the applicant is not required to have a medical certificate. (PLT427, AA.I.G.K1) — 14 CFR §§61.39, 61.23",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-6 · question 9335 · ATM, ATS, RTC",
    "sourceQuestionId": "9335",
    "sourceEdition": "2025–2026",
    "sourcePage": 6,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9333",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "An applicant who is scheduled for a practical test for an Airline Transport Pilot Certificate, in an approved flight simulator, is",
    "options": [
      "required to have at least a current Third Class Medical Certificate.",
      "not required to have a medical certificate.",
      "required to have a First Class Medical Certificate."
    ],
    "correctIndex": 1,
    "explanation": "A prerequisite for taking a practical test requires that the applicant hold at least a current Third Class Medical Certificate, if a medical certificate is required. The applicant is not required to hold a medical certificate when taking a test or check for a certificate, rating, or authorization conducted in a flight simulator or flight training device. In this case, since the practical test is scheduled in an approved flight simulator, the applicant is not required to have a medical certificate. (PLT427, AA.I.G.K1) — 14 CFR §61.39 and §61.23",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-7 · question 9333 · ATM, ATS, RTC",
    "sourceQuestionId": "9333",
    "sourceEdition": "2025–2026",
    "sourcePage": 7,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9343",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "When a type rating is to be added to an Airline Transport Pilot Certificate, and the practical test is scheduled in an approved flight training device and/or approved flight simulator, the applicant is",
    "options": [
      "required to have at least a Third Class Medical Certificate.",
      "is not required to have a medical certificate.",
      "required to have a First Class Medical Certificate."
    ],
    "correctIndex": 1,
    "explanation": "A prerequisite for taking a practical test requires that the applicant hold at least a current Third Class Medical Certificate, if a medical certificate is required. The applicant is not required to hold a medical certificate when taking a test or check for a certificate, rating, or authorization conducted in a flight simulator or flight training device. In this case, since the practical test is scheduled in an approved flight training device and/or approved flight simulator, the applicant is not required to have a medical certificate. (PLT427, AA.I.G.K1) — 14 CFR §§61.39, 61.23",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-7 · question 9343 · ATM, ATS, RTC",
    "sourceQuestionId": "9343",
    "sourceEdition": "2025–2026",
    "sourcePage": 7,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9340",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "An applicant who is scheduled for a practical test for an Airline Transport Pilot Certificate, in an aircraft, needs",
    "options": [
      "a First Class Medical Certificate.",
      "at least a current Third Class Medical Certificate.",
      "a Second Class Medical Certificate."
    ],
    "correctIndex": 1,
    "explanation": "A prerequisite for taking a practical test requires that the applicant hold at least a current Third Class Medical Certificate, if a medical certificate is required. In this case, since the practical test is scheduled in an aircraft, the applicant is required to have at least a current Third Class Medical Certificate. (PLT427, AA.I.G.K1) — 14 CFR §61.39",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-7 · question 9340 · ATM, ATS, RTC",
    "sourceQuestionId": "9340",
    "sourceEdition": "2025–2026",
    "sourcePage": 7,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8191",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "The ATP Certificate",
    "materia": "operaciones",
    "text": "The “age 65 rule” of 14 CFR Part 121 applies to",
    "options": [
      "any required pilot crewmember.",
      "any flight crewmember.",
      "the pilot-in-command only."
    ],
    "correctIndex": 0,
    "explanation": "No person may serve as a pilot on an airplane engaged in operations under Part 121 if that person has reached their 65th birthday. (PLT443, AA.I.G.K4) — 14 CFR §121.383 Answer (B) is incorrect because the “age 65” rule excludes flight engineers and navigators. Answer (C) is incorrect because the “age 65” rule applies to every pilot crewmember.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-7 · question 8191 · ATM, ADX",
    "sourceQuestionId": "8191",
    "sourceEdition": "2025–2026",
    "sourcePage": 7,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8189",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Engineer Requirements",
    "materia": "operaciones",
    "text": "Under which condition is a flight engineer required as a flight crewmember in 14 CFR Part 121 operations?",
    "options": [
      "If the airplane is being flown on proving flights, with revenue cargo aboard.",
      "If the airplane is powered by more than two turbine engines.",
      "If required by the airplane’s type certificate."
    ],
    "correctIndex": 2,
    "explanation": "No certificate holder may operate an airplane for which a type certificate was issued before January 2, 1964, having a maximum certificated takeoff weight of more than 80,000 pounds without a flight crewmember holding a current Flight Engineer Certificate. For each airplane type certificated after January 1, 1964, the requirement for a flight engineer is determined under the type certification requirements of 14 CFR §25.1523. (PLT409, AA.I.G.K4) — 14 CFR §121.387 Answer (A) is incorrect because the type certificate is the determining factor for a flight engineer. Answer (B) is incorrect because the type certificate is the determining factor for a flight engineer.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-8 · question 8189 · ATM, ADX",
    "sourceQuestionId": "8189",
    "sourceEdition": "2025–2026",
    "sourcePage": 8,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8190",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Engineer Requirements",
    "materia": "operaciones",
    "text": "When the need for a flight engineer is determined by aircraft weight, what is the takeoff weight that requires a flight engineer?",
    "options": [
      "80,000 pounds.",
      "More than 80,000 pounds.",
      "300,000 pounds."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may operate an airplane for which a type certificate was issued before January 2, 1964, having a maximum certificated takeoff weight of more than 80,000 pounds without a flight crewmember holding a current Flight Engineer Certificate. (PLT440, AA.I.G.K4) — 14 CFR §121.387",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-8 · question 8190 · ATM, ADX",
    "sourceQuestionId": "8190",
    "sourceEdition": "2025–2026",
    "sourcePage": 8,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8212",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Engineer Requirements",
    "materia": "operaciones",
    "text": "An air carrier uses an airplane that is certified for operation with a flight crew of two pilots and one flight engineer. In case the flight engineer becomes incapacitated,",
    "options": [
      "at least one other flight crewmember must be qualified to perform the flight engineer duties.",
      "one crewmember must be qualified to perform the duties of the flight engineer.",
      "one pilot must be qualified and have a flight engineer certificate to perform the flight engineer duties."
    ],
    "correctIndex": 0,
    "explanation": "On each flight requiring a flight engineer at least one flight crewmember, other than the flight engineer, must be qualified to provide emergency performance of the flight engineer’s functions for the safe completion of the flight if the flight engineer becomes ill or is otherwise incapacitated. A pilot need not hold a Flight Engineer Certificate to perform the flight engineer’s functions in such a situation. (PLT440, AA.I.G.K4) — 14 CFR §121.385",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-8 · question 8212 · ATM, ADX",
    "sourceQuestionId": "8212",
    "sourceEdition": "2025–2026",
    "sourcePage": 8,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8213",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Engineer Requirements",
    "materia": "operaciones",
    "text": "When a flight engineer is a required crewmember on a flight, it is necessary for",
    "options": [
      "one pilot to hold a flight engineer certificate and be qualified to perform the flight engineer duties in an emergency.",
      "the flight engineer to be properly certificated and qualified, but also at least one other flight crewmember must be qualified and certified to perform flight engineer duties.",
      "at least one other flight crewmember to be qualified to perform flight engineer duties, but a certificate is not required."
    ],
    "correctIndex": 2,
    "explanation": "On each flight requiring a flight engineer at least one flight crewmember, other than the flight engineer, must be qualified to provide emergency performance of the flight engineer’s functions for the safe completion of the flight if the flight engineer becomes ill or is otherwise incapacitated. A pilot need not hold a Flight Engineer Certificate to perform the flight engineer’s functions in such a situation. (PLT440, AA.I.G.K4) — 14 CFR §121.385",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-8 · question 8213 · ATM, ADX",
    "sourceQuestionId": "8213",
    "sourceEdition": "2025–2026",
    "sourcePage": 8,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8188",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Engineer Requirements",
    "materia": "operaciones",
    "text": "If a flight engineer becomes incapacitated during flight, who may perform the flight engineer’s duties?",
    "options": [
      "The second in command only.",
      "Any flight crewmember, if qualified.",
      "Either pilot, if they have a flight engineer certificate."
    ],
    "correctIndex": 1,
    "explanation": "On each flight requiring a flight engineer, at least one flight crewmember, other than the flight engineer, must be qualified to provide emergency performance of the flight engineer’s functions for the safe completion of the flight if the flight engineer becomes ill or is otherwise incapacitated. A pilot need not hold a Flight Engineer Certificate to perform the flight engineer’s functions in such a situation. (PLT440, AA.I.G.K4) — 14 CFR §121.385",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-9 · question 8188 · ATM, ADX",
    "sourceQuestionId": "8188",
    "sourceEdition": "2025–2026",
    "sourcePage": 9,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8192",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Attendants",
    "materia": "operaciones",
    "text": "An airplane has seats for 149 passengers and eight crewmembers. What is the minimum number of flight attendants required with 97 passengers aboard?",
    "options": [
      "Four.",
      "Three.",
      "Two."
    ],
    "correctIndex": 1,
    "explanation": "For airplanes having a seating capacity of more than 100 passengers, each certificate holder shall provide at least two flight attendants plus one additional flight attendant for a unit (or partial unit) of 50 passenger seats above a seating capacity of 100 passengers. The number of flight attendants is determined by the number of installed passenger seats (not by the actual number of passengers on board). For an airplane with a seating capacity of 149 passengers, three flight attendants are required. (PLT389, AA.II.A.K7) — 14 CFR §121.391",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-9 · question 8192 · ATM, ADX",
    "sourceQuestionId": "8192",
    "sourceEdition": "2025–2026",
    "sourcePage": 9,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8193",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Attendants",
    "materia": "operaciones",
    "text": "When an air carrier airplane with a seating capacity of 187 has 137 passengers on board, what is the minimum number of flight attendants required?",
    "options": [
      "Five.",
      "Four.",
      "Three."
    ],
    "correctIndex": 1,
    "explanation": "For airplanes having a seating capacity of more than 100 passengers, each certificate holder shall provide at least two flight attendants plus one additional flight attendant for a unit (or partial unit) of 50 passenger seats above a seating capacity of 100 passengers. The number of flight attendants is determined by the number of installed passenger seats (not by the actual number of passengers on board). For an airplane with a seating capacity of 187 passengers, four flight attendants are required. (PLT389, AA.II.A.K7) — 14 CFR §121.391",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-9 · question 8193 · ATM, ADX",
    "sourceQuestionId": "8193",
    "sourceEdition": "2025–2026",
    "sourcePage": 9,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8201",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Attendants",
    "materia": "operaciones",
    "text": "What is the minimum number of flight attendants required on an airplane having a passenger seating capacity of 188 with only 117 passengers aboard?",
    "options": [
      "Five.",
      "Four.",
      "Three."
    ],
    "correctIndex": 1,
    "explanation": "For airplanes having a seating capacity of more than 100 passengers, each certificate holder shall provide at least two flight attendants plus one additional flight attendant for a unit (or partial unit) of 50 passenger seats above a seating capacity of 100 passengers. The number of flight attendants is determined by the number of installed passenger seats (not by the actual number of passengers on board). For an airplane with a seating capacity of 188 passengers, four flight attendants are required. (PLT389, AA.II.A.K7) — 14 CFR §121.391",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-10 · question 8201 · ATM, ADX",
    "sourceQuestionId": "8201",
    "sourceEdition": "2025–2026",
    "sourcePage": 10,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8202",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Attendants",
    "materia": "operaciones",
    "text": "What is the minimum number of flight attendants required on an airplane with a passenger seating capacity of 333 when 296 passengers are aboard?",
    "options": [
      "Seven.",
      "Six.",
      "Five."
    ],
    "correctIndex": 0,
    "explanation": "For airplanes having a seating capacity of more than 100 passengers, each certificate holder shall provide at least two flight attendants plus one additional flight attendant for a unit (or partial unit) of 50 passenger seats above a seating capacity of 100 passengers. The number of flight attendants is determined by the number of installed passenger seats (not by the actual number of passengers on board). For an airplane with a seating capacity of 333 passengers, seven flight attendants are required. (PLT389, AA.II.A.K7) — 14 CFR §121.391",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-10 · question 8202 · ATM, ADX",
    "sourceQuestionId": "8202",
    "sourceEdition": "2025–2026",
    "sourcePage": 10,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9339",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "A pilot, acting as second-in-command, successfully completes the instrument competency check specified in 14 CFR Part 61. How long does this pilot remain current if no further IFR flights are made?",
    "options": [
      "12 months.",
      "90 days.",
      "6 months."
    ],
    "correctIndex": 2,
    "explanation": "No pilot may act as PIC under IFR unless they have, within the preceding 6 calendar months in the aircraft category for the instrument privileges sought, logged at least six instrument approaches, performed holding procedures, and intercepted and tracked courses through the use of navigation systems, or passed an instrument competency check in the category of aircraft involved. (PLT442, AA.I.G.K1) — 14 CFR §61.57 Answer (A) is incorrect because, upon completion of an instrument competency check, a pilot will remain current for 6 months. Answer (B) is incorrect because ninety days defines the three takeoffs and landings experience required to carry passengers.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-11 · question 9339 · ATM, ATS, RTC",
    "sourceQuestionId": "9339",
    "sourceEdition": "2025–2026",
    "sourcePage": 11,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9344",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "To satisfy the minimum required instrument experience for IFR operations, a pilot must accomplish during the past 6 months at least",
    "options": [
      "six instrument approaches, holding, intercepting and tracking courses through the use of navigation systems in an approved flight training device/simulator or in the category of aircraft to be flown.",
      "six instrument approaches, three of which must be in the same category and class of aircraft to be flown, plus holding, intercepting and tracking courses in any aircraft.",
      "six instrument approaches and 6 hours of instrument time, three of which may be in a glider."
    ],
    "correctIndex": 0,
    "explanation": "No pilot may act as PIC under IFR unless they have, within the preceding 6 calendar months in the aircraft category for the instrument approaches, performed holding procedures, and intercepted and tracked courses through the use of navigation systems. (PLT442, AA.I.G.K1) — 14 CFR §61.57",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-12 · question 9344 · ATM, ATS, RTC",
    "sourceQuestionId": "9344",
    "sourceEdition": "2025–2026",
    "sourcePage": 12,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9342",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "What instrument flight time may be logged by a second-in-command of an aircraft requiring two pilots?",
    "options": [
      "All of the time the second-in-command is controlling the airplane solely by reference to flight instruments.",
      "One-half the time the flight is on an IFR flight plan.",
      "One-half the time the airplane is in actual IFR conditions."
    ],
    "correctIndex": 0,
    "explanation": "A pilot may log as instrument flight time only that time during which they operate the aircraft solely by reference to the instruments, under actual or simulated instrument flight conditions. (PLT409, AA.I.G.K1) — 14 CFR §61.51 Answers (B) and (C) are incorrect because only when the pilot is flying in actual or simulated instrument flying conditions and is the sole manipulator of the controls may the pilot log instrument flight time.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-12 · question 9342 · ALL",
    "sourceQuestionId": "9342",
    "sourceEdition": "2025–2026",
    "sourcePage": 12,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9342_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "An example of air carrier experience a pilot may use towards the 1,000 hours required to serve as PIC in Part 121 is flight time as an SIC",
    "options": [
      "in Part 121 operations.",
      "in Part 91, subpart K operations.",
      "in Part 135 operations."
    ],
    "correctIndex": 0,
    "explanation": "ATP certificate holders may use the 1,000 hours required to serve as PIC in Part 121 operations, as SIC in Part 121 operations, or PIC in Part 91 and 135 operations. (PLT450, AA.I.G.K4) — 14 CFR §121.436",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-12 · question 9342-1 · ALL",
    "sourceQuestionId": "9342-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 12,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9342_2",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "The holder of an ATP certificate with restricted privileges or an ATP certificate who also holds an aircraft type rating for the aircraft to be flown may act as",
    "options": [
      "a PIC for a Part 121 supplemental air carrier.",
      "a PIC for a Part 121 air carrier with 500 hours as a Part 121 SIC.",
      "an SIC for a Part 121 air carrier."
    ],
    "correctIndex": 2,
    "explanation": "The holder of a restricted priveleges ATP certificate may serve as SIC for Part 121 operations requiring less than three pilots. (PLT450, AA.I.G.K4) — 14 CFR §61.167",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-12 · question 9342-2 · ALL",
    "sourceQuestionId": "9342-2",
    "sourceEdition": "2025–2026",
    "sourcePage": 12,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9334",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "What recent experience is required to be eligible for the practical test for the original issue of a Category II authorization?",
    "options": [
      "Within the previous 6 months, six ILS approaches flown manually to the Category I DH.",
      "Within the previous 12 calendar months, six ILS approaches flown by use of an approach coupler to the Category I or Category II DH.",
      "Within the previous 6 months, six ILS approaches, three of which may be flown to the Category I DH by use of an approach coupler."
    ],
    "correctIndex": 2,
    "explanation": "To be eligible for Category II authorization, a pilot must have made at least six ILS approaches since the beginning of the sixth month before the test. These approaches must be under actual or simulated instrument flight conditions down to the minimum landing altitude for the ILS approach in the type aircraft in which the flight test is to be conducted. However, the approaches need not be conducted down to the decision heights authorized for Category II operations. At least three of these approaches must have been conducted manually, without the use of an approach coupler. (PLT442, AA.I.G.K1) — 14 CFR §61.67 Answer (A) is incorrect because only three of the approaches must be flown manually to Category I DH. Answer (B) is incorrect because the six ILS approaches must be flown within the preceding 6 calendar months and three of the approaches must be flown without an approach coupler.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-12 · question 9334 · ATM, ATS, RTC",
    "sourceQuestionId": "9334",
    "sourceEdition": "2025–2026",
    "sourcePage": 12,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9345",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "To be eligible for the practical test for the renewal of a Category II authorization, what recent instrument approach experience is required?",
    "options": [
      "Within the previous 6 months, six ILS approaches, three of which may be flown to the Category I DH by use of an approach coupler.",
      "Within the previous 6 months, six ILS approaches flown by use of an approach coupler to the Category I DH.",
      "Within the previous 12 calendar months, three ILS approaches flown by use of an approach coupler to the Category II DH."
    ],
    "correctIndex": 0,
    "explanation": "To be eligible for Category II authorization, a pilot must have made at least six ILS approaches since the beginning of the sixth month before the test. These approaches must be under actual or simulated instrument flight conditions down to the minimum landing altitude for the ILS approach in the type aircraft in which the flight test is to be conducted. However, the approaches need not be conducted down to the decision heights authorized for Category II operations. At least three of these appro aches must have been conducted manually, without the use of an approach coupler. (PLT442, AA.VI.E.K1) — 14 CFR §61.67 Answer (B) is incorrect because only three of the six approaches may be flown using an approach coupler. Answer (C) is incorrect because the requirement is for a total of six approaches, only three of which may be flown by the use of an approach coupler. The approaches are not required to be flown down to Category II DH. Also, they must have been flown within the preceding 6 calendar months.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-13 · question 9345 · ATM, ATS, RTC",
    "sourceQuestionId": "9345",
    "sourceEdition": "2025–2026",
    "sourcePage": 13,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9346",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "When may a Category II ILS limitation be removed?",
    "options": [
      "When three Cat II ILS approaches have been completed to a 150-foot decision height and landing.",
      "When six ILS approaches to Category II minimums and landing have been completed in the past 6 months.",
      "120 days after issue or renewal."
    ],
    "correctIndex": 0,
    "explanation": "Upon original issue, a CAT II authorization contains a limitation for CAT II operations of 1,600 feet RVR and a 150-foot DH. This limitation is removed when the holder shows that since the beginning of the sixth preceding month they have made three CAT II ILS approaches to a landing under actual or simulated instrument conditions with a 150-foot DH. (PLT407, AA.VI.E.K1) — 14 CFR §61.13",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-13 · question 9346 · ATM, ATS, RTC",
    "sourceQuestionId": "9346",
    "sourceEdition": "2025–2026",
    "sourcePage": 13,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9347",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "A Category II ILS pilot authorization, when originally issued, is normally limited to",
    "options": [
      "Category II operations not less than 1600 RVR and a 150-foot DH.",
      "pilots who have completed an FAA-approved Category II training program.",
      "Category II operations not less than 1200 RVR and a 100-foot DH."
    ],
    "correctIndex": 0,
    "explanation": "Upon original issue, a CAT II authorization contains a limitation for CAT II operations of 1,600 feet RVR and a 150-foot decision height. This limitation is removed when the holder shows that since the beginning of the sixth preceding month they have made three CAT II ILS approaches to a landing under actual or simulated instrument conditions with a 150-foot DH. (PLT407, AA.VI.E.K1) — 14 CFR §61.13 Answer (B) is incorrect because all pilots must undergo FAA-approved training for a CAT II authorization. The initial limitation is to RVR and DH for 6 months. Answer (C) is incorrect because a 1,200 RVR and a 100-foot DH are the CAT II minimums after the initial limitation is removed by the pilot completing three ILS approaches to a 150-foot DH in the preceding 6 months.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-13 · question 9347 · ALL",
    "sourceQuestionId": "9347",
    "sourceEdition": "2025–2026",
    "sourcePage": 13,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9348",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "What is the lowest decision height for which a Category II applicant can be certified during the original issuance of the authorization?",
    "options": [
      "100 feet AGL.",
      "150 feet AGL.",
      "200 feet AGL."
    ],
    "correctIndex": 1,
    "explanation": "Upon original issue, a CAT II authorization contains a limitation for CAT II operations of 1,600 feet RVR and a 150-foot DH. (PLT420, AA.VI.E.K1) — 14 CFR §61.13 Answer (A) is incorrect because a 100-foot DH is allowed only after completion of three CAT II ILS approaches to a 150-foot DH. Answer (C) is incorrect because 200 feet is the standard CAT I ILS DH.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-13 · question 9348 · ALL",
    "sourceQuestionId": "9348",
    "sourceEdition": "2025–2026",
    "sourcePage": 13,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8215",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "The training required by flight crewmembers who have not qualified and served in the same capacity on another airplane of the same group (e.g., turbojet powered) is",
    "options": [
      "upgrade training.",
      "transition training.",
      "initial training."
    ],
    "correctIndex": 2,
    "explanation": "Initial training is the training required for crewmembers and dispatchers who have not qualified and served in the same capacity on another airplane of the same group. (PLT407, AA.I.G.K4) — 14 CFR §121.400 Answer (A) is incorrect because upgrade training is required of a flight engineer or second-in-command when training for the next higher position in a particular airplane type. Answer (B) is incorrect because transition training is the training required for crewmembers and dispatchers who have qualified and served in the same capacity on another airplane of the same group.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-14 · question 8215 · ATM, ADX",
    "sourceQuestionId": "8215",
    "sourceEdition": "2025–2026",
    "sourcePage": 14,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8216",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "A crewmember who has served as second-in-command on a particular type airplane (e.g., B-727-100), may serve as pilot-in-command upon completing which training program?",
    "options": [
      "Upgrade training.",
      "Recurrent training.",
      "Initial training."
    ],
    "correctIndex": 0,
    "explanation": "Upgrade training is the training required for crewmembers who have qualified and served as second-in-command or flight engineer on a particular airplane type, before they serve as PIC or SIC, respectively, on that airplane. (PLT407, AA.I.G.K4) — 14 CFR §121.400 Answer (B) is incorrect because recurrent training is a periodic requirement of crewmembers who are qualified in their positions. Answer (C) is incorrect because initial training is the first training received for crewmembers who have not previously qualified and served in the same airplane group (e.g., turboprop or turbojet).",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-14 · question 8216 · ATM, ADX",
    "sourceQuestionId": "8216",
    "sourceEdition": "2025–2026",
    "sourcePage": 14,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8217",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "The training required for crewmembers or dispatchers who have been qualified and served in the same capacity on other airplanes of the same group is",
    "options": [
      "difference training.",
      "transition training.",
      "upgrade training."
    ],
    "correctIndex": 1,
    "explanation": "Transition training is the training required for crewmembers and dispatchers who have qualified and served in the same capacity on another airplane of the same group. (PLT407, AA.I.G.K4) — 14 CFR §121.400 Answer (A) is incorrect because difference training is required of a crewmember who is qualified on a particular type of airplane prior to becoming qualified in a variation of that same type. Answer (C) is incorrect because upgrade training is required of a crewmember who is qualified in a particular type of airplane and then desires to advance to the next higher position in that airplane, e.g., from copilot to pilot.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-14 · question 8217 · ATM, ADX",
    "sourceQuestionId": "8217",
    "sourceEdition": "2025–2026",
    "sourcePage": 14,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8205",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "A pilot-in-command must complete a proficiency check or simulator training within the preceding",
    "options": [
      "6 calendar months.",
      "12 calendar months.",
      "24 calendar months."
    ],
    "correctIndex": 0,
    "explanation": "For a person to serve as PIC, they must have completed a proficiency check within the preceding 12 calendar months and, in addition, within the preceding 6 calendar months, either a proficiency check or an approved simulator training course. (PLT407, AA.I.G.K4) — 14 CFR §121.441 Answer (B) is incorrect because a proficiency check is mandatory within the preceding 12 months. Additionally, a proficiency check or simulator training is required within the preceding 6 months. Answer (C) is incorrect because a 24-month time frame applies to pilots other than the PIC.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-14 · question 8205 · ATM, ADX",
    "sourceQuestionId": "8205",
    "sourceEdition": "2025–2026",
    "sourcePage": 14,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8207",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "A pilot flight crewmember, other than pilot-in-command, must have received a proficiency check or line-oriented simulator training within the preceding",
    "options": [
      "6 calendar months.",
      "12 calendar months.",
      "24 calendar months."
    ],
    "correctIndex": 2,
    "explanation": "Pilots other than the PIC must have completed either a proficiency check or a line oriented flight training course within the preceding 24 calendar months. (PLT407, AA.I.G.K4) — 14 CFR §121.441 Answer (A) is incorrect because 6 months is the requirement for PIC to complete a proficiency check or simulator training. Answer (B) is incorrect because 12 months is the requirement for pilots other than PIC to receive a proficiency check or “any other kind of simulation training” (not necessarily line oriented flight training).",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-14 · question 8207 · ATM",
    "sourceQuestionId": "8207",
    "sourceEdition": "2025–2026",
    "sourcePage": 14,
    "sourceCategories": [
      "ATM"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8210",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "What are the line check requirements for the pilot-in-command for a domestic air carrier?",
    "options": [
      "The line check is required every 12 calendar months in one of the types of airplanes to be flown.",
      "The line check is required only when the pilot is scheduled to fly into special areas and airports.",
      "The line check is required every 12 months in each type aircraft in which the pilot may fly."
    ],
    "correctIndex": 0,
    "explanation": "No certificate holder may use any person, nor may any person serve, as PIC of an airplane unless, within the preceding 12 calendar months that person has passed a line check in which they satisfactorily perform the duties and responsibilities of a PIC in one of the types of airplanes to be flown. (PLT442, AA.I.G.K4) — 14 CFR §121.440",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-15 · question 8210 · ATM, ADX",
    "sourceQuestionId": "8210",
    "sourceEdition": "2025–2026",
    "sourcePage": 15,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8214",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "If a flight crewmember completes a required annual flight check in December 2010 and the required annual recurrent flight check in January 2012, the latter check is considered to have been taken in",
    "options": [
      "November 2010.",
      "December 2011.",
      "January 2011."
    ],
    "correctIndex": 1,
    "explanation": "Whenever a crewmember or aircraft dispatcher who is required to take recurrent training, a flight check, or a competency check, takes the check or completes the training in the calendar month before or after the month in which that training or check is required, they are considered to have taken or completed it in the calendar month in which it was required. (PLT449, AA.I.G.K4) — 14 CFR §121.401",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-15 · question 8214 · ATM, ADX",
    "sourceQuestionId": "8214",
    "sourceEdition": "2025–2026",
    "sourcePage": 15,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8208",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "Which is one of the requirements that must be met by a required pilot flight crewmember in re-establishing recency of experience?",
    "options": [
      "At least one landing must be made with a simulated failure of the most critical engine.",
      "At least one ILS approach to the lowest ILS minimums authorized for the certificate holder and a landing from that approach.",
      "At least three landings must be made to a complete stop."
    ],
    "correctIndex": 1,
    "explanation": "When a pilot has not made three takeoffs and landings within the preceding 90 days, the pilot must make at least three takeoffs and landings in the type of airplane in which that person is to serve or in an advanced simulator. These takeoffs and landings must include: 1. At least one takeoff with a simulated failure of the most critical powerplant; 2. At least one landing from an ILS approach to the lowest ILS minimum authorized for the certificate holder; and 3. At least one landing to a full stop. (PLT442, AA.I.G.K4) — 14 CFR §121.439 Answer (A) is incorrect because at least one takeoff is required with a simulated failure of the most critical powerplant. Answer (C) is in correct because only one landing to a complete stop is required.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-15 · question 8208 · ATM",
    "sourceQuestionId": "8208",
    "sourceEdition": "2025–2026",
    "sourcePage": 15,
    "sourceCategories": [
      "ATM"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8209",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "What is one of the requirements that must be met by an airline pilot to re-establish recency of experience?",
    "options": [
      "At least one landing must be made from a circling approach.",
      "At least one full stop landing must be made.",
      "At least one precision approach must be made to the lowest minimums authorized for the certificate holder."
    ],
    "correctIndex": 1,
    "explanation": "When a pilot has not made three takeoffs and landings within the preceding 90 days, the pilot must make at least three takeoffs and landings in the type of airplane in which that pilot is to serve, or in an advanced simulator. These takeoffs and landings must include: 1. At least one takeoff with a simulated failure of the most critical powerplant; 2. At least one landing from an ILS approach to the lowest ILS minimum authorized for the certificate holder; and 3. At least one landing to a full stop. (PLT442, AA.I.G.K4) — 14 CFR §121.439 Answers (A) and (C) are incorrect because the only instrument approach required is an ILS approach to the lowest minimums authorized for the certificate holder.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-15 · question 8209 · ATM",
    "sourceQuestionId": "8209",
    "sourceEdition": "2025–2026",
    "sourcePage": 15,
    "sourceCategories": [
      "ATM"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8289",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "When a pilot’s flight time consists of 80 hours pilot-in-command in a particular type airplane, how does this affect the minimums for the destination airport?",
    "options": [
      "Has no effect on destination but alternate minimums are no less than 300 and 1.",
      "Minimums are decreased by 100 feet and 1/2 mile.",
      "Minimums are increased by 100 feet and 1/2 mile."
    ],
    "correctIndex": 2,
    "explanation": "If the pilot-in-command has not served 100 hours as PIC in operations under Part 121 in the type of airplane they are operating, the MDA or DH and visibility landing minimums in the certificate holder’s operations specifications for regular, provisional, or refueling airports are increased by 100 feet and 1/2 mile (or the RVR equivalent). (PLT443, AA.I.G.K4) — 14 CFR §121.652",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-16 · question 8289 · ATM, ADX",
    "sourceQuestionId": "8289",
    "sourceEdition": "2025–2026",
    "sourcePage": 16,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8285",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "Category II ILS operations below 1600 RVR and a 150-foot DH may be approved after the pilot-in-command has",
    "options": [
      "logged 90 hours flight time, 10 takeoffs and landings in make and model airplane and three Category II ILS approaches in actual or simulated IFR conditions with 150-foot DH since the beginning of the sixth preceding month, in operations under 14 CFR parts 91 and 121.",
      "made at least six Category II approaches in actual IFR conditions with 100-foot DH within the preceding 12 calendar months.",
      "logged 100 hours flight time in make and model airplane under 14 CFR part 121 and three Category II ILS approaches in actual or simulated IFR conditions with 150-foot DH since the beginning of the sixth preceding month."
    ],
    "correctIndex": 2,
    "explanation": "If the pilot-in-command of an airplane has not served 100 hours as PIC in operations under Part 121 in the type of airplane they are operating, the MDA or DH and visibility landing minimums in the certificate holder’s operations specifications for regular, provisional, or refueling airports are increased by 100 feet and 1/2 mile (or the RVR equivalent). In addition, CAT II minimums and the sliding scale do not apply. Upon original issue, a CAT II authorization contains a limitation for CAT II operations of 1,600 feet RVR and a 150-foot DH. This limitation is removed when the holder shows that since the beginning of the sixth preceding month they have made three CAT II ILS approaches to a landing under actual or simulated instrument conditions with a 150-foot DH. (PLT444, AA.VI.E.K1) — 14 CFR §121.652 and §61.13",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-16 · question 8285 · ATM",
    "sourceQuestionId": "8285",
    "sourceEdition": "2025–2026",
    "sourcePage": 16,
    "sourceCategories": [
      "ATM"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8230",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Experience and Training Requirements",
    "materia": "operaciones",
    "text": "To remain current as an aircraft dispatcher, a person must, in addition to other requirements,",
    "options": [
      "within the preceding 12 calendar months, spend 2.5 hours observing flight deck operations, plus two additional takeoff and landings, in one of the types of airplanes in each group he/she is to dispatch.",
      "within the preceding 12 calendar months, spend at least 5 hours observing flight deck operations in one of the types of airplanes in each group he/ she is to dispatch.",
      "within the preceding 12 calendar months, spend at least 5 hours observing flight deck operations in each type of airplane, in each group that he/ she is to dispatch."
    ],
    "correctIndex": 1,
    "explanation": "No domestic or flag air carrier may use any person as an aircraft dispatcher unless, within the preceding 12 calendar months, they have satisfactorily completed operating familiarization consisting of at least 5 hours observing operations from the flight deck under Part 121 in one of the types of airplanes in each group they intend to dispatch. (PLT450) — 14 CFR §121.463",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-16 · question 8230 · ADX",
    "sourceQuestionId": "8230",
    "sourceEdition": "2025–2026",
    "sourcePage": 16,
    "sourceCategories": [
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8082",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "What are the minimum certificate and rating requirements for the pilot-in-command of a multiengine airplane being operated by a commuter air carrier?",
    "options": [
      "Airline transport pilot; airplane category; multiengine class.",
      "Commercial pilot; airplane category; multiengine class; instrument rating; airplane type rating, if required.",
      "Airline transport pilot; airplane category; multiengine class; airplane type rating, if required."
    ],
    "correctIndex": 2,
    "explanation": "No certificate holder may use a person, nor may any person serve, as PIC in passenger-carrying operations of a turbojet airplane, or an airplane having a passenger seating configuration, excluding any crewmember seat, of 10 seats or more, or a multi-engine airplane being operated by commuter operations, unless that person holds an Airline Transport Pilot Certificate with appropriate category and class ratings and, if required, an appropriate type rating for that aircraft. (PLT443, AA.I.G.K5) — 14 CFR §135.243",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-17 · question 8082 · ATS",
    "sourceQuestionId": "8082",
    "sourceEdition": "2025–2026",
    "sourcePage": 17,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8083",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "What are the minimum certificate and rating requirements for the pilot-in-command of a multiengine airplane in commuter air carrier service under IFR?",
    "options": [
      "Airline transport pilot of any category; multiengine class rating.",
      "Airline transport pilot; airplane category; multiengine class rating; airplane type rating, if required.",
      "Commercial pilot; airplane category; multiengine class and instrument rating."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may use a person, nor may any person serve, as PIC in passenger-carrying operations of a turbojet airplane, or an airplane having a passenger seating configuration, excluding any crewmember seat, of 10 seats or more, or a multi-engine airplane being operated by commuter operations, unless that person holds an Airline Transport Pilot Certificate with appropriate category and class ratings and, if required, an appropriate type rating for that aircraft. (PLT443, AA.I.G.K5) — 14 CFR §135.243",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-17 · question 8083 · ATS",
    "sourceQuestionId": "8083",
    "sourceEdition": "2025–2026",
    "sourcePage": 17,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8094",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "Which takeoff computation must not exceed the length of the runway plus the length of the stopway for a turbine-engine-powered small transport category airplane?",
    "options": [
      "Takeoff distance.",
      "Acceleration-stop distance.",
      "Acceleration-climb distance."
    ],
    "correctIndex": 1,
    "explanation": "The accelerate-stop distance, as defined in 14 CFR §25.109, must not exceed the length of the runway plus the length of any stopway. (PLT456, AA.I.G.K5) — 14 CFR §135.379 and §135.397",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-17 · question 8094 · ATS",
    "sourceQuestionId": "8094",
    "sourceEdition": "2025–2026",
    "sourcePage": 17,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8100",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A person is assigned as pilot-in-command to fly both single-engine and multiengine airplanes and has passed the initial instrument proficiency check in a multiengine airplane. Which requirement applies regarding each succeeding instrument check?",
    "options": [
      "The instrument check must be taken every 6 calendar months in both a single-engine and a multiengine airplane.",
      "The instrument check must be taken alternately in single-engine and multiengine airplanes every 6 calendar months.",
      "The instrument check may be taken in either a single-engine or multiengine airplane if taken at intervals of 6 calendar months."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may use a pilot, nor may any person serve as PIC of an aircraft under IFR unless, since the beginning of the sixth calendar month before that service, that pilot has passed an instrument proficiency check given by the FAA or authorized check pilot. If the PIC is assigned to both single-engine aircraft and multi-engine aircraft, that pilot must initially take the instrument proficiency check in a multi-engine aircraft and each succeeding check alternately in single-engine and multi-engine aircraft. (PLT442, AA.I.G.K5) — 14 CFR §135.297",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-17 · question 8100 · ATS",
    "sourceQuestionId": "8100",
    "sourceEdition": "2025–2026",
    "sourcePage": 17,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8103",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A person is acting as pilot-in-command of a multiengine, turboprop-powered airplane operated in passenger-carrying service by a commuter air carrier. If eight takeoffs and landings are accomplished in that make and basic model, which additional pilot-in-command experience meets the requirement for designation as pilot-in-command?",
    "options": [
      "7 hours, and two takeoffs and landing.",
      "10 hours, and three takeoffs and landings.",
      "10 hours, and two takeoffs and one landings."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may use any person, nor may any person serve, as PIC of an aircraft operated by commuter operations in passenger-carrying operations, unless that person has completed, on that make and basic model aircraft and in that crewmember position the following operating experience: 1. Aircraft, single-engine—10 hours; 2. Aircraft, multi-engine, reciprocating engine-powered—15 hours; 3. Aircraft, multi-engine, turbine engine-powered—20 hours; or 4. Airplane, turbojet-powered—25 hours. The hours of operating experience may be reduced to not less than 50 percent of the hours required above by the substitution of one additional takeoff and landing for each hour of flight. (PLT407, AA.I.G.K5) — 14 CFR §135.244",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-18 · question 8103 · ATS",
    "sourceQuestionId": "8103",
    "sourceEdition": "2025–2026",
    "sourcePage": 18,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8107",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "What are the minimum certificate and rating requirements for the pilot-in-command of a turbojet airplane with two engines being operated by a Commuter Air Carrier?",
    "options": [
      "Airline transport pilot; airplane category; multiengine class rating; airplane type rating, if required.",
      "Airline transport pilot of any category; multiengine class rating; airplane type rating.",
      "Commercial pilot; airplane category; multiengine class rating; instrument rating; airplane type rating."
    ],
    "correctIndex": 0,
    "explanation": "No certificate holder may use a person, nor may any person serve, as PIC in passenger-carrying operations of a turbojet airplane, or an airplane having a passenger seating configuration, excluding any crewmember seat, of 10 seats or more, or a multi-engine airplane being operated by commuter operations unless that person holds an Airline Transport Pilot Certificate with appropriate category and class ratings and, if required, an appropriate type rating for that aircraft. (PLT443, AA.I.G.K5) — 14 CFR §135.243",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-18 · question 8107 · ATS",
    "sourceQuestionId": "8107",
    "sourceEdition": "2025–2026",
    "sourcePage": 18,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8108",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A person is acting as pilot-in-command of a multi-engine, reciprocating engine powered airplane operated in passenger-carrying service by a commuter air carrier. If five takeoffs and landings have been accomplished in that make and basic model, which additional pilot-in-command experience meets the requirement for designation as the pilot-in-command?",
    "options": [
      "Two takeoffs and landings, and 8 hours.",
      "Five takeoffs and landings, and 5 hours.",
      "Three takeoffs and landings, and 7 hours."
    ],
    "correctIndex": 0,
    "explanation": "No certificate holder may use any person, nor may any person serve, as PIC of an aircraft operated by commuter operations in passenger-carrying operations, unless that person has completed, on that make and basic model aircraft and in that crewmember position the following operating experience: 1. Aircraft, single-engine—10 hours; 2. Aircraft, multi-engine, reciprocating engine-powered—15 hours; 3. Aircraft, multi-engine, turbine engine-powered—20 hours; or 4. Airplane, turbojet-powered—25 hours. The hours of operating experience may be reduced to not less than 50 percent of the hours required above by the substitution of one additional takeoff and landing for each hour of flight. (PLT407, AA.I.G.K5) — 14 CFR §135.244",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-18 · question 8108 · ATS",
    "sourceQuestionId": "8108",
    "sourceEdition": "2025–2026",
    "sourcePage": 18,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8109",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A person is acting as pilot-in-command of a turbojet powered airplane operated in passenger-carrying service by a commuter air carrier. If 10 takeoffs and landings have been accomplished in that make and basic model, which additional pilot-in-command experience meets the requirement for designation as pilot-in-command?",
    "options": [
      "10 hours.",
      "15 hours.",
      "10 hours, and five takeoffs and landings."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may use any person, nor may any person serve, as PIC of an aircraft operated by commuter operations in passenger-carrying operations, unless that person has completed, on that make and basic model aircraft and in that crewmember position the following operating experience: 1. Aircraft, single-engine—10 hours; 2. Aircraft, multi-engine, reciprocating engine-powered—15 hours; 3. Aircraft, multi-engine, turbine engine-powered—20 hours; or 4. Airplane, turbojet-powered—25 hours. The hours of operating experience may be reduced to not less than 50 percent of the hours required above by the substitution of one additional takeoff and landing for each hour of flight. (PLT407, AA.I.G.K5) — 14 CFR §135.244",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-18 · question 8109 · ATS",
    "sourceQuestionId": "8109",
    "sourceEdition": "2025–2026",
    "sourcePage": 18,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8110",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A pilot’s experience includes 8 hours in a parti cular make and basic model multiengine, turboprop airplane while acting as pilot-in-command. Which additional pilot-in-command experience meets the requirements for designation as pilot-in-command of that airplane when operated by a commuter air carrier in passenger-carrying service?",
    "options": [
      "Twelve takeoffs and landings.",
      "Five takeoffs and landings, and 2 hours.",
      "Ten takeoffs and landings, and 2 hours."
    ],
    "correctIndex": 2,
    "explanation": "No certificate holder may use any person, nor may any person serve, as PIC of an aircraft operated by commuter operations in passenger-carrying operations, unless that person has completed, on that make and basic model aircraft and in that crewmember position the following operating experience: 1. Aircraft, single-engine—10 hours; 2. Aircraft, multi-engine, reciprocating engine-powered—15 hours; 3. Aircraft, multi-engine, turbine engine-powered—20 hours; or 4. Airplane, turbojet-powered—25 hours. The hours of operating experience may be reduced to not less than 50 percent of the hours required above by the substitution of one additional takeoff and landing for each hour of flight. (PLT407, AA.I.G.K5) — 14 CFR §135.244",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-19 · question 8110 · ATS",
    "sourceQuestionId": "8110",
    "sourceEdition": "2025–2026",
    "sourcePage": 19,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8111",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A person is acting as pilot-in-command of a single-engine airplane operated in passenger-carrying service by a commuter air carrier. If six takeoffs and landings have been accomplished in that make and basic model, which additional pilot-in-command experience meets the requirement for designation as pilot-in-command?",
    "options": [
      "4 hours",
      "5 hours",
      "6 hours"
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may use any person, nor may any person serve, as PIC of an aircraft operated by commuter operations in passenger-carrying operations, unless that person has completed, on that make and basic model aircraft and in that crewmember position the following operating experience: 1. Aircraft, single-engine—10 hours; 2. Aircraft, multi-engine, reciprocating engine-powered—15 hours; 3. Aircraft, multi-engine, turbine engine-powered—20 hours; or 4. Airplane, turbojet-powered—25 hours. The hours of operating experience may be reduced to not less than 50 percent of the hours required above by the substitution of one additional takeoff and landing for each hour of flight. (PLT407, AA.I.G.K5) — 14 CFR §135.244",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-19 · question 8111 · ATS",
    "sourceQuestionId": "8111",
    "sourceEdition": "2025–2026",
    "sourcePage": 19,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9618",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "(Refer to Figure 301.) The PIC (single pilot 135 with A/P) of PTZ 70 has less than 100 hours of PIC time in the BE 1900. Due to BUF weather being 100 feet, 1/4 mile in blowing snow, which is below landing minimums, the PIC requested and received clearance to SYR, the filed alternate. Under Part 135, what are the PIC’s minimums at SYR for the ILS RWY 10?",
    "options": [
      "800/2.",
      "719/42.",
      "619/50."
    ],
    "correctIndex": 1,
    "explanation": "The MDA or DA/DH and visibility landing minimums prescribed in 14 CFR Part 97 or in the operator’s operations specifications are increased by 100 feet and 1/2 mile respectively, but not to exceed the ceiling and visibility minimums for that airport when used as an alternate airport, for each PIC of a turbine-powered airplane who has not served at least 100 hours as PIC in that type of airplane. Since the pilot is operating with an autopilot, as noted in the question with “single pilot 135 with A/P,” the chart notes indicate that an RVR of 1800 is authorized. Adding a 1/2 mile (or 2400 RVR) to that would make the visibility requirement 4200 RVR. (PLT407, AA.I.G.K5) — 14 CFR §135.225",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-19 · question 9618 · ATS",
    "sourceQuestionId": "9618",
    "sourceEdition": "2025–2026",
    "sourcePage": 19,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": [
      "atp_2026_figure-301.png"
    ]
  },
  {
    "id": "q_la_ATP_2026_8018",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "Which person, other than the second in command, may the pilot-in-command permit to manipulate the flight controls?",
    "options": [
      "A member of the National Transportation Safety Board who holds a pilot certificate appropriate for the aircraft.",
      "An authorized FAA safety representative who is qualified in the aircraft, and is checking flight operations.",
      "A pilot employed by an engineering firm who is authorized by the certificate holder to conduct flight tests."
    ],
    "correctIndex": 1,
    "explanation": "No pilot-in-command may allow any person to manipulate the controls of an aircraft during flight unless that person is: 1. A pilot employed by the certificate holder and qualified in the aircraft; or 2. An authorized safety representative of the Administrator who has permission of the PIC, is qualified in the aircraft, and is checking flight operations. (PLT444, AA.I.G.K5) — 14 CFR §135.115",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-20 · question 8018 · ATS, RTC",
    "sourceQuestionId": "8018",
    "sourceEdition": "2025–2026",
    "sourcePage": 20,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8026",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A flight attendant crewmember is required on aircraft having a passenger seating configuration, excluding any pilot seat, of",
    "options": [
      "15 or more.",
      "19 or more.",
      "20 or more"
    ],
    "correctIndex": 2,
    "explanation": "No certificate holder may operate an aircraft that has a passenger seating configuration, excluding any pilot seat, of more than 19 unless there is a flight attendant crewmember on board the aircraft. (PLT440, AA.I.G.K5) — 14 CFR §135.107",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-20 · question 8026 · ATS, RTC",
    "sourceQuestionId": "8026",
    "sourceEdition": "2025–2026",
    "sourcePage": 20,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8027",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "Before each takeoff, the pilot-in-command of an aircraft carrying passengers shall ensure that all passengers have been orally briefed on the",
    "options": [
      "location of normal and emergency exits, oxygen masks, and life preservers.",
      "use of safety belts, location and operation of fire extinguishers, and smoking.",
      "use of seatbelts, smoking, and location and use of survival equipment."
    ],
    "correctIndex": 1,
    "explanation": "Before each takeoff the pilot-in-command shall ensure that all passengers have been orally briefed on: 1. Smoking; 2. Use of seatbelts; 3. The placement of seat backs in an upright position before takeoff and landing; 4. Location and means of opening the passenger entry door and emergency exits; 5. Location of survival equipment; 6. If the flight involves extended overwater operation, ditching procedures and the use of required flotation equipment; 7. If the flight involves operations above 12,000 feet MSL, the normal and emergency use of oxygen; and 8. Location and operation of fire extinguishers. (PLT384, AA.I.G.K5) — 14 CFR §135.117",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-20 · question 8027 · ATS, RTC",
    "sourceQuestionId": "8027",
    "sourceEdition": "2025–2026",
    "sourcePage": 20,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8028",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "Before takeoff, the pilot-in-command of an aircraft carrying passengers shall ensure that all passengers have been orally briefed on the normal and emergency use of oxygen",
    "options": [
      "if the flight involves operations above 12,000 feet MSL.",
      "regardless of the altitude at which the flight will operate.",
      "if the flight involves operations at or above 12,000 feet MSL for more than 30 minutes."
    ],
    "correctIndex": 0,
    "explanation": "Before each takeoff the pilot-in-command shall ensure that all passengers have been orally briefed on the normal and emergency use of oxygen if the flight in volves operations above 12,000 feet MSL. (PLT438, AA.I.G.K5) — 14 CFR §135.117",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-20 · question 8028 · ATS, RTC",
    "sourceQuestionId": "8028",
    "sourceEdition": "2025–2026",
    "sourcePage": 20,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8029",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "The oral before flight briefing required on passenger-carrying aircraft shall be",
    "options": [
      "supplemented by an actual demonstration of emergency exit door operation by a crewmember.",
      "presented by the pilot-in-command or another flight crewmember, as a crewmember demonstrates the operation of the emergency equipment.",
      "conducted by a crewmember or the pilot-in-command and supplemented by printed cards for the use of each passenger."
    ],
    "correctIndex": 2,
    "explanation": "The required oral briefing must be given by the pilot-in-command or other crewmember. It must be supplemented by printed cards which must be carried in the aircraft in locations convenient for the use of each passenger. (PLT384, AA.I.G.K5) — 14 CFR §135.117",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-21 · question 8029 · ATS, RTC",
    "sourceQuestionId": "8029",
    "sourceEdition": "2025–2026",
    "sourcePage": 21,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8034",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A commuter air carrier certificate holder plans to assign a pilot as pilot-in-command of an aircraft having eight passenger seats to be used in passenger-carrying operations. Which experience requirement must that pilot meet if the aircraft is to be flown with an operative approved autopilot and no second-in-command?",
    "options": [
      "100 hours as pilot-in-command in the category, class, and type.",
      "50 hours and 10 landings as pilot-in-command in the make and model.",
      "100 hours as pilot-in-command in the make and model."
    ],
    "correctIndex": 2,
    "explanation": "When using an autopilot in lieu of a second-in-command in commuter airline passenger-carrying operations, the pilot-in-command must have at least 100 hours of PIC time in the make and model of aircraft to be flown. (PLT407, AA.I.G.K5) — 14 CFR §135.105",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-21 · question 8034 · ATS, RTC",
    "sourceQuestionId": "8034",
    "sourceEdition": "2025–2026",
    "sourcePage": 21,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8035",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "Which is a condition that must be met by a commuter air carrier certificate holder to have an aircraft approved for operation with an autopilot system and no second-in-command?",
    "options": [
      "The passenger seating configuration is 10 or more, including any pilot seat.",
      "The autopilot system is capable of operating the controls to maintain flight and to maneuver the aircraft about the three axes.",
      "The operation is restricted to VFR or VFR over-the-top."
    ],
    "correctIndex": 1,
    "explanation": "The autopilot used in lieu of a second-in-command must be capable of operating the aircraft controls to maintain flight and maneuver it about the three axes. (PLT443, AA.I.G.K5) — 14 CFR §135.105",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-21 · question 8035 · ATS, RTC",
    "sourceQuestionId": "8035",
    "sourceEdition": "2025–2026",
    "sourcePage": 21,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8036",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "An autopilot may not be used in place of a second-in-command in any aircraft",
    "options": [
      "being operated in commuter air carrier service.",
      "having a passenger seating configuration, excluding any pilot’s seat, of 10 seats or more.",
      "having a total seating capacity of 10 or more seats and being operated in commuter air service."
    ],
    "correctIndex": 1,
    "explanation": "Unless two pilots are required for operations under VFR, a person may operate an aircraft without a second-in-command, if it is equipped with an operative approved autopilot system and the use of that system is authorized by appropriate operations specifications. No certificate holder may operate an aircraft without a second-in-command if that aircraft has a passenger seating configuration, excluding any pilot seat, of 10 seats or more. (PLT443, AA.I.G.K5) — 14 CFR §135.99 and §135.105",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-21 · question 8036 · ATS, RTC",
    "sourceQuestionId": "8036",
    "sourceEdition": "2025–2026",
    "sourcePage": 21,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8044",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "What is the minimum passenger seating configuration that requires a second-in-command?",
    "options": [
      "15 seats.",
      "12 seats.",
      "10 seats."
    ],
    "correctIndex": 2,
    "explanation": "No certificate holder may operate an aircraft without a second-in-command if that aircraft has a passenger seating configuration, excluding any pilot seat, of 10 seats or more. (PLT443, AA.I.G.K5) — 14 CFR §135.99",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-21 · question 8044 · ATS, RTC",
    "sourceQuestionId": "8044",
    "sourceEdition": "2025–2026",
    "sourcePage": 21,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8076",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "When is a pilot not required to keep the shoulder harness fastened during takeoff and landing while at a pilot station?",
    "options": [
      "When operating an aircraft having a passenger seating configuration, excluding any pilot seat, of 10 seats or less.",
      "When the pilot cannot perform the required duties with the shoulder harness fastened.",
      "When serving as pilot-in-command or second in command of an aircraft having a total seating capacity of eight seats or less."
    ],
    "correctIndex": 1,
    "explanation": "Each flight crewmember occupying a station equipped with a shoulder harness must fasten the shoulder harness during takeoff and landing, except that the shoulder harness may be unfastened if the crewmember is unable to perform required duties with the shoulder harness fastened. (PLT464, AA.I.G.K5) — 14 CFR §135.171",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-22 · question 8076 · ATS, RTC",
    "sourceQuestionId": "8076",
    "sourceEdition": "2025–2026",
    "sourcePage": 22,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8095",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "To serve as pilot-in-command in an IFR operation, a person must have passed a line check",
    "options": [
      "consisting of a flight over the route to be flown, with at least three instrument approaches at representative airports, within the past 12 calendar months, in one type of aircraft which that pilot is to fly.",
      "within the past 12 months, which include a portion of a civil airway and one instrument approach at one representative airport, in one of the types of aircraft which that pilot is to fly.",
      "since the beginning of the 12th month before that service, which included at least one flight over a civil airway, or approved off-airway route, or any portion of either, in one type of aircraft which that pilot is to fly."
    ],
    "correctIndex": 2,
    "explanation": "No certificate holder may use a pilot, nor may any person serve, as PIC of a flight unless, since the beginning of the twelfth calendar month before that service, that pilot has passed a flight check (line check) in one of the types of aircraft that pilot is to fly. The flight check shall: 1. Be given by an approved check pilot or by the FAA; 2. Consist of at least one flight over one route segment; and 3. Include takeoffs and landings at one or more representative airports; 4. For a pilot authorized for IFR operations, at least one flight shall be flown over a civil airway, an approved off-airway route, or a portion of either of them. (PLT442, AA.I.G.K5) — 14 CFR §135.299",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-22 · question 8095 · ATS, RTC",
    "sourceQuestionId": "8095",
    "sourceEdition": "2025–2026",
    "sourcePage": 22,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8096",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "What are the minimum requirements for the line check required of each pilot-in-command authorized for IFR air taxi operations? The line check shall be given over",
    "options": [
      "one route segment in each type of airplane the pilot is to fly and includes takeoffs and landings at one or more representative airports.",
      "a civil airway or an approved off-airway route, or a portion of either of them, in one type of airplane the pilot is to fly and includes takeoffs and landings at one or more representative airports.",
      "a civil airway or an approved off-airway route in each make and model airplane the pilot is to fly and includes takeoffs and landings at one or more representative airports."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may use a pilot, nor may any person serve, as PIC of a flight unless, since the beginning of the twelfth calendar month before that service, that pilot has passed a flight check (line check) in one of the types of aircraft that pilot is to fly. The flight check shall: 1. Be given by an approved check pilot or by the FAA; 2. Consist of at least one flight over one route segment; and 3. Include takeoffs and landings at one or more representative airports; 4. For a pilot authorized for IFR operations, at least one flight shall be flown over a civil airway, an approved off-airway route, or a portion of either of them. (PLT442, AA.I.G.K5) — 14 CFR §135.299",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-22 · question 8096 · ATS, RTC",
    "sourceQuestionId": "8096",
    "sourceEdition": "2025–2026",
    "sourcePage": 22,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8097",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "No certificate holder may use a person as pilot-in-command unless that person has passed a line check",
    "options": [
      "since the beginning of the 12th month before serving as pilot-in-command.",
      "since the beginning of the 6th month before serving as pilot-in-command.",
      "within the past 6 months."
    ],
    "correctIndex": 0,
    "explanation": "No certificate holder may use a pilot, nor may any person serve, as PIC of a flight unless, since the beginning of the twelfth calendar month before that service, that pilot has passed a flight check (line check) in one of the types of aircraft that pilot is to fly. (PLT442, AA.I.G.K5) — 14 CFR §135.299",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-22 · question 8097 · ATS, RTC",
    "sourceQuestionId": "8097",
    "sourceEdition": "2025–2026",
    "sourcePage": 22,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8098",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A person may act as pilot-in-command of both type A and type B aircraft under IFR, if an instrument proficiency check has been passed in",
    "options": [
      "either type A or B since the beginning of the 12th month before time to serve.",
      "type A since the beginning of the 12th month, and in type B since the beginning of the 6th month before time to serve.",
      "type A since the beginning of the 12th month, and in type B since the beginning of the 24th month before time to serve."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may use a pilot, nor may any person serve, as PIC of an aircraft under IFR unless, since the beginning of the sixth calendar month before that service, that pilot has passed an instrument proficiency check given by the FAA or authorized check pilot. If the PIC is assigned to pilot more than one type of aircraft, that pilot must take the instrument proficiency check for each type of aircraft to which that pilot is assigned in rotation, but not more than one flight check in each period. (PLT442, AA.I.G.K5) — 14 CFR §135.297",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-23 · question 8098 · ATS, RTC",
    "sourceQuestionId": "8098",
    "sourceEdition": "2025–2026",
    "sourcePage": 23,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8099",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A pilot-in-command is authorized to use an autopilot system in place of a second-in-command. During the instrument proficiency check, that person is required to demonstrate (without a second-in-command) the ability to",
    "options": [
      "comply with complex ATC instructions with, but not without, the autopilot.",
      "properly conduct air-ground communications with, but not without, the autopilot.",
      "properly conduct instrument operations competently both with, and without, the autopilot."
    ],
    "correctIndex": 2,
    "explanation": "If the pilot-in-command is authorized to use an autopilot system in place of a second-in-command, that pilot must show during the required instrument proficiency check, that the pilot is able both with and without using the autopilot to: 1. Conduct instrument operations competently; and 2. Properly conduct air-ground communications and comply with complex air traffic control instructions. (PLT442, AA.I.G.K5) — 14 CFR §135.297",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-23 · question 8099 · ATS, RTC",
    "sourceQuestionId": "8099",
    "sourceEdition": "2025–2026",
    "sourcePage": 23,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8101",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A person may not serve as pilot-in-command in an IFR operation unless that person has passed an",
    "options": [
      "aircraft competency, an instrument proficiency, and autopilot check within the previous 6 calendar months prior to the date to serve.",
      "instrument proficiency check in the airplane in which to serve, or in an approved aircraft simulator, within the previous 12 calendar months.",
      "instrument proficiency check under actual or simulated IFR conditions, since the beginning of the 6th calendar month prior to the date to serve."
    ],
    "correctIndex": 2,
    "explanation": "No certificate holder may use a pilot, nor may any person serve as PIC of an aircraft under IFR unless, since the beginning of the sixth calendar month before that service, that pilot has passed an instrument proficiency check given by the FAA or authorized check pilot. If the PIC is assigned to both single-engine aircraft and multi-engine aircraft, that pilot must initially take the instrument proficiency check in a multi-engine aircraft and each succeeding check alternately in single-engine and multi-engine aircraft. (PLT442, AA.I.G.K5) — 14 CFR §135.297",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-23 · question 8101 · ATS, RTC",
    "sourceQuestionId": "8101",
    "sourceEdition": "2025–2026",
    "sourcePage": 23,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8102",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "A pilot-in-command who is authorized to use an autopilot system, in place of a second-in-command, may take the autopilot check",
    "options": [
      "concurrently with the instrument proficiency check, but at 12 month intervals.",
      "in any aircraft appropriately equipped, providing the check is taken at 6 month intervals.",
      "concurrently with the competency check, providing the check is taken at 12 month intervals."
    ],
    "correctIndex": 0,
    "explanation": "If the pilot-in-command is authorized to use an autopilot system in place of a second-in-command, that pilot must show during the required instrument proficiency check, that the pilot is able both with and without using the autopilot to: 1. Conduct instrument operations competently; and 2. Properly conduct air-ground communications and comply with complex air traffic control instructions. (PLT424, AA.I.G.K5) — 14 CFR §135.297",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-23 · question 8102 · ATS, RTC",
    "sourceQuestionId": "8102",
    "sourceEdition": "2025–2026",
    "sourcePage": 23,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8104",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "Pilot flight time limitations under 14 CFR Part 135 are based",
    "options": [
      "on the flight time accumulated in any commercial flying.",
      "solely on flight time accumulated in air taxi operations.",
      "solely on flight time accumulated during commercial flying, in the last 30 day and/or 12 month period."
    ],
    "correctIndex": 0,
    "explanation": "Pilot flight time limitations are based on the flight time accumulated under Part 135 and any other commercial flying time. (PLT409, AA.I.G.K5) — 14 CFR §135.265",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-24 · question 8104 · ATS, RTC",
    "sourceQuestionId": "8104",
    "sourceEdition": "2025–2026",
    "sourcePage": 24,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8105",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "No person may serve, as second-in-command of an aircraft (under Part 135), unless they hold a Commercial Pilot Certificate with the appropriate category, class rating and an instrument rating. For flight under IFR, that person must have accomplished within the last 6 months, the recent instrument requirements of",
    "options": [
      "using the navigation systems for interception and tracking of courses, 6 instrument low approaches and holding.",
      "using the navigation systems to intercept and track 3 inbound/3 outbound courses, 6 holding patterns and 6 instrument approaches.",
      "holding procedures, using the navigation systems for intercepting and tracking courses, and 6 instrument approaches."
    ],
    "correctIndex": 2,
    "explanation": "To act as second-in-command under IFR, a person must meet the recent instrument experience requirements of Part 61. These requirements are: in the last 6 months, the pilot must have logged six instrument approaches, performed holding procedures, and intercepted and tracked courses through the use of navigation systems. (PLT442, AA.I.G.K5) — 14 CFR §135.245",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-24 · question 8105 · ATS, RTC",
    "sourceQuestionId": "8105",
    "sourceEdition": "2025–2026",
    "sourcePage": 24,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8106",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "With regard to flight crewmember duties, which operations are considered to be in the “critical phase of flight”?",
    "options": [
      "All ground operations involving taxi, takeoff, landing, and all other operations conducted below 10,000 feet MSL, including cruise flight.",
      "Descent, approach, landing, and taxi operations, irrespective of altitudes MSL.",
      "All ground operations involving taxi, takeoff, landing, and all other operations conducted below 10,000 feet, excluding cruise flight."
    ],
    "correctIndex": 2,
    "explanation": "For the purpose of this section, critical phases of flight include all ground operations involving taxi, takeoff and landing, and all other flight operations conducted below 10,000 feet, except cruise flight. (PLT029, AA.I.G.K5) — 14 CFR §135.100",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-24 · question 8106 · ATS, RTC",
    "sourceQuestionId": "8106",
    "sourceEdition": "2025–2026",
    "sourcePage": 24,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8113",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Flight Crew Requirements",
    "materia": "operaciones",
    "text": "Other than in cruise flight, below what altitude are non-safety related flight deck activities by flight crewmembers prohibited?",
    "options": [
      "12,000 feet.",
      "10,000 feet.",
      "8,000 feet."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder shall require, nor may any flight crewmember perform, any duties during a critical phase of flight except those duties required for the safe operation of the aircraft. For purposes of this section, critical phases of flight include all ground operations involving taxi, takeoff and landing, and all other flight operations conducted below 10,000 feet, except cruise flight. (PLT440, AA.I.G.K5) — 14 CFR §135.100",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-24 · question 8113 · ATS, RTC",
    "sourceQuestionId": "8113",
    "sourceEdition": "2025–2026",
    "sourcePage": 24,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8706",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Fatigue can be evident in others if they",
    "options": [
      "talk more than usual.",
      "yawn excessively.",
      "are overly helpful."
    ],
    "correctIndex": 1,
    "explanation": "Physical signs of fatigue include yawning repeatedly, heavy eyelids or microsleeps, eye-rubbing, nodding off or head dropping, headaches, nausea, upset stomach, slowed reaction time, lack of energy, weakness, and lightheadedness. (PLT409, AA.I.F.K1h) — FAA-H-8083-2 based on number of flight segments 3 4 5 6 7+ 9 9 9 9 9 10 10 9 9 9 12 12 11.5 11 10.5 12 12 11.5 11 10.5 13 13 12.5 12 11.5 13 13 12.5 12 11.5 12 12 11.5 11 10.5 11 11 10 9 9 10 10 9 9 9 10 9 9 9 9 rest facility and number of pilots Class 2 rest facility Class 3 rest facility 3 pilots 4 pilots 3 pilots 4 pilots 17 14 15.5 13 13.5 18.5 15 16.5 14 4.5 19 16.5 18 15 5.5 18.5 15 16.5 14 4.5 17 14 15.5 13 3.5",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-27 · question 8706 · ALL",
    "sourceQuestionId": "8706",
    "sourceEdition": "2025–2026",
    "sourcePage": 27,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8706_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Which of the following is an effect of acute fatigue on performance?",
    "options": [
      "Loss of accuracy and smoothness in control movements.",
      "Heightened acuity in peripheral vision.",
      "Mild euphoria, impaired judgment, and increased reaction time."
    ],
    "correctIndex": 0,
    "explanation": "Acute fatigue is characterized by inattention, distractibility, errors in timing, neglect of secondary tasks, loss of accuracy and control, lack of awareness of error accumulation, and irritability. (PLT409, AA.I.F.K1h) — AIM ¶8-1-1",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-27 · question 8706-1 · ALL",
    "sourceQuestionId": "8706-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 27,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8707",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "You did not get a good night’s rest and have been on duty for several hours. A sign you may be fatigued is",
    "options": [
      "improved dexterity.",
      "decreased short term memory.",
      "mental acuteness."
    ],
    "correctIndex": 1,
    "explanation": "Short term memory loss is a sign of mental fatigue. Additional signs of mental fatigue include: difficulty concentrating on tasks, lapse in attention, failure to communicate important information, failure to anticipate events or actions, making mistakes even on well-practiced tasks, forgetfulness, difficulty thinking clearly, and poor decision making. (PLT409, AA.I.F.K1h) — FAA-H-8083-2",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-28 · question 8707 · ALL",
    "sourceQuestionId": "8707",
    "sourceEdition": "2025–2026",
    "sourcePage": 28,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8708",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Under 14 CFR 121, a required flightcrew member of an unaugmented two-pilot flag operation may not exceed how many hours duty in a seven consecutive day period?",
    "options": [
      "48.",
      "52.",
      "32."
    ],
    "correctIndex": 2,
    "explanation": "No pilot may fly more than 32 hours during any seven consecutive days, and each pilot must be relieved from all duty for at least 24 consecutive hours at least once during any seven consecutive days. (PLT409, AA.I.G.K3) — 14 CFR §121.481",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-28 · question 8708 · ATM, ADX",
    "sourceQuestionId": "8708",
    "sourceEdition": "2025–2026",
    "sourcePage": 28,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8709",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Under 14 CFR 121, a required flightcrew member of an unaugmented two-pilot flag operation may not exceed how many hours duty in a one calendar month period?",
    "options": [
      "120.",
      "100.",
      "80."
    ],
    "correctIndex": 1,
    "explanation": "No pilot may fly as a member of a crew more than 100 hours during any one calendar month. (PLT409, AA.I.G.K3) — 14 CFR §121.481",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-28 · question 8709 · ATM, ADX",
    "sourceQuestionId": "8709",
    "sourceEdition": "2025–2026",
    "sourcePage": 28,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8227",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "How does deadhead transportation, going to or from a duty assignment, affect the computation of flight time limits for air carrier flight crewmembers? It is",
    "options": [
      "considered part of the rest period if the flightcrew includes more than two pilots.",
      "considered part of the rest period for flight engineers and navigators.",
      "not considered to be part of a rest period."
    ],
    "correctIndex": 2,
    "explanation": "Time spent in deadhead transportation to or from duty assignment is not considered part of a rest period. (PLT409, AA.I.G.K3) — 14 CFR §§121.471, 121.491, and 121.519 Answer (A) is incorrect because deadhead transportation does not count for part of the required rest period. Answer (B) is incorrect because flight engineers and navigators are defined as flight crewmembers. The same rest period requirements apply to them as to pilot and copilot.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-28 · question 8227 · ATM, ADX",
    "sourceQuestionId": "8227",
    "sourceEdition": "2025–2026",
    "sourcePage": 28,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8228",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Flight duty period hours for flightcrew members are limited to",
    "options": [
      "190 hours in any 672 consecutive hours.",
      "180 hours in any 672 consecutive hours.",
      "170 hours in any 672 consecutive hours."
    ],
    "correctIndex": 0,
    "explanation": "No certificate holder may schedule and no flightcrew member may accept an assignment if the flightcrew member’s total FDP will exceed 190 flight duty period hours in any 672 consecutive hours. (PLT409, AA.I.G.K3) — 14 CFR §117.23",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-28 · question 8228 · ATM, ADX",
    "sourceQuestionId": "8228",
    "sourceEdition": "2025–2026",
    "sourcePage": 28,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8220",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Flight duty period hours for flightcrew members are limited to",
    "options": [
      "180 hours in any 28 consecutive days.",
      "190 hours in any 672 consecutive hours.",
      "170 hours in any 672 consecutive hours."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may schedule and no flightcrew member may accept an assignment if the flightcrew member’s total FDP will exceed 190 flight duty period hours in any 672 consecutive hours. (PLT409, AA.I.G.K3) — 14 CFR §117.23",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-28 · question 8220 · ATM, ADX",
    "sourceQuestionId": "8220",
    "sourceEdition": "2025–2026",
    "sourcePage": 28,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8221",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "“Window of circadian low” means a period of maximum sleepiness that occurs between",
    "options": [
      "0100 – 0500.",
      "1200 – 0459.",
      "0200 – 0559."
    ],
    "correctIndex": 2,
    "explanation": "Window of circadian low means a period of maximum sleepiness that occurs between 0200 and 0559 during a physiological night’s rest. (PLT409, AA.I.G.K3) — 14 CFR §117.3",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-29 · question 8221 · ATM, ADX",
    "sourceQuestionId": "8221",
    "sourceEdition": "2025–2026",
    "sourcePage": 29,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8219",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "For a short-call reserve, the reserve availability period may not exceed",
    "options": [
      "12 hours.",
      "14 hours.",
      "16 hours."
    ],
    "correctIndex": 1,
    "explanation": "Short-call reserve means a period of time in which a flightcrew member is assigned to a reserve availability period. For short-call reserve, the reserve availability period may not exceed 14 hours. (PLT409, AA.I.G.K3) — 14 CFR §117.21",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-29 · question 8219 · ATM, ADX",
    "sourceQuestionId": "8219",
    "sourceEdition": "2025–2026",
    "sourcePage": 29,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8222",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "If the crew van breaks down en route to the rest facility and delays arrival for nearly 2 hours, does the flightcrew member need to notify the certificate holder?",
    "options": [
      "No, as long as the crew member has the opportunity for 9 hours of uninterrupted rest.",
      "No, as long as the crew member has the opportunity for 8 hours rest.",
      "Yes, if the flightcrew member does not have the opportunity for 10 hours of uninterrupted hours free from duty."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may schedule, and no flightcrew member may accept, an assignment for any reserve or flight duty period unless the flightcrew member is given a rest period of at least 10 consecutive hours immediately before beginning the reserve or flight duty period measured from the time the flightcrew member is released from duty. The 10 hour rest period must provide the flightcrew member with a minimum of 8 uninterrupted hours of sleep opportunity. If a flightcrew member determines that this rest period will not provide 8 uninterrupted hours of sleep opportunity, the flightcrew member must notify the certificate holder. The flightcrew member cannot report for the assigned flight duty period until he or she receives this specified rest period. (PLT409, AA.I.G.K3) — 14 CFR §117.25",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-29 · question 8222 · ATM, ADX",
    "sourceQuestionId": "8222",
    "sourceEdition": "2025–2026",
    "sourcePage": 29,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8223",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "“Airport standby reserve” means",
    "options": [
      "a specified 15-hour period of reserve in close proximity of assignment being available for flight duty assignments in less than 2 hours.",
      "being within 90 minutes of the airport and available for immediate flight duty assignments of 8 hours duration.",
      "a defined duty period during which a flight crewmember is required by the certificate holder to be available for possible assignment."
    ],
    "correctIndex": 2,
    "explanation": "Airport/standby reserve means a defined duty period during which a flightcrew member is required by a certificate holder to be at an airport for a possible assignment. (PLT409, AA.I.G.K3) — 14 CFR §117.3",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-29 · question 8223 · ATM, ADX",
    "sourceQuestionId": "8223",
    "sourceEdition": "2025–2026",
    "sourcePage": 29,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9714",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Each flightcrew member must report",
    "options": [
      "in uniform and properly prepared to accomplish all assignments.",
      "to the airport on time and fully prepared to accomplish assigned duty.",
      "for any flight duty period rested and prepared to perform his duty."
    ],
    "correctIndex": 2,
    "explanation": "Each flightcrew member must report for any flight duty period rested and prepared to perform his or her assigned duties. (PLT409, AA.I.G.K3) — 14 CFR §117.5",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-29 · question 9714 · ATM, ADX",
    "sourceQuestionId": "9714",
    "sourceEdition": "2025–2026",
    "sourcePage": 29,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8211",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "You are on the last day of a four day trip and haven’t slept well. What is a warning sign that you are fatigued?",
    "options": [
      "Improved dexterity.",
      "Head bobbing.",
      "Mental acuteness."
    ],
    "correctIndex": 1,
    "explanation": "Common physical signs of fatigue include yawning repeatedly, heavy eyelids, microsleeps, eye rubbing, nodding off or head dropping, headaches, nausea, or upset stomach, slowed reaction time, lack of energy, weakness, or light headedness. (PLT409, AA.I.G.K3) — FAA-H-8083-2, 14 CFR §117.3",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-29 · question 8211 · ATM, ADX",
    "sourceQuestionId": "8211",
    "sourceEdition": "2025–2026",
    "sourcePage": 29,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8224",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "No flightcrew member may accept an assignment for any reserve or flight duty period unless the flight crew member is given",
    "options": [
      "10 consecutive hours of rest immediately before beginning a flight duty period or a reserve period.",
      "12 consecutive hours of rest immediately before beginning a flight duty period or a reserve period.",
      "8 consecutive hours of rest immediately before beginning a flight duty period or a reserve period."
    ],
    "correctIndex": 0,
    "explanation": "No certificate holder may schedule and no flightcrew member may accept an assignment for any reserve or flight duty period unless the flightcrew member is given a rest period of at least 10 consecutive hours immediately before beginning the reserve or flight duty period measured from the time the flightcrew member is released from duty. The 10-hour rest period must provide the flightcrew member with a minimum of 8 uninterrupted hours of sleep opportunity. (PLT409, AA.I.G.K3) — 14 CFR §117. 25",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-30 · question 8224 · ATM, ADX",
    "sourceQuestionId": "8224",
    "sourceEdition": "2025–2026",
    "sourcePage": 30,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8229",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "You are a pilot operating under 14 CFR Part 121 and are in a required rest period. When can you be contacted about your next day duty assignment?",
    "options": [
      "At any time during your required rest period.",
      "At the end of your required rest period.",
      "No earlier than 1 hour before the end of your required rest period."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may assign and no flightcrew member may accept assignment to any reserve or duty with the certificate holder during any required rest period. (PLT409, AA.I.G.K3) — 14 CFR §117.25",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-30 · question 8229 · ATM, ADX",
    "sourceQuestionId": "8229",
    "sourceEdition": "2025–2026",
    "sourcePage": 30,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8231",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "“Rest period” means",
    "options": [
      "an 8-hour continuous period determined prospectively during which the flightcrew member is free from all restraint by the certificate holder.",
      "a continuous period determined prospectively during which the flightcrew member is free from all restraint by the certificate holder.",
      "a 12-hour continuous period determined prospectively during which the flightcrew member is free from all restraint by the certificate holder."
    ],
    "correctIndex": 1,
    "explanation": "Rest period means a continuous period determined prospectively during which the flightcrew member is free from all restraint by the certificate holder, including freedom from present responsibility for work should the occasion arise. (PLT409, AA.I.G.K3) — 14 CFR §117.3",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-30 · question 8231 · ATM, ADX",
    "sourceQuestionId": "8231",
    "sourceEdition": "2025–2026",
    "sourcePage": 30,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8231_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "For passenger-carrying operations under 14 CFR Part 121, which situation would be considered part of the required rest period?",
    "options": [
      "Deadheading to home base after the last scheduled flight.",
      "Electing to fly as a passenger from home base after the flight duty period ends.",
      "Training conducted in a flight simulator."
    ],
    "correctIndex": 1,
    "explanation": "Duty means any task that a flight crewmember performs as required by the certificate holder, including but not limited to flight duty period, flight duty, pre- and post-flight duties, administrative work, training, deadhead transportation, aircraft positioning on the ground, aircraft loading, and aircraft servicing. Rest period means a continuous period determined prospectively during which the flightcrew member is free from all restraint by the certificate holder, including freedom from present responsibility for work should the occasion arise. (PLT409, AA.I.G.K3) — 14 CFR §117.3 Answer (A) is incorrect because deadhead transportation is considered duty time and does not count for part of the required rest period. Answer (C) is incorrect because no training counts for part of the required rest period.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-30 · question 8231-1 · ATM, ADX",
    "sourceQuestionId": "8231-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 30,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8238",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "“Theater” means",
    "options": [
      "a geographical area in which the distance between the flightcrew member flight duty period departure point and arrival point differs by no more than 90 degrees longitude.",
      "a geographical area in which the distance between the flightcrew member flight duty period departure point and arrival point differs by no more than 75 degrees longitude.",
      "a geographical area in which the distance between the flightcrew member flight duty period departure point and arrival point differs by no more than 60 degrees longitude."
    ],
    "correctIndex": 2,
    "explanation": "Theater means a geographical area in which the distance between the flightcrew member’s flight duty period departure point and arrival point differs by no more than 60° longitude. The applicable flight duty period is based on the local time at the theater in which the flightcrew member was last acclimated. (PLT409, AA.I.G.K3) — 14 CFR §117.3 and §117.13",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-30 · question 8238 · ATM, ADX",
    "sourceQuestionId": "8238",
    "sourceEdition": "2025–2026",
    "sourcePage": 30,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9837",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "“Physiological night’s rest” means",
    "options": [
      "9 hours of rest that encompasses the hours of 0100 and 0700 at the crewmember’s home base.",
      "10 hours of rest that encompasses the hours of 0100 and 0700 at the crewmember’s home base.",
      "12 hours of rest that encompasses any continuous 8 hour period for uninterrupted or disturbed rest."
    ],
    "correctIndex": 1,
    "explanation": "Physiological night’s rest means 10 hours of rest that encompasses the hours of 0100 and 0700 at the flightcrew member’s home base, unless the individual has acclimated to a different theater. If the flightcrew member has acclimated to a different theater, the rest must encompass the hours of 0100 and 0700 at the acclimated location. (PLT395), AA.I.G.K3 — 14 CFR §117.3",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-31 · question 9837 · ATM, ADX",
    "sourceQuestionId": "9837",
    "sourceEdition": "2025–2026",
    "sourcePage": 31,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9838",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "In order to be assigned for duty, each flightcrew member must report",
    "options": [
      "on time, in uniform, and properly prepared to accomplish all assigned duties.",
      "to the airport on time, after the designated rest period and fully prepared to accomplish assigned duties.",
      "for any flight duty period rested and prepared to perform his/her assigned duties."
    ],
    "correctIndex": 2,
    "explanation": "Each flightcrew member must report for any flight duty period rested and prepared to perform their assigned duties. (PLT409, AA.I.G.K3) — 14 CFR §117.5",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-31 · question 9838 · ATM, ADX",
    "sourceQuestionId": "9838",
    "sourceEdition": "2025–2026",
    "sourcePage": 31,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9839",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Flightcrew members must receive fatigue education and awareness training",
    "options": [
      "with all required air carrier dispatcher and every flightcrew member training activity.",
      "annually for flightcrew members and every 24 months for dispatchers, flightcrew member schedulers, and operational control individuals.",
      "annually for flightcrew member schedulers, operational control individuals and flightcrew members and dispatchers."
    ],
    "correctIndex": 2,
    "explanation": "Each certificate holder must develop and implement an education and awareness training program that is approved by the Administrator. This program must provide the training to all employees of the certificate holder responsible for administering the provisions of Part 117, including flightcrew members, dispatchers, individuals directly involved in the scheduling of flightcrew members or in operational control, and any employee providing direct management oversight of these areas. (PLT409, AA.I.G.K3) — 14 CFR §117.9",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-31 · question 9839 · ATM, ADX",
    "sourceQuestionId": "9839",
    "sourceEdition": "2025–2026",
    "sourcePage": 31,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9840",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "In an airplane assigned with a minimum flight crew of two, your flight time may not exceed",
    "options": [
      "9 hours if assigned to report at 0330.",
      "9 hours if assigned to report at 0500.",
      "9 hours if assigned to report at 2030."
    ],
    "correctIndex": 1,
    "explanation": "The maximum flight time for unaugmented operations is as follows: Time of report Maximum flight time (acclimated) (hours) 0000-0459 8 0500-1959 9 2000-2359 8 A Part 117 excerpt will be available for your reference during the FAA test. You will not be required to memorize the tables; however, you will need to know which table to use as applicable to the question being asked. (PLT409, AA.I.G.K3) — 14 CFR §117.11 and Table A",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-31 · question 9840 · ATM, ADX",
    "sourceQuestionId": "9840",
    "sourceEdition": "2025–2026",
    "sourcePage": 31,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9841",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "For unaugmented flightcrew operations, your maximum flight duty period limit is",
    "options": [
      "13 hours if assigned to report at 0700 for 4 flight segments.",
      "13 hours if assigned to report at 2030 for 3 flight segments.",
      "10.5 hours if assigned to report at 1730 for 6 flight segments."
    ],
    "correctIndex": 0,
    "explanation": "The maximum flight duty period (hours) for lineholders is based on the number of flight segments and the scheduled time of start. A Part 117 excerpt will be available for your reference during the FAA test. You will not be required to memorize the tables; however, you will need to know which table to use as applicable to the question being asked. (PLT409, AA.I.G.K3) — 14 CFR §117.13 and Table B",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-32 · question 9841 · ATM, ADX",
    "sourceQuestionId": "9841",
    "sourceEdition": "2025–2026",
    "sourcePage": 32,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9842",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "In an airplane with an augmented crew of three flightcrew members assigned, the maximum flight duty period is",
    "options": [
      "17 hours if assigned to report at 1200 with a Class 3 rest facility available.",
      "16 hours if assigned to report at 0630 with a Class 1 rest facility available",
      "15 hours if assigned to report at 1730 with a Class 2 rest facility available."
    ],
    "correctIndex": 1,
    "explanation": "A Part 117 excerpt will be available for your reference during the FAA test. You will not be required to memorize the tables; however, you will need to know which table to use as applicable to the question being asked. (PLT409, AA.I.G.K3) — 14 CFR §117.17 and Table C",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-32 · question 9842 · ATM, ADX",
    "sourceQuestionId": "9842",
    "sourceEdition": "2025–2026",
    "sourcePage": 32,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9843",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "The time spent resting during unaugmented operations will not be counted towards the flight duty period limitation if the rest period is at least",
    "options": [
      "3 hours long after reaching suitable accommodations.",
      "4 hours long after reaching suitable accommodations.",
      "4 hours long which can include transportation to suitable accommodations."
    ],
    "correctIndex": 0,
    "explanation": "For an unaugmented operation only, if a flightcrew member is provided with a rest opportunity (an opportunity to sleep) in a suitable accommodation during their flight duty period, the time that the flightcrew member spends in the suitable accommodation is not part of that flightcrew member’s flight duty period if the time spent in that accommodation is at least 3 hours, measured from the time that the flightcrew member reaches the accommodation. (PLT409, AA.I.G.K3) — 14 CFR §117.15",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-32 · question 9843 · ATM, ADX",
    "sourceQuestionId": "9843",
    "sourceEdition": "2025–2026",
    "sourcePage": 32,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9844",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Notification of the rest opportunity period during unaugmented operations, must be",
    "options": [
      "given before the next to last flight segment.",
      "given before the beginning of the flight duty period.",
      "provided no later than after the first flight segment offered after the first flight segment is completed."
    ],
    "correctIndex": 1,
    "explanation": "For an unaugmented operation only, if a flightcrew member is provided with a rest opportunity (an opportunity to sleep) in a suitable accommodation during their flight duty period, the time that the flightcrew member spends in that accommodation is not part of that flightcrew member’s flight duty period if the rest opportunity is scheduled before the beginning of the flight duty period in which that rest is taken. (PLT409, AA.I.G.K3) — 14 CFR §117.15",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-33 · question 9844 · ATM, ADX",
    "sourceQuestionId": "9844",
    "sourceEdition": "2025–2026",
    "sourcePage": 33,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9845",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "If the augmented flightcrew member is not acclimated, the",
    "options": [
      "maximum flight duty period given in 14 CFR part 117, Table C (not included herein) is reduced by 30 minutes.",
      "flight duty period assignment must be reduced 15 minutes by each 15 degrees of longitude difference from the previous rest location.",
      "minimum rest period must be extended by 3 hours."
    ],
    "correctIndex": 0,
    "explanation": "If the flightcrew member is not acclimated the maximum flight duty period in Table C of Part 117 is reduced by 30 minutes. (PLT409, AA.I.G.K3) — 14 CFR §117.17",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-33 · question 9845 · ATM, ADX",
    "sourceQuestionId": "9845",
    "sourceEdition": "2025–2026",
    "sourcePage": 33,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9846",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "The flight duty period may be extended due to unforeseen circumstances before takeoff by as much as",
    "options": [
      "2 hours.",
      "1 hour.",
      "30 minutes."
    ],
    "correctIndex": 0,
    "explanation": "For augmented and unaugmented operations, if unforeseen operational circumstances arise prior to takeoff, the pilot-in-command and the certificate holder may extend the maximum flight duty period permitted up to 2 hours. (PLT409, AA.I.G.K3) — 14 CFR §117.19",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-33 · question 9846 · ATM, ADX",
    "sourceQuestionId": "9846",
    "sourceEdition": "2025–2026",
    "sourcePage": 33,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9847",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "After takeoff, unforeseen circumstances arise. In this case, the flight duty period may be extended by as much as",
    "options": [
      "2 hours.",
      "necessary to reach the closest suitable alternate crew base airport.",
      "necessary to land at the next destination airport or alternate airport."
    ],
    "correctIndex": 2,
    "explanation": "For augmented and unaugmented operations, if unforeseen operational circumstances arise after takeoff, the pilot-in-command and the certificate holder may extend maximum flight duty periods to the extent necessary to safely land the aircraft at the next destination airport or alternate airport, as appropriate. (PLT409, AA.I.G.K3) — 14 CFR §117.19",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-33 · question 9847 · ATM, ADX",
    "sourceQuestionId": "9847",
    "sourceEdition": "2025–2026",
    "sourcePage": 33,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9847_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "“Unforeseen operational circumstance” means an",
    "options": [
      "unplanned event of insufficient duration to allow for adjustments to schedules.",
      "unforecast weather and expected ATC delays.",
      "event of sufficient duration to create increased flight times for the certificate holder’s operation."
    ],
    "correctIndex": 0,
    "explanation": "Unforeseen operational circumstance means an unplanned event of insufficient duration to allow for adjustments to schedules, including unforecast weather, equipment malfunction, or air traffic delay that is not reasonably expected. (PLT407, AA.I.G.K3) — 14 CFR §117.3",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-33 · question 9847-1 · ATM, ADX",
    "sourceQuestionId": "9847-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 33,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9847_2",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "For passenger operations under Part 121, a flightcrew member may exceed maximum flight time limitations if",
    "options": [
      "immediately followed by 11 hours of rest.",
      "unforeseen operational circumstances arise after takeoff.",
      "known ATC delays do not exceed 30 minutes."
    ],
    "correctIndex": 1,
    "explanation": "For augmented and unaugmented operations, if unforeseen operational circumstances arise after takeoff, the PIC and the certificate holder may extend maximum flight duty periods to the extent necessary to safely land the aircraft at the next destination airport or alternate airport, as appropriate. (PLT409, AA.I.G.K3) — 14 CFR §117.3",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-33 · question 9847-2 · ATM, ADX",
    "sourceQuestionId": "9847-2",
    "sourceEdition": "2025–2026",
    "sourcePage": 33,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9848",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "For airport/standby reserve, all time spent in airport/standby reserve time is",
    "options": [
      "not part of the flightcrew member’s flight duty period.",
      "part of the flightcrew member’s flight duty period.",
      "part of the flightcrew member’s flight duty period after being alerted for flight assignment."
    ],
    "correctIndex": 1,
    "explanation": "For airport/standby reserve, all time spent in a reserve status is part of the flightcrew member’s flight duty period. (PLT409, AA.I.G.K3) — 14 CFR §117.21",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-34 · question 9848 · ATM, ADX",
    "sourceQuestionId": "9848",
    "sourceEdition": "2025–2026",
    "sourcePage": 34,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9849",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Limiting flight time for all flightcrew members will include",
    "options": [
      "instruction flight hours, commercial flying, and flying for any certificate holder.",
      "any flying by flightcrew members for any certificate holder or 91K program manager.",
      "flying by flightcrew members for any certificate holder or 91K program manager and any other commercial flight time."
    ],
    "correctIndex": 1,
    "explanation": "The limitations of Part 117 include all flying by flightcrew members on behalf of any certificate holder or 91K program manager during the applicable periods. (PLT409, AA.I.G.K3) — 14 CFR §117.23",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-34 · question 9849 · ATM, ADX",
    "sourceQuestionId": "9849",
    "sourceEdition": "2025–2026",
    "sourcePage": 34,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9850",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Flightcrew member’s flight duty periods are limited to",
    "options": [
      "60 hours in any 168 consecutive hours.",
      "70 hours in any 168 consecutive hours.",
      "60 hours in any 7 days."
    ],
    "correctIndex": 0,
    "explanation": "No certificate holder may schedule and no flightcrew member may accept an assignment if the flightcrew member’s total flight duty period will exceed 60 flight duty hours in any 168 consecutive hours. (PLT409, AA.I.G.K3) — 14 CFR §117.23",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-34 · question 9850 · ATM, ADX",
    "sourceQuestionId": "9850",
    "sourceEdition": "2025–2026",
    "sourcePage": 34,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9851",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "A flightcrew member must be given a rest period before beginning any reserve or flight duty period of",
    "options": [
      "24 consecutive hours free from any duty in the past 7 consecutive calendar days.",
      "36 consecutive hours in the past 168 consecutive hours.",
      "30 consecutive hours in the past 168 consecutive hours."
    ],
    "correctIndex": 2,
    "explanation": "Before beginning any reserve or flight duty period, a flightcrew member must be given at least 30 consecutive hours free from all duty within the past 168 consecutivehour period. (PLT409, AA.I.G.K3) — 14 CFR §117.25",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-34 · question 9851 · ATM, ADX",
    "sourceQuestionId": "9851",
    "sourceEdition": "2025–2026",
    "sourcePage": 34,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9852",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "No flightcrew member may accept an assignment without scheduled rest opportunities for",
    "options": [
      "more than 3 consecutive nighttime flights that infringe on the window of circadian low.",
      "more than 4 consecutive nighttime flights that infringe on the window of circadian low in a 168 hour period.",
      "consecutive nighttime flights beginning after 0001 hours local home base time."
    ],
    "correctIndex": 0,
    "explanation": "No certificate holder may schedule and no flightcrew member may accept more than three consecutive flight duty periods that infringe on the window of circadian low. (PLT409, AA.I.G.K3) — 14 CFR §117.27",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-34 · question 9852 · ATM, ADX",
    "sourceQuestionId": "9852",
    "sourceEdition": "2025–2026",
    "sourcePage": 34,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8194",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "Normally, a dispatcher for domestic or flag operations should be scheduled for no more than",
    "options": [
      "10 hours of duty in any 24 consecutive hours.",
      "8 hours of service in any 24 consecutive hours.",
      "10 consecutive hours of duty."
    ],
    "correctIndex": 2,
    "explanation": "Except in cases where circumstances or emergency conditions beyond the control of the certificate holder, no certificate holder conducting domestic or flag operations may schedule a dispatcher for more than 10 consecutive hours of duty. (PLT450, AA.I.G.K3) — 14 CFR §121.465",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-34 · question 8194 · ADX",
    "sourceQuestionId": "8194",
    "sourceEdition": "2025–2026",
    "sourcePage": 34,
    "sourceCategories": [
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8724",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Flight Duty Periods",
    "materia": "operaciones",
    "text": "What is the minimum rest period required before a flight or reserve duty period?",
    "options": [
      "8 consecutive hours rest.",
      "10 consecutive hours rest.",
      "12 consecutive hours rest."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may schedule and no flightcrew member may accept an assignment for any reserve or flight duty period unless the flightcrew member is given a rest period of at least 10 consecutive hours immediately before beginning the reserve or flight duty period measured from the time the flightcrew member is released from duty. The 10 hour rest period must provide the flightcrew member with a minimum of 8 uninterrupted hours of sleep opportunity. (PLT409, AA.I.G.K3) — 14 CFR §117.25",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-34 · question 8724 · ATM, ADX",
    "sourceQuestionId": "8724",
    "sourceEdition": "2025–2026",
    "sourcePage": 34,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9326",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "“Operational control” of a flight refers to",
    "options": [
      "the specific duties of any required crewmember.",
      "exercising authority over initiating, conducting, or terminating a flight.",
      "exercising the privileges of pilot-in-command of an aircraft."
    ],
    "correctIndex": 1,
    "explanation": "Operational control, with respect to flight, is the exercise of authority over initiating, conducting, or terminating a flight. (PLT432, AA.I.G.K4) — 14 CFR §1.1 Answer (A) is incorrect because crewmember refers to any person assigned to perform duty in an aircraft during flight time, which includes cabin crew as well as flight deck crew. Answer (C) is incorrect because pilot-in-command refers to the pilot responsible for the operation and safety of an aircraft during flight time, which does not include the initiation of a flight.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-36 · question 9326 · ALL",
    "sourceQuestionId": "9326",
    "sourceEdition": "2025–2026",
    "sourcePage": 36,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8003",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "Which document specifically authorizes a person to operate an aircraft in a particular geographic area?",
    "options": [
      "Operations Specifications.",
      "Operating Certificate.",
      "Dispatch Release."
    ],
    "correctIndex": 0,
    "explanation": "Each certificate holder conducting domestic, flag, or commuter operations must obtain operations specifications containing authorization and limitations for routes and areas of operations. (PLT389, AA.II.A.K7) — 14 CFR §119.49",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-36 · question 8003 · ALL",
    "sourceQuestionId": "8003",
    "sourceEdition": "2025–2026",
    "sourcePage": 36,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9745",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "No person may operate a U.S. registered civil aircraft",
    "options": [
      "for which an AFM or RFM is required by Part 21 section 21.5 unless there is a current, approved operator’s manual available.",
      "for which an AFM or RFM is required by Part 21 section 21.5 unless there is a current, approved AFM or RFM available.",
      "for which an AFM or RFM is required by Part 21 section 21.5 unless there is a current, approved AFM or RFM available or the manual specified in Part 135 section 135.19(b)."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate a U.S.-registered civil aircraft for which an airplane or rotorcraft flight manual is required by 14 CFR §21.5 unless there is available in the aircraft a current, approved airplane or rotorcraft flight manual or the manual provided for in §121.141(b). (PLT373, AA.II.A.K7) — 14 CFR §91.9",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-37 · question 9745 · ALL",
    "sourceQuestionId": "9745",
    "sourceEdition": "2025–2026",
    "sourcePage": 37,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8429",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "An airport approved by the Administrator for use by an air carrier certificate holder for the purpose of providing service to a community when the regular airport is not available is a/an:",
    "options": [
      "destination airport.",
      "provisional airport.",
      "alternate airport."
    ],
    "correctIndex": 1,
    "explanation": "A provisional airport is defined as an airport approved by the Administrator for use by a certificate holder for the purpose of providing service to a community when the regular airport used by the certificate holder is not available. (PLT395, AA.II.A.K7) — 14 CFR §110.2 Answer (A) is incorrect because the destination airport is the term used to describe the primary airport of intended landing. Answer (C) is incorrect because the alternate airport is generally defined as an airport at which an aircraft may land if a landing at the intended airport becomes inadvisable.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-37 · question 8429 · ALL",
    "sourceQuestionId": "8429",
    "sourceEdition": "2025–2026",
    "sourcePage": 37,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8430",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "A provisional airport is an airport approved by the Administrator for use by an air carrier certificate holder for the purpose of",
    "options": [
      "obtaining provisions and fuel when unable, due to winds, to proceed direct to the regular airport.",
      "having the aircraft catered (foods, beverages, or supplies).",
      "providing service to a community when the regular airport is unavailable."
    ],
    "correctIndex": 2,
    "explanation": "A provisional airport is defined as an airport approved by the Administrator for use by a certificate holder for the purpose of providing service to a community when the regular airport used by the certificate holder is not available. (PLT389, AA.II.A.K7) — 14 CFR §110.2",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-37 · question 8430 · ALL",
    "sourceQuestionId": "8430",
    "sourceEdition": "2025–2026",
    "sourcePage": 37,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8767",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "A person who is not authorized to conduct direct air carrier operations, but who is authorized by the Administrator to conduct operations as a U.S. commercial operator, will be issued",
    "options": [
      "an Air Carrier Certificate.",
      "a Supplemental Air Carrier Certificate.",
      "an Operating Certificate."
    ],
    "correctIndex": 2,
    "explanation": "A person who is not authorized to conduct direct air carrier operations, but who is authorized by the Administrator to conduct operations as a U.S. commercial operator, will be issued an Operating Certificate. (PLT389, AA.II.A.K7) — 14 CFR §119.5 Answer (A) is incorrect because a person authorized by the Administrator to conduct operations as a direct air carrier is issued an Air Carrier Certificate. Answer (B) is incorrect because wherever in the Federal Aviation Regulations the term “supplemental air carrier operating certificate” appears, it shall be deemed to mean an “Air Carrier Operating Certificate.”",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-37 · question 8767 · ALL",
    "sourceQuestionId": "8767",
    "sourceEdition": "2025–2026",
    "sourcePage": 37,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8768",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "The kinds of operation that a certificate holder is authorized to conduct are specified in the",
    "options": [
      "certificate holder’s operations specifications.",
      "application submitted for an Air Carrier or Operating Certificate, by the applicant.",
      "Air Carrier Certificate or Operating Certificate."
    ],
    "correctIndex": 0,
    "explanation": "Each certificate holder conducting domestic, flag, or commuter operations must obtain operations specifications containing, among many other provisions, the kinds of operations authorized. (PLT389, AA.II.A.K7) — 14 CFR §119.49 Answers (B) and (C) are incorrect because the operations specifications are continually updated and amended relative to the operator’s needs and not contained in the original application or on the certificate itself.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-37 · question 8768 · ALL",
    "sourceQuestionId": "8768",
    "sourceEdition": "2025–2026",
    "sourcePage": 37,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9782",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "All 14 CFR Part 139 airports must report",
    "options": [
      "accident and incident data annually.",
      "noise complaint statistics for each departure procedure or runway.",
      "declared distances for each runway."
    ],
    "correctIndex": 2,
    "explanation": "All 14 CFR Part 139 airports report declared runway distance for each runway. (PLT078, AA.II.A.K2b) — AIM ¶4-3-6 Answers (A) and (B) are incorrect because this information is only furnished upon request by the administrator per 14 CFR §139.301.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-38 · question 9782 · ALL",
    "sourceQuestionId": "9782",
    "sourceEdition": "2025–2026",
    "sourcePage": 38,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8243",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "The persons jointly responsible for the initiation, continuation, diversion, and termination of a supplemental air carrier or commercial operator flight are the",
    "options": [
      "pilot-in-command and chief pilot.",
      "pilot-in-command and director of operations.",
      "pilot-in-command and the flight follower."
    ],
    "correctIndex": 1,
    "explanation": "For operations of supplemental air carriers or commercial operators, the PIC and the director of operations are jointly responsible for the initiation, continuation, diversion, and termination of a flight. (PLT444, AA.II.A.K2e) — 14 CFR §121.537",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-38 · question 8243 · ATM, ADX",
    "sourceQuestionId": "8243",
    "sourceEdition": "2025–2026",
    "sourcePage": 38,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8243_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "You are the pilot-in-command of a 14 CFR Part 121 domestic operation flight. In addition to yourself, who is jointly responsible for preflight planning, delay, and dispatch release of the flight?",
    "options": [
      "The director of operations.",
      "The chief pilot or designed.",
      "The aircraft dispatcher."
    ],
    "correctIndex": 2,
    "explanation": "The PIC and the aircraft dispatcher are jointly responsible for the preflight planning, delay, and dispatch release of a flight in compliance with this chapter and operations specifications. (PLT444, AA.I.E.K9) — 14 CFR §121.533",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-38 · question 8243-1 · ATM, ADX",
    "sourceQuestionId": "8243-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 38,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8290",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "Which information must be contained in, or attached to, the dispatch release for a flag air carrier flight?",
    "options": [
      "Type of operation (e.g., IFR, VFR), trip number.",
      "Total fuel supply and minimum fuel required on board the airplane.",
      "Passenger manifest, company or organization name, and cargo weight."
    ],
    "correctIndex": 0,
    "explanation": "The dispatch release of a flag or domestic air carrier may be in any form but must contain at least the following information concerning the flight: 1. Identification number of the aircraft; 2. Trip number; 3. Departure airport, intermediate stops, destination airports, and alternate airports; 4. A statement of the type of operation (IFR, VFR); and 5. Minimum fuel supply. (PLT455, AA.II.A.K2e) — 14 CFR §121.687 Answers (B) and (C) are incorrect because fuel on board, a passenger list, and cargo weights are found in the load manifest. Although separate items, both the dispatch release and the load manifest are required to be carried on the flight.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-38 · question 8290 · ATM, ADX",
    "sourceQuestionId": "8290",
    "sourceEdition": "2025–2026",
    "sourcePage": 38,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8292",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "What information must be contained in, or attached to, the dispatch release for a domestic air carrier flight?",
    "options": [
      "Departure airport, intermediate stops, destinations, alternate airports, and trip number.",
      "Names of all passengers on board and minimum fuel supply.",
      "Cargo load, weight and balance data, and identification number of the aircraft."
    ],
    "correctIndex": 0,
    "explanation": "The dispatch release of a flag or domestic air carrier may be in any form but must contain at least the following information concerning the flight: 1. Identification number of the aircraft; 2. Trip number; 3. Departure airport, intermediate stops, destination airports, and alternate airports; 4. A statement of the type of operation (IFR, VFR); and 5. Minimum fuel supply. (PLT400, AA.II.A.K2e) — 14 CFR §121.687 Answers (B) and (C) are incorrect because the passenger names, cargo load, and weight and balance data are part of the required load manifest. A copy of the load manifest must also be carried on the flight. The load manifest is not part of the dispatch release.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-38 · question 8292 · ATM, ADX",
    "sourceQuestionId": "8292",
    "sourceEdition": "2025–2026",
    "sourcePage": 38,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8293",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "What information must be included on a domestic air carrier dispatch release?",
    "options": [
      "Evidence that the airplane is loaded according to schedule, and a statement of the type of operation.",
      "Minimum fuel supply and trip number.",
      "Company or organization name and identification number of the aircraft."
    ],
    "correctIndex": 1,
    "explanation": "The dispatch release of a flag or domestic air carrier may be in any form but must contain at least the following information concerning the flight: 1. Identification number of the aircraft; 2. Trip number; 3. Departure airport, intermediate stops, destination airports, and alternate airports; 4. A statement of the type of operation (IFR, VFR); and 5. Minimum fuel supply. (PLT412, AA.II.A.K2e) — 14 CFR §121.687 Answer (A) is incorrect because the proper loading of the airplane is documented in the load manifest. Answer (C) is incorrect because the company or organization name is not required on the dispatch release.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-39 · question 8293 · ATM, ADX",
    "sourceQuestionId": "8293",
    "sourceEdition": "2025–2026",
    "sourcePage": 39,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8294",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "A dispatch release for a flag or domestic air carrier must contain or have attached to it",
    "options": [
      "minimum fuel supply and weather information for the complete flight.",
      "trip number and weight and balance data.",
      "weather information for the complete flight and a crew list."
    ],
    "correctIndex": 0,
    "explanation": "The dispatch release must contain, or have attached to it, weather reports, available weather forecasts, or a combination thereof, for the destination airport, intermediate stops, and alternate airports, that are the latest available at the time the release is signed by the PIC and dispatcher. It may include any additional available weather reports or forecasts that the pilot-in-command or the aircraft dispatcher considers necessary or desirable. (PLT412, AA.II.A.K2e) — 14 CFR §121.687",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-39 · question 8294 · ATM, ADX",
    "sourceQuestionId": "8294",
    "sourceEdition": "2025–2026",
    "sourcePage": 39,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8280",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "By regulation, who shall provide the pilot-in-command of a domestic or flag air carrier airplane information concerning weather, and irregularities of facilities and services?",
    "options": [
      "The aircraft dispatcher.",
      "Air route traffic control center.",
      "Director of operations."
    ],
    "correctIndex": 0,
    "explanation": "The aircraft dispatcher for a flag or domestic flight shall provide the pilot-in-command all available reports or information on airport conditions and irregularities of navigation facilities that may affect safety of the flight. (PLT398, AA.II.A.K2e) — 14 CFR §121.601 Answer (B) is incorrect because air route traffic control center may have information concerning irregularities of facilities and service, but it is not the proper source of that information. That information should be provided by the aircraft dispatcher. Answer (C) is incorrect because the director of operations (who may also be the general manager) is an administrative person, responsible for the day-to-day operations and not usually involved in specific flight operations.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-39 · question 8280 · ATM, ADX",
    "sourceQuestionId": "8280",
    "sourceEdition": "2025–2026",
    "sourcePage": 39,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8283",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "Where can the pilot of a flag air carrier airplane find the latest FDC NOTAMs?",
    "options": [
      "Any company dispatch facility.",
      "Notices to Air Missions publication.",
      "Chart Supplements U.S."
    ],
    "correctIndex": 0,
    "explanation": "The aircraft dispatcher for a flag or domestic flight shall provide the pilot-in-command all available reports or information on airport conditions and irregularities of navigation facilities that may affect safety of the flight. Since FDC NOTAMs are regulatory in nature and apply to instrument approach procedures and enroute charts, they would have to be available. (PLT323, AA.I.E.K14) — 14 CFR §121.601",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-39 · question 8283 · ATM, ADX",
    "sourceQuestionId": "8283",
    "sourceEdition": "2025–2026",
    "sourcePage": 39,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8284",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "Who is responsible, by regulation, for briefing a domestic or flag air carrier pilot-in-command on all available weather information?",
    "options": [
      "Company meteorologist.",
      "Aircraft dispatcher.",
      "Director of operations."
    ],
    "correctIndex": 1,
    "explanation": "Before the beginning of a flag or domestic flight, the aircraft dispatcher shall provide the pilot-in-command with all available weather reports and forecasts of weather phenomena that may affect the safety of flight. (PLT398, AA.I.G.K4) — 14 CFR §121.601",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-39 · question 8284 · ATM, ADX",
    "sourceQuestionId": "8284",
    "sourceEdition": "2025–2026",
    "sourcePage": 39,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8232",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "A domestic air carrier flight has a delay while on the ground, at an intermediate airport. How long before a redispatch release is required?",
    "options": [
      "Not more than 1 hour.",
      "Not more than 2 hours.",
      "More than 6 hours."
    ],
    "correctIndex": 0,
    "explanation": "Except when a domestic air carrier airplane lands at an intermediate airport specified in the original dispatch release and remains there for not more than 1 hour, no person may start a flight unless an aircraft dispatcher specifically authorizes that flight. (PLT452, AA.II.A.K2e) — 14 CFR §121.593 Answer (B) is incorrect because domestic air carriers may remain at an intermediate stop for 1 hour before a redispatch release is required. Answer (C) is incorrect because flag, supplemental, and commercial operators may remain at an intermediate stop up to 6 hours before a redispatch release is required.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-40 · question 8232 · ATM, ADX",
    "sourceQuestionId": "8232",
    "sourceEdition": "2025–2026",
    "sourcePage": 40,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8260",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "A domestic air carrier airplane lands at an intermediate airport at 1815Z. The latest time it may depart without a specific authorization from an aircraft dispatcher is",
    "options": [
      "1945Z.",
      "1915Z.",
      "1845Z."
    ],
    "correctIndex": 1,
    "explanation": "Except when a domestic air carrier airplane lands at an intermediate airport specified in the original dispatch release and remains there for not more than 1 hour, no person may start a flight unless an aircraft dispatcher specifically authorizes that flight. (PLT398, AA.II.A.K2e) — 14 CFR §121.593",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-40 · question 8260 · ATM, ADX",
    "sourceQuestionId": "8260",
    "sourceEdition": "2025–2026",
    "sourcePage": 40,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8259",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "A flag air carrier flight lands at an intermediate airport at 1805Z. The latest time that it may depart without being redispatched is",
    "options": [
      "2005Z.",
      "1905Z.",
      "0005Z."
    ],
    "correctIndex": 2,
    "explanation": "No person may continue a flag air carrier flight from an intermediate airport without redispatch if the airplane has been on the ground more than 6 hours. (PLT398, AA.II.A.K2e) — 14 CFR §121.595",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-40 · question 8259 · ATM, ADX",
    "sourceQuestionId": "8259",
    "sourceEdition": "2025–2026",
    "sourcePage": 40,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8266",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "When a flag air carrier airplane lands at an intermediate airport at 1822Z, what is the latest time it may continue a flight without receiving a redispatch authorization?",
    "options": [
      "1922Z.",
      "1952Z.",
      "0022Z."
    ],
    "correctIndex": 2,
    "explanation": "No person may continue a flag air carrier flight from an intermediate airport without redispatch if the airplane has been on the ground more than 6 hours. (PLT398, AA.II.A.K2e) — 14 CFR §121.595",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-40 · question 8266 · ATM, ADX",
    "sourceQuestionId": "8266",
    "sourceEdition": "2025–2026",
    "sourcePage": 40,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8267",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "If a flag air carrier flight lands at an intermediate airport at 1845Z, and experiences a delay, what is the latest time it may depart for the next airport without a redispatch release?",
    "options": [
      "1945Z.",
      "2015Z.",
      "0045Z."
    ],
    "correctIndex": 2,
    "explanation": "No person may continue a flag air carrier flight from an intermediate airport without redispatch if the airplane has been on the ground more than 6 hours. (PLT398, AA.II.A.K2e) — 14 CFR §121.595",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-40 · question 8267 · ATM, ADX",
    "sourceQuestionId": "8267",
    "sourceEdition": "2025–2026",
    "sourcePage": 40,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8226",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "What information must the pilot-in-command of a supplemental air carrier flight or commercial operator carry to the destination airport?",
    "options": [
      "Cargo and passenger distribution information.",
      "Copy of the flight plan.",
      "Names of all crewmembers and designated pilot-in-command."
    ],
    "correctIndex": 1,
    "explanation": "The pilot-in-command shall carry in the airplane to its destination: load manifest, flight release, airworthiness release, pilot route certification, and flight plan. (PLT400, AA.II.A.K2e) — 14 CFR §121.687 Answer (A) is incorrect because this information is only part of the load manifest. Answer (C) is incorrect because this is only one element of the flight release which is required on board.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-40 · question 8226 · ATM, ADX",
    "sourceQuestionId": "8226",
    "sourceEdition": "2025–2026",
    "sourcePage": 40,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8286",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "Which documents are required to be carried aboard each domestic air carrier flight?",
    "options": [
      "Load manifest (or information from it) and flight release.",
      "Dispatch release and weight and balance release.",
      "Dispatch release, load manifest (or information from it), and flight plan."
    ],
    "correctIndex": 2,
    "explanation": "The pilot-in-command of a domestic or flag air carrier flight shall carry in the airplane to its destination: 1. A copy of the completed load manifest; 2. A copy of the dispatch release; and 3. A copy of the flight plan. (PLT400, AA.II.A.K2e) — 14 CFR §121.695",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-41 · question 8286 · ATM, ADX",
    "sourceQuestionId": "8286",
    "sourceEdition": "2025–2026",
    "sourcePage": 41,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8288",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "A domestic or flag air carrier shall keep copies of the flight plans, dispatch releases, and load manifests for at least",
    "options": [
      "3 months.",
      "6 months.",
      "30 days."
    ],
    "correctIndex": 0,
    "explanation": "The air carrier shall keep copies of the flight plans, dispatch releases, and load manifests for at least 3 months. (PLT453, AA.II.A.K2e) — 14 CFR §121.695",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-41 · question 8288 · ATM, ADX",
    "sourceQuestionId": "8288",
    "sourceEdition": "2025–2026",
    "sourcePage": 41,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8296",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "Which documents are required to be carried aboard each flag air carrier flight?",
    "options": [
      "Dispatch release, flight plan, and weight and balance release.",
      "Load manifest, flight plan, and flight release.",
      "Dispatch release, load manifest, and flight plan."
    ],
    "correctIndex": 2,
    "explanation": "The pilot-in-command of a domestic or flag air carrier flight shall carry in the airplane to its destination: 1. A copy of the completed load manifest; 2. A copy of the dispatch release; and 3. A copy of the flight plan. (PLT400, AA.II.A.K2e) — 14 CFR §121.695 Answer (A) is incorrect because a dispatch release is required but there is no required document called a weight and balance release. Answer (B) is incorrect because a flight release is used by supplemental air carriers and commercial operators.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-41 · question 8296 · ATM, ADX",
    "sourceQuestionId": "8296",
    "sourceEdition": "2025–2026",
    "sourcePage": 41,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8287",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "How long shall a supplemental air carrier or commercial operator retain a record of the load manifest, airworthiness release, pilot route certification, flight release, and flight plan?",
    "options": [
      "1 month.",
      "3 months.",
      "12 months."
    ],
    "correctIndex": 1,
    "explanation": "A supplemental air carrier must retain a copy of each load manifest, flight release, and flight plan at its principal operations base for at least 3 months. (PLT453, AA.II.A.K2e) — 14 CFR §121.697",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-41 · question 8287 · ATM, ADX",
    "sourceQuestionId": "8287",
    "sourceEdition": "2025–2026",
    "sourcePage": 41,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8291",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "The certificated air carrier and operators who must attach to, or include on, the flight release form the name of each flight crewmember, flight attendant, and designated pilot-in-command are",
    "options": [
      "supplemental and commercial.",
      "supplemental and domestic.",
      "flag and commercial."
    ],
    "correctIndex": 0,
    "explanation": "Supplemental air carrier and commercial operators must attach to, or include on, the flight release form, containing at least the following information concerning each flight: 1. Company or organization name; 2. Make, model, and registration number of the aircraft being used; 3. Flight or trip number and the date of the flight; 4. Name of each flight crewmember, flight attendant, and pilot designated as PIC; 5. Departure airport, destination airports, alternate airports, and route; 6. Minimum fuel supply; and 7. A statement of the type of operation (IFR, VFR). (PLT455, AA.II.A.K2e) — 14 CFR §121.689 Answers (B) and (C) are incorrect because domestic and flag carriers, unlike supplemental and commercial operators, utilize a dispatch release. Commercial operators and supplemental carriers utilize a flight release. A flight release contains the crew names, but a dispatch release does not.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-41 · question 8291 · ATM, ADX",
    "sourceQuestionId": "8291",
    "sourceEdition": "2025–2026",
    "sourcePage": 41,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8295",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "The information required in the flight release for supplemental air carriers and commercial operators that is not required in the dispatch release for flag and domestic air carriers is the",
    "options": [
      "weather reports and forecasts.",
      "names of all crewmembers.",
      "minimum fuel supply."
    ],
    "correctIndex": 1,
    "explanation": "The flight release of a supplemental air carrier or commercial operator may be in any form but must contain at least the following information concerning each flight: 1. Company or organization name; 2. Make, model, and registration number of the aircraft being used; 3. Flight or trip number and the date of the flight; 4. Name of each flight crewmember, flight attendant, and pilot designated as PIC; 5. Departure airport, destination airports, alternate airports, and route; 6. Minimum fuel supply; and 7. A statement of the type of operation (IFR, VFR). The dispatch release of a flag or domestic air carrier may be in any form but must contain at least the following information concerning the flight: 1. Identification number of the aircraft; 2. Trip number; 3. Departure airport, intermediate stops, destination airports, and alternate airports; 4. A statement of the type of operation (IFR, VFR); 5. Minimum fuel supply. (PLT412, AA.II.A.K2e) — 14 CFR §121.689 Answers (A) and (C) are incorrect because weather reports and forecasts and minimum fuel supply information are required in the flight release for supplemental and commercial operators and in the dispatch release for flag and domestic air carriers.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-42 · question 8295 · ATM, ADX",
    "sourceQuestionId": "8295",
    "sourceEdition": "2025–2026",
    "sourcePage": 42,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9746",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "Before an ETOPS flight may commence, an ETOPS",
    "options": [
      "preflight check must be conducted by a certified A&P and signed off in the logbook.",
      "pre-departure service check must be certified by a PDSC Signatory Person.",
      "pre-departure check must be signed off by an A&P or the PIC for the flight."
    ],
    "correctIndex": 1,
    "explanation": "An appropriately trained, ETOPS-qualified maintenance person must accomplish and certify by signature ETOPS specific tasks. Before an ETOPS flight may commence, an ETOPS pre-departure service check (PDSC) signatory person, who has been authorized by the certificate holder, must certify by signature that the ETOPS PDSC has been completed. (PLT425, AA.II.A.K2e) — 14 CFR §121.374",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-42 · question 9746 · ATM",
    "sourceQuestionId": "9746",
    "sourceEdition": "2025–2026",
    "sourcePage": 42,
    "sourceCategories": [
      "ATM"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9746_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "An ETOPS entry point means",
    "options": [
      "the first entry point on the route of flight of an ETOPS flight using one-engine-inoperative cruise speed that is more than 60 minutes from an adequate airport for airplanes having two engines.",
      "the first entry point on the route of flight of an ETOPS flight using one-engine-inoperative cruise speed that is more than 200 minutes from an adequate airport for airplanes having more than two engines.",
      "the first entry point on the route of flight of an ETOPS flight using one-engine-inoperative cruise speed that is more than 90 minutes from an adequate airport for airplanes having two engines."
    ],
    "correctIndex": 0,
    "explanation": "An ETOPS entry point is the first point on the route of an ETOPS flight that is (1) more than 60 minutes from an adequate airport for airplanes with two engines, and (2) more than 180 minutes from an adequate airport for passenger-carrying airplanes with more than two engines. This is determined using a one-engine-inoperative cruise speed under standard conditions in still air. (PLT425, AA.I.G.K4) — 14 CFR §121.7",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-42 · question 9746-1 · ATM",
    "sourceQuestionId": "9746-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 42,
    "sourceCategories": [
      "ATM"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9746_2",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "For flight planning, a Designated ETOPS Alternate Airport",
    "options": [
      "for ETOPS up to 180 minutes, must have RFFS equivalent to that specified by ICAO category 4, unless the airport’s RFFS can be augmented by local fire fighting assets within 30 minutes.",
      "for ETOPS up to 180 minutes, must have RFFS equivalent to that specified by ICAO category 3, unless the airport’s RFFS can be augmented by local fire fighting assets within 45 minutes.",
      "for ETOPS up to 180 minutes, must have RFFS equivalent to that specified by ICAO category 4, unless the airport’s RFFS can be augmented by local fire fighting assets within 45 minutes."
    ],
    "correctIndex": 0,
    "explanation": "For ETOPS up to 180 minutes, each designated ETOPS alternate airport must have RFFS equivalent to that specified by ICAO as Category 4 or higher. If the equipment and personnel required are not immediately available at an airport, the certificate holder may still list the airport on the dispatch or flight release if the airport’s RFFS can be augmented from local fire fighting assets. A 30-minute response time for augmentation is adequate if the local assets can be notified while the diverting airplane is en route. (PLT398, AA.I.G.K4) — 14 CFR §121.106",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-43 · question 9746-2 · ATM",
    "sourceQuestionId": "9746-2",
    "sourceEdition": "2025–2026",
    "sourcePage": 43,
    "sourceCategories": [
      "ATM"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9761",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "What is considered “north polar”?",
    "options": [
      "north of 60° N latitude.",
      "north of 68° N latitude.",
      "north of 78° N latitude."
    ],
    "correctIndex": 2,
    "explanation": "As an example, operations in the north polar area and south polar area require a specific passenger recovery plan for each diversion airport. The north polar area is the entire area north of 78° N latitude. (PLT425, AA.I.G.K4) — 14 CFR §121.7",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-43 · question 9761 · ALL",
    "sourceQuestionId": "9761",
    "sourceEdition": "2025–2026",
    "sourcePage": 43,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9762",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "What is considered “south polar”?",
    "options": [
      "south of 60° S latitude.",
      "south of 68° S latitude.",
      "south of 78° S latitude."
    ],
    "correctIndex": 0,
    "explanation": "As an example, operations in the north polar area and south polar area require a specific passenger recovery plan for each diversion airport. The south polar area is the entire area south of 60° S latitude. (PLT425, AA.I.G.K4) — 14 CFR §121.7",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-43 · question 9762 · ALL",
    "sourceQuestionId": "9762",
    "sourceEdition": "2025–2026",
    "sourcePage": 43,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8281",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "Who is responsible for obtaining information on all current airport conditions, weather, and irregularities of navigation facilities for a supplemental air carrier flight?",
    "options": [
      "Aircraft dispatcher.",
      "Director of operations or flight follower.",
      "Pilot-in-command."
    ],
    "correctIndex": 2,
    "explanation": "Before beginning a flight, each pilot-in-command of a supplemental air carrier or commercial operator flight shall obtain all available current reports or information on airport conditions and irregularities or navigation facilities that may affect the safety of the flight. (PLT444, AA.II.A.K5) — 14 CFR §121.603 Answer (A) is incorrect because an aircraft dispatcher is responsible for briefing a flag or domestic (not supplemental) air carrier pilot. Answer (B) is incorrect because the director of operations (who may also be the general manager) is an administrative person, responsible for the day-to-day operations and not usually involved in specific flight operations.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-43 · question 8281 · ATM, ADX",
    "sourceQuestionId": "8281",
    "sourceEdition": "2025–2026",
    "sourcePage": 43,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8282",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Dispatching and Flight Release",
    "materia": "operaciones",
    "text": "During a supplemental air carrier flight, who is responsible for obtaining information on meteorological conditions?",
    "options": [
      "Aircraft dispatcher.",
      "Pilot-in-command.",
      "Director of operations or flight follower."
    ],
    "correctIndex": 1,
    "explanation": "During a flight, the pilot-in-command of a supplemental air carrier or commercial operator flight shall obtain any additional available information of meteorological conditions and irregularities of facilities and services that may affect the safety of the flight. (PLT444, AA.II.A.K5) — 14 CFR §121.603 Answer (A) is incorrect because an aircraft dispatcher is responsible for obtaining weather information for a flag or domestic air carrier flight. Answer (C) is incorrect because the director of operations (who may also be the general manager) or flight follower is an administrative person, responsible for day-to-day operations and not usually involved in specific flight operations.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-43 · question 8282 · ATM, ADX",
    "sourceQuestionId": "8282",
    "sourceEdition": "2025–2026",
    "sourcePage": 43,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8268",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Fuel Requirements",
    "materia": "operaciones",
    "text": "The reserve fuel supply for a domestic air carrier flight is",
    "options": [
      "30 minutes plus 15 percent at normal fuel consumption in addition to the fuel required to the alternate airport.",
      "45 minutes at normal fuel consumption in addition to the fuel required to fly to and land at the most distant alternate airport.",
      "45 minutes at normal fuel consumption in addition to the fuel required to the alternate airport."
    ],
    "correctIndex": 1,
    "explanation": "For domestic operations, no person may dispatch or takeoff an airplane unless it has enough fuel to: 1. Fly to the airport to which it was dispatched; 2. Thereafter, to fly to and land at the most distant alternate airport (if an alternate is required); and 3. Thereafter, to fly for 45 minutes at normal cruising fuel consumption. (PLT413, AA.I.G.K4) — 14 CFR §121.639",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-44 · question 8268 · ATM, ADX",
    "sourceQuestionId": "8268",
    "sourceEdition": "2025–2026",
    "sourcePage": 44,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8269",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Fuel Requirements",
    "materia": "operaciones",
    "text": "The minimum amount (planned) of fuel to be a board a flag air carrier turbojet airplane on a flight with in the 48 contiguous United States, after reaching the most distant alternate airport, should be",
    "options": [
      "45 minutes at normal cruising fuel consumption.",
      "2 hours at normal cruising fuel consumption.",
      "enough fuel to return to the destination airport or to fly for 90 minutes at normal cruising fuel consumption, whichever is less."
    ],
    "correctIndex": 0,
    "explanation": "A turbine-engined flag air carrier operation within the 48 contiguous United States and the District of Columbia may use the fuel requirements of a domestic air carrier. For domestic operations, no person may dispatch or takeoff in an airplane unless it has enough fuel to: 1. Fly to the airport to which it was dispatched; 2. Thereafter, to fly to and land at the most distant alternate airport (if an alternate is required); and 3. Thereafter, to fly for 45 minutes at normal cruising fuel consumption. (PLT413, AA.I.G.K4) — 14 CFR §121.639 Answer (B) is incorrect because 2 hours normal cruising fuel is required at the destination airport when an alternate is not specified and the flight is conducted outside the 48 contiguous United States. Answer (C) is incorrect because there is no provision for return to the destination airport in calculating fuel requirements.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-45 · question 8269 · ATM, ADX",
    "sourceQuestionId": "8269",
    "sourceEdition": "2025–2026",
    "sourcePage": 45,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8271",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Fuel Requirements",
    "materia": "operaciones",
    "text": "For a flag air carrier flight to be released to an island airport for which an alternate airport is not available, a turbojet-powered airplane must have enough fuel to fly to that airport and thereafter to fly",
    "options": [
      "at least 2 hours at normal cruising fuel consumption.",
      "for 3 hours at normal cruising fuel consumption.",
      "back to the departure airport."
    ],
    "correctIndex": 0,
    "explanation": "No person may dispatch a turbojet-powered airplane to an airport for which no alternate is available unless it has enough fuel, considering wind and other weather conditions, to fly to that airport and thereafter to fly for at least 2 hours at normal cruising fuel consumption. (PLT413, AA.I.G.K4) — 14 CFR §121.645",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-45 · question 8271 · ATM, ADX",
    "sourceQuestionId": "8271",
    "sourceEdition": "2025–2026",
    "sourcePage": 45,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8272",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Fuel Requirements",
    "materia": "operaciones",
    "text": "An alternate airport is not required for a supplemental or commercial air carrier, turbojet-powered airplane on an IFR flight outside the 48 contiguous United States, if enough fuel",
    "options": [
      "is aboard to fly to the destination at normal cruise speed and thereafter at least 2 hours at normal holding speed.",
      "is aboard the airplane to fly to the destination and then to fly for at least 2 more hours at normal cruising fuel consumption.",
      "to fly over the destination for 30 minutes at holding airspeed at 1,500 feet AGL is carried aboard the airplane."
    ],
    "correctIndex": 1,
    "explanation": "No person may dispatch a turbojet-powered airplane to an airport for which no alternate is available unless it has enough fuel, considering wind and other weather conditions, to fly to that airport and thereafter to fly for at least 2 hours at normal cruising fuel consumption. (PLT413, AA.I.G.K4) — 14 CFR §121.645",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-45 · question 8272 · ATM, ADX",
    "sourceQuestionId": "8272",
    "sourceEdition": "2025–2026",
    "sourcePage": 45,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8276",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Fuel Requirements",
    "materia": "operaciones",
    "text": "A turbine-engine-powered flag air carrier airplane is released to an airport which has no available alternate. What is the required fuel reserve?",
    "options": [
      "2 hours at normal cruise speed in a no wind condition fuel consumption.",
      "2 hours at normal cruise fuel consumption.",
      "30 minutes, plus 10 percent of the total flight time."
    ],
    "correctIndex": 1,
    "explanation": "No person may dispatch a turbojet-powered airplane to an airport for which no alternate is available unless it has enough fuel, considering wind and other weather conditions, to fly to that airport and thereafter to fly for at least 2 hours at normal cruising fuel consumption. (PLT413, AA.I.G.K4) — 14 CFR §121.645",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-45 · question 8276 · ATM, ADX",
    "sourceQuestionId": "8276",
    "sourceEdition": "2025–2026",
    "sourcePage": 45,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8273",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Fuel Requirements",
    "materia": "operaciones",
    "text": "The fuel reserve required for a turbine-engine-powered (other than turbopropeller) supplemental air carrier airplane upon arrival over the most distant alternate airport outside the 48 contiguous United States is",
    "options": [
      "30 minutes at holding speed, at 1,500 feet over the airport.",
      "30 minutes, over the airport, at 1,500 feet, at cruising speed.",
      "2 hours at the normal cruising fuel consumption rate."
    ],
    "correctIndex": 0,
    "explanation": "For any flag air carrier, supplemental air carrier, or commercial operator operation outside the 48 contiguous United States or District of Columbia, no person may release for flight or takeoff a turbine engine-powered airplane (other than a turbopropeller-powered airplane) unless, considering wind and other weather conditions expected, it has enough fuel: 1. To fly to and land at the airport to which it was released; 2. After that, to fly for a period of 10 percent of the total time required to fly from the airport of departure to and land at, the airport to which it was released; 3. After that, to fly to and land at the most distant alternate airport specified in the flight release, if an alternate is required; and 4. After that, to fly for 30 minutes at holding speed at 1,500 feet above the alternate airport (or destination airport if no alternate is required) under standard temperature conditions. (PLT413, AA.I.G.K4) — 14 CFR §121.645",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-46 · question 8273 · ATM, ADX",
    "sourceQuestionId": "8273",
    "sourceEdition": "2025–2026",
    "sourcePage": 46,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8270",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Fuel Requirements",
    "materia": "operaciones",
    "text": "What is the fuel reserve requirement for a commercially operated reciprocating-engine-powered airplane flying within the 48 contiguous United States upon arrival at the most distant alternate airport specified in the flight release? Enough fuel to fly",
    "options": [
      "30 minutes plus 15 percent of total time required to fly at normal cruising consumption to the alternate.",
      "to fly for 90 minutes at normal cruising fuel consumption.",
      "45 minutes at normal cruising fuel consumption."
    ],
    "correctIndex": 2,
    "explanation": "No person may release for flight or takeoff a nonturbine or turbopropeller-powered airplane unless, considering the wind and other weather conditions expected, it has enough fuel to: 1. Fly to the airport to which it was released; 2. Thereafter, to fly to and land at the most distant alternate airport specified in the flight release; and 3. Thereafter, to fly for 45 minutes at normal cruising fuel consumption. (PLT413, AA.I.G.K4) — 14 CFR §121.643",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-46 · question 8270 · ATM, ADX",
    "sourceQuestionId": "8270",
    "sourceEdition": "2025–2026",
    "sourcePage": 46,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8277",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Fuel Requirements",
    "materia": "operaciones",
    "text": "The fuel reserve required for a reciprocating-engine-powered supplemental air carrier airplane upon arrival at the most distant alternate airport during a flight in the 48 contiguous United States is",
    "options": [
      "45 minutes at normal cruising fuel consumption.",
      "the fuel required to fly to the alternate, plus 10 percent.",
      "3 hours at normal cruising fuel consumption."
    ],
    "correctIndex": 0,
    "explanation": "No person may release for flight or takeoff a nonturbine or turbopropeller-powered airplane unless, considering the wind and other weather conditions expected, it has enough fuel to: 1. Fly to the airport to which it was released; 2. Thereafter, to fly to and land at the most distant alternate airport specified in the flight release; and 3. Thereafter, to fly for 45 minutes at normal cruising fuel consumption. (PLT413, AA.I.G.K4) — 14 CFR §121.643",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-46 · question 8277 · ATM, ADX",
    "sourceQuestionId": "8277",
    "sourceEdition": "2025–2026",
    "sourcePage": 46,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8274",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Fuel Requirements",
    "materia": "operaciones",
    "text": "Upon arriving at the most distant airport, what is the fuel reserve requirement for a turbopropeller flag air carrier airplane?",
    "options": [
      "90 minutes at holding altitude and speed fuel consumption or 30 minutes plus 15 percent of cruise fuel consumption, whichever is less.",
      "45 minutes at holding altitude.",
      "30 minutes plus 15 percent of the total time required, or 90 minutes at normal cruise, whichever is less."
    ],
    "correctIndex": 2,
    "explanation": "No person may dispatch or takeoff in a flag air carrier nonturbine or turbopropeller-powered airplane unless, considering the wind and other weather conditions expected, it has enough fuel: 1. To fly to and land at the airport to which it is dispatched; 2. Thereafter, to fly to and land at the most distant alternate airport specified in the dispatch release; and 3. Thereafter to fly for 30 minutes plus 15 percent of numbers 1 and 2 above, or to fly for 90 minutes at normal cruising fuel consumption, whichever is less. (PLT413, AA.I.G.K4) — 14 CFR §121.641",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-46 · question 8274 · ATM, ADX",
    "sourceQuestionId": "8274",
    "sourceEdition": "2025–2026",
    "sourcePage": 46,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8275",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Fuel Requirements",
    "materia": "operaciones",
    "text": "The fuel reserve required, for a turbopropeller supplemental air carrier airplane upon the arrival at a destination airport for which an alternate airport is not specified, is",
    "options": [
      "3 hours at normal consumption, no wind condition.",
      "3 hours at normal cruising fuel consumption.",
      "2 hours at normal cruising fuel consumption."
    ],
    "correctIndex": 1,
    "explanation": "No supplemental air carrier or commercial operator may release a nonturbine or turbopropeller-powered airplane to an airport for which no alternate is specified unless it has enough fuel, considering wind and weather conditions expected, to fly to that airport and thereafter to fly for 3 hours at normal cruising fuel consumption. (PLT413, AA.I.G.K4) — 14 CFR §121.643",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-47 · question 8275 · ATM, ADX",
    "sourceQuestionId": "8275",
    "sourceEdition": "2025–2026",
    "sourcePage": 47,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8131",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "A certificate holder is notified that a person specifically authorized to carry a deadly weapon is to be aboard an aircraft. Except in an emergency, how long before loading that flight should the air carrier be notified?",
    "options": [
      "Notification is not required, if the certificate holder has a security coordinator.",
      "A minimum of 1 hour.",
      "A minimum of 2 hours."
    ],
    "correctIndex": 1,
    "explanation": "The certificate holder, except in an emergency, must be given at least 1 hour notice when an authorized person intends to have a weapon accessible in flight. (PLT498, AA.I.G.S1) — 49 CFR §1544.219",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-49 · question 8131 · ALL",
    "sourceQuestionId": "8131",
    "sourceEdition": "2025–2026",
    "sourcePage": 49,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8137",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "When a passenger notifies the certificate holder prior to checking baggage that an unloaded weapon is in the baggage, what action is required by regulation regarding this baggage?",
    "options": [
      "The baggage may be carried in the flightcrew compartment, provided the baggage remains locked and the key is given to the pilot-in-command.",
      "The baggage must remain locked and carried in an area that is inaccessible to the passenger, and only the passenger retains the key.",
      "The baggage must remain locked and stored where it would be inaccessible, and custody of the key shall remain with a designated crewmember."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may knowingly permit any person to transport any unloaded firearm in checked baggage unless the baggage in which it is carried is locked and only the passenger checking the baggage retains the key or combination. The baggage containing the firearm must be carried in an area, other than the flight crew compartment, that is inaccessible to passengers. (PLT498, AA.I.G.S1) — 49 CFR §1544.203(f) Answers (A) and (C) are incorrect because the baggage containing the unloaded firearm will be carried in the baggage area, and only the passenger checking the baggage retains the key.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-49 · question 8137 · ALL",
    "sourceQuestionId": "8137",
    "sourceEdition": "2025–2026",
    "sourcePage": 49,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9763",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "What is meant by “sterile flight deck”?",
    "options": [
      "All preflight checks are complete and the aircraft is ready for engine starting.",
      "Crewmembers refrain from nonessential activities during critical phases of flight.",
      "Crewmembers are seated and buckled at their required stations."
    ],
    "correctIndex": 1,
    "explanation": "Commonly known as the sterile flight deck rule, 14 CFR §121.542 requires flight crewmembers to refrain from nonessential activities during critical phases of flight. As defined in the regulation, critical phases of flight are all ground operations involving taxi, takeoff, and landing, and all other flight operations below 10,000 feet except cruise flight. Nonessential activities include such activities as eating, reading a newspaper, or chatting. (PLT498, AA.I.E.K8) — 14 CFR §121.542",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-49 · question 9763 · ALL",
    "sourceQuestionId": "9763",
    "sourceEdition": "2025–2026",
    "sourcePage": 49,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9763_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "Under 14 CFR Part 121, when may nonessential communications take place below 10,000 feet?",
    "options": [
      "In VMC conditions.",
      "Before the final approach fix.",
      "During cruise flight."
    ],
    "correctIndex": 2,
    "explanation": "Commonly known as the sterile flight deck rule, 14 CFR §121.542 requires flight crewmembers to refrain from nonessential activities during critical phases of flight. As defined in the regulation, critical phases of flight are all ground operations involving taxi, takeoff, and landing, and all other flight operations below 10,000 feet except cruise flight. Nonessential activities include such activities as eating, reading a newspaper, or chatting. (PLT498, AA.I.G.K4) — 14 CFR §121.542",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-49 · question 9763-1 · ALL",
    "sourceQuestionId": "9763-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 49,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8132",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "When a person in the custody of law enforcement personnel is scheduled on a flight, what procedures are required regarding boarding of this person and the escort?",
    "options": [
      "They shall be boarded before all other passengers board, and deplaned after all the other passengers have left the aircraft.",
      "They shall be boarded after all other passengers board, and deplaned before all the other passengers leave the aircraft.",
      "They shall board and depart before the other passengers."
    ],
    "correctIndex": 0,
    "explanation": "When a person in custody of law enforcement is to be carried on a flight, the prisoner and escort must be boarded before any other passengers and deplaned after all other passengers have deplaned. (PLT325, AA.I.G.S1) — 49 CFR §1544.221(f)(1)",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-49 · question 8132 · ALL",
    "sourceQuestionId": "8132",
    "sourceEdition": "2025–2026",
    "sourcePage": 49,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8136",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "Which applies to the carriage of a person in the custody of law enforcement personnel?",
    "options": [
      "The air carrier is not allowed to serve beverages to the person in custody or the law enforcement escort.",
      "No more than one person considered to be in the maximum risk category may be carried on a flight, and that person must have at least two armed law enforcement escorts.",
      "The person in custody must be seated between the escort and the aisle."
    ],
    "correctIndex": 1,
    "explanation": "No more than one passenger, of whom the certificate holder has been notified as being in a maximum risk category, can be carried on an airplane. (PLT325, AA.I.G.S1) — 49 CFR §1544.221(c)(2), (d)(3)",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-50 · question 8136 · ALL",
    "sourceQuestionId": "8136",
    "sourceEdition": "2025–2026",
    "sourcePage": 50,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8225",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "Which announcement must be made if the seat belt sign will be turned off during flight?",
    "options": [
      "Clearly explain the location of the fire extinguishers and emergency exits.",
      "Passenger should keep their seat belts fastened while seated.",
      "Passengers are free to leave their seats once the seat belt sign is turned off."
    ],
    "correctIndex": 1,
    "explanation": "After each takeoff, immediately before or immediately after turning the seat belt sign off, an announcement shall be made that passengers should keep their seat belts fastened, while seated, even when the seat belt sign is off. (PLT384, AA.I.G.K4) — 14 CFR §121.571",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-50 · question 8225 · ATM, ADX",
    "sourceQuestionId": "8225",
    "sourceEdition": "2025–2026",
    "sourcePage": 50,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8181",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "A passenger briefing by a crewmember shall be given, instructing passengers on the necessity of using oxygen in the event of cabin depressurization, prior to flights conducted above",
    "options": [
      "FL200.",
      "FL240.",
      "FL250."
    ],
    "correctIndex": 2,
    "explanation": "Before flight is conducted above FL250, a crewmember shall instruct the passengers on the necessity of using oxygen in the event of cabin depressurization, and shall point out to them the location and demonstrate the use of the oxygen dispensing equipment. (PLT438, AA.I.A.K11) — 14 CFR §121.333",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-50 · question 8181 · ATM, ADX",
    "sourceQuestionId": "8181",
    "sourceEdition": "2025–2026",
    "sourcePage": 50,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8153",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "When may two persons share one approved safety belt in a lounge seat?",
    "options": [
      "When one is an adult and one is a child under 3 years of age.",
      "Only during the en route flight.",
      "During all operations except the takeoff and landing portion of a flight."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate an airplane unless there are available during the takeoff, enroute flight, and landing an approved seatbelt for separate use by each person on board the airplane who has reached their second birthday, except that two persons occupying a berth may share one approved seatbelt and two persons occupying a multiple lounge or divan seat may share one approved seatbelt during en route flight only. (PLT465, AA.I.G.K4) — 14 CFR §121.311 Answer (A) is incorrect because the regulations do not specify an age of persons sharing a seatbelt on a lounge seat. Sharing a seat-belt in a lounge seat can only be done during the enroute portion of the flight. Answer (C) is incorrect because two persons may share one seatbelt in a lounge seat only during the enroute portion of the flight, which excludes taxi and takeoff as well as landing.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-50 · question 8153 · ATM, ADX",
    "sourceQuestionId": "8153",
    "sourceEdition": "2025–2026",
    "sourcePage": 50,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8244",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "The pilot-in-command has emergency authority to exclude any and all persons from admittance to the flight deck",
    "options": [
      "except a FAA inspector doing enroute checks.",
      "in the interest of safety.",
      "except persons who have authorization from the certificate holder and the FAA or NTSB."
    ],
    "correctIndex": 1,
    "explanation": "The pilot-in-command has the emergency authority to exclude anyone from the flight deck in the interest of safety. (PLT444, AA.I.G.K4) — 14 CFR §121.547 Answers (A) and (C) are incorrect because persons who have specific authorization of the certificate holder and FAA inspectors may be admitted to the flight deck except when excluded in an emergency.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-50 · question 8244 · ATM, ADX",
    "sourceQuestionId": "8244",
    "sourceEdition": "2025–2026",
    "sourcePage": 50,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8233",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "If an intoxicated person creates a disturbance aboard an air carrier aircraft, the certificate holder must submit a report, concerning the incident, to the Administrator within",
    "options": [
      "7 days.",
      "5 days.",
      "48 hours."
    ],
    "correctIndex": 1,
    "explanation": "If an intoxicated person causes an incident on the aircraft the certificate holder shall, within 5 days, report that incident to the Administrator. (PLT366, AA.I.G.K4) — 14 CFR §121.575",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-51 · question 8233 · ATM, ADX",
    "sourceQuestionId": "8233",
    "sourceEdition": "2025–2026",
    "sourcePage": 51,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8234",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "When carrying a passenger aboard an all-cargo aircraft, which of the following applies?",
    "options": [
      "The passenger must have access to a seat in the pilot compartment.",
      "The pilot-in-command may authorize the passenger to be admitted to the crew compartment.",
      "Crew-type oxygen must be provided for the passenger."
    ],
    "correctIndex": 1,
    "explanation": "When a passenger is allowed on an all-cargo flight, the pilot-in-command may authorize admittance to the flight deck. (PLT444, AA.I.G.K4) — 14 CFR §121.583 Answer (A) is incorrect because the seat does not have to be on the flight deck, but there must be an approved seat with an approved seatbelt for each person. Answer (C) is incorrect because crewtype oxygen is not required for passengers. It is only required that the person be briefed on the use of oxygen and emergency oxygen equipment.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-51 · question 8234 · ATM, ADX",
    "sourceQuestionId": "8234",
    "sourceEdition": "2025–2026",
    "sourcePage": 51,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8139",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "What requirement must be met regarding cargo that is carried anywhere in the passenger compartment of an air carrier airplane?",
    "options": [
      "The bin in which the cargo is carried may not be installed in a position that restricts access to, or use of, any exit.",
      "The bin in which the cargo is carried may not be installed in a position that restricts access to, or use of, any aisle in the passenger compartment.",
      "The container or bin in which the cargo is carried must be made of material which is at least flash resistant."
    ],
    "correctIndex": 1,
    "explanation": "Cargo may be carried anywhere in the passenger compartment if it is carried in an approved cargo bin. The bin must meet the following requirements: 1. The bin must be able to withstand the load factors and emergency landing conditions applicable to the passenger seats of the airplane in which it is installed, multiplied by a factor of 1.15; 2. The cargo bin may not be installed in a position that restricts access to or use of any required emergency exit, or of the aisle in the passenger compartment; and 3. The bin must be fully enclosed and made of material that is at least flame resistant. (PLT385, AA.I.G.K4) — 14 CFR §121.285 Answer (A) is incorrect because the bin may not be installed in a position that restricts access to or use of any required emergency exit. Answer (C) is incorrect because the bin must be fully enclosed and made of material that is at least flame resistant.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-51 · question 8139 · ATM, ADX",
    "sourceQuestionId": "8139",
    "sourceEdition": "2025–2026",
    "sourcePage": 51,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8175",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "Which restriction applies to a cargo bin in a passenger compartment? The bin",
    "options": [
      "may have an open top if it is placed in front of the passengers and the cargo is secured by a cargo net.",
      "must withstand the load factor required of passenger seats, multiplied by 1.15, using the combined weight of the bin and the maximum weight of the cargo that may be carried in the bin.",
      "must be constructed of flame retardant material and fully enclosed."
    ],
    "correctIndex": 1,
    "explanation": "Cargo may be carried anywhere in the passenger compartment if it is carried in an approved cargo bin. The bin must meet the following requirements: 1. The bin must be able to withstand the load factors and emergency landing conditions applicable to the passenger seats of the airplane in which it is installed, multiplied by a factor of 1.15; 2. The cargo bin may not be installed in a position that restricts access to or use of any required emergency exit, or of the aisle in the passenger compartment; and 3. The bin must be fully enclosed and made of material that is at least flame resistant. (PLT385, AA.I.G.K4) — 14 CFR §121.285 Answers (A) and (C) are incorrect because the cargo bin must be fully enclosed, and be constructed of materials that are at least flame resistant.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-51 · question 8175 · ATM, ADX",
    "sourceQuestionId": "8175",
    "sourceEdition": "2025–2026",
    "sourcePage": 51,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8138",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Carriage of Passengers and Cargo",
    "materia": "operaciones",
    "text": "What restrictions must be observed regarding the carrying of cargo in the passenger compartment of an airplane operated under 14 CFR Part 121?",
    "options": [
      "All cargo must be separated from the passengers by a partition capable of withstanding certain load stresses.",
      "All cargo must be carried in a suitable flame resistant bin and the bin must be secured to the floor structure of the airplane.",
      "Cargo may be carried aft of a divider if properly secured by a safety belt or other tiedown having enough strength to eliminate the possibility of shifting."
    ],
    "correctIndex": 2,
    "explanation": "Cargo may be carried aft of a bulkhead or divider in any passenger compartment provided the cargo is restrained to required load factors, and it is properly secured by a safety belt or other tiedown having enough strength to eliminate the possibility of shifting under all normally anticipated flight and ground conditions. (PLT385, AA.I.G.K4) — 14 CFR §121.285 Answers (A) and (B) are incorrect because cargo may be carried in the passenger compartment if it is properly covered and secured so as not to be a hazard.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-52 · question 8138 · ATM, ADX",
    "sourceQuestionId": "8138",
    "sourceEdition": "2025–2026",
    "sourcePage": 52,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8007",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Carriage of Passengers and Cargo Requirements",
    "materia": "operaciones",
    "text": "Where must a certificate holder keep copies of completed load manifests and for what period of time?",
    "options": [
      "1 month at its principal operations base, or at a location approved by the Administrator.",
      "30 days at its principal operations base, or another location used by it and approved by the Administrator.",
      "30 days, at the flight’s destination."
    ],
    "correctIndex": 1,
    "explanation": "The certificate holder shall keep copies of completed load manifests for at least 30 days at its principal operations base, or at another location used by it and approved by the Administrator. (PLT400, AA.I.G.K5) — 14 CFR §135.63",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-52 · question 8007 · ATS, RTC",
    "sourceQuestionId": "8007",
    "sourceEdition": "2025–2026",
    "sourcePage": 52,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8008",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Carriage of Passengers and Cargo Requirements",
    "materia": "operaciones",
    "text": "Which is NOT a required item on the load manifest?",
    "options": [
      "List of passenger names and the weight of each.",
      "Aircraft registration number or flight number.",
      "Identification of crewmembers and their crew position."
    ],
    "correctIndex": 0,
    "explanation": "The load manifest must be prepared before each takeoff and must include: 1. The number of passengers; 2. The total weight of the loaded aircraft; 3. The maximum allowable takeoff weight for that flight; 4. The center of gravity limits; 5. The center of gravity of the loaded aircraft; 6. The registration number of the aircraft or flight number; 7. The origin and destination; and 8. Identification of crewmembers and their crew position assignments. (PLT440, AA.I.G.K5) — 14 CFR §135.63",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-52 · question 8008 · ATS, RTC",
    "sourceQuestionId": "8008",
    "sourceEdition": "2025–2026",
    "sourcePage": 52,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8009",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Carriage of Passengers and Cargo Requirements",
    "materia": "operaciones",
    "text": "Who is responsible for the preparation of a required load manifest?",
    "options": [
      "PIC or the dispatcher.",
      "Company official designated by the Administrator.",
      "The certificate holder."
    ],
    "correctIndex": 2,
    "explanation": "For multi-engine aircraft, each certificate holder is responsible for the preparation and accuracy of a load manifest. (PLT440, AA.I.G.K5) — 14 CFR §135.63",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-52 · question 8009 · ATS, RTC",
    "sourceQuestionId": "8009",
    "sourceEdition": "2025–2026",
    "sourcePage": 52,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8032",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Carriage of Passengers and Cargo Requirements",
    "materia": "operaciones",
    "text": "Which restriction must be observed regarding the carrying of cargo in the passenger compartment?",
    "options": [
      "It is packaged or covered to avoid possible injury to occupants.",
      "All cargo must be carried in a suitable bin and secured to a passenger seat or the floor structure of the aircraft.",
      "Cargo carried in passenger seats must be forward of all passengers."
    ],
    "correctIndex": 0,
    "explanation": "No person may carry cargo, including carry-on baggage, in or on any aircraft unless one of the three following criteria is met: 1. It is carried in an approved cargo rack, bin or compartment; 2. It is secured by approved means; or 3. If number 1 or 2 is not met, then all of the following are met: a. For cargo, it is properly secured by a safety belt or other tie-down having enough strength to eliminate the possibility of shifting under all normally anticipated flight and ground conditions, or for carry-on baggage, it is restrain ed so as to prevent its movement during air turbulence; b. It is packaged or covered to avoid possible injury to occupants; c. It does not impose any load on seats or on the floor structure that exceeds the load limitation for those components; d. It is not located in a position that obstructs the access to, or use of, any required emergency or regular exit, or the use of the aisle between the crew and passenger compartment, or located in a position that obscures any passenger’s view of the “seatbelt” sign, “no smoking” sign or any required exit sign; and e. It is not carried directly above seated occupants. (PLT385, AA.I.G.K5) — 14 CFR §135.87",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-52 · question 8032 · ATS, RTC",
    "sourceQuestionId": "8032",
    "sourceEdition": "2025–2026",
    "sourcePage": 52,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9720",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Carriage of Passengers and Cargo Requirements",
    "materia": "operaciones",
    "text": "A person whose duties include the handling or carriage of dangerous articles and/or magnetized materials must have satisfactorily completed an approved training program established by the certificate holder within the previous",
    "options": [
      "6 calendar months.",
      "12 calendar months.",
      "24 calendar months."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may use any person or perform, and no person may perform, any assigned duties and responsibilities for the handling or carriage of hazardous materials unless within the preceding 12 calendar months that person has satisfactorily completed initial or recurrent training in an appropriate training program established by the certificate holder. (PLT407, AA.I.G.K5) — 14 CFR, SFAR 99",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-53 · question 9720 · ATS, RTC",
    "sourceQuestionId": "9720",
    "sourceEdition": "2025–2026",
    "sourcePage": 53,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8039",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Carriage of Passengers and Cargo Requirements",
    "materia": "operaciones",
    "text": "In a cargo-only operation, cargo must be loaded",
    "options": [
      "so that it does not obstruct the aisle between the crew and cargo compartments.",
      "in such a manner that at least one emergency or regular exit is available to all occupants.",
      "in such a manner that at least one emergency or regular exit is available to all crewmembers, if an emergency occurs."
    ],
    "correctIndex": 1,
    "explanation": "For cargo-only operations, the cargo must be loaded so at least one emergency or regular exit is available to provide all occupants of the aircraft a means of unobstructed exit from the aircraft if an emergency occurs. (PLT385, AA.I.G.K5) — 14 CFR §135.87",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-53 · question 8039 · ATS, RTC",
    "sourceQuestionId": "8039",
    "sourceEdition": "2025–2026",
    "sourcePage": 53,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8040",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Carriage of Passengers and Cargo Requirements",
    "materia": "operaciones",
    "text": "Which is a requirement governing the carriage of cargo, on a scheduled passenger flight?",
    "options": [
      "Cargo must be carried in an approved rack, bin, or compartment.",
      "Cargo not stowed in an approved bin must be secured by a safety belt or approved tiedown device.",
      "All cargo carried in the passenger compartment must be packaged and stowed ahead of the foremost seated passenger."
    ],
    "correctIndex": 1,
    "explanation": "No person may carry cargo, including carry-on baggage, in or on any aircraft unless one of the three following criteria is met: 1. It is carried in an approved cargo rack, bin or compartment; 2. It is secured by approved means; or 3. If number 1 or 2 is not met, then all of the following are met: a. For cargo, it is properly secured by a safety belt or other tie-down having enough strength to eliminate the possibility of shifting under all normally anticipated flight and ground conditions, or for carry-on baggage, it is restrained so as to prevent its movement during air turbulence; b. It is packaged or covered to avoid possible injury to occupants; c. It does not impose any load on seats or on the floor structure that exceeds the load limitation for those components; d. It is not located in a position that obstructs the access to, or use of, any required emergency or regular exit, or the use of the aisle between the crew and passenger compartment, or located in a position that obscures any passenger’s view of the “seatbelt” sign, “no smoking” sign or any required exit sign; and e. It is not carried directly above seated occupants. (PLT385, AA.I.G.K5) — 14 CFR §135.87",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-53 · question 8040 · ATS, RTC",
    "sourceQuestionId": "8040",
    "sourceEdition": "2025–2026",
    "sourcePage": 53,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8041",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Carriage of Passengers and Cargo Requirements",
    "materia": "operaciones",
    "text": "Which is a requirement governing the carriage of carry-on baggage?",
    "options": [
      "All carry-on baggage must be restrained so that its movement is prevented during air turbulence.",
      "Carry-on baggage must be stowed under the seat in front of the owner.",
      "Pieces of carry-on baggage weighing more than 10 pounds must be carried in an approved rack or bin."
    ],
    "correctIndex": 0,
    "explanation": "No person may carry cargo, including carry-on baggage, in or on any aircraft unless one of the three following criteria is met: 1. It is carried in an approved cargo rack, bin or compartment; 2. It is secured by approved means; or 3. If number 1 or 2 is not met, then all of the following are met: a. For cargo, it is properly secured by a safety belt or other tie-down having enough strength to eliminate the possibility of shifting under all normally anticipated flight and ground conditions, or for carry-on baggage, it is restrained so as to prevent its movement during air turbulence; b. It is packaged or covered to avoid possible injury to occupants; c. It does not impose any load on seats or on the floor structure that exceeds the load limitation for those components; d. It is not located in a position that obstructs the access to, or use of, any required emergency or regular exit, or the use of the aisle between the crew and passenger compartment, or located in a position that obscures any passenger’s view of the “seatbelt” sign, “no smoking” sign or any required exit sign; and e. It is not carried directly above seated occupants. (PLT385, AA.I.G.K5) — 14 CFR §135.87",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-54 · question 8041 · ATS, RTC",
    "sourceQuestionId": "8041",
    "sourceEdition": "2025–2026",
    "sourcePage": 54,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8042",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Carriage of Passengers and Cargo Requirements",
    "materia": "operaciones",
    "text": "If carry-on baggage or cargo is carried in the passenger compartment, it must be",
    "options": [
      "stowed ahead of the foremost seated passengers and secured by approved means.",
      "placed in an approved rack, bin, or compartment installed in the aircraft.",
      "so located that it does not obstruct the access to, or the use of, any required emergency or regular exit."
    ],
    "correctIndex": 2,
    "explanation": "No person may carry cargo, including carry-on baggage, in or on any aircraft unless one of the three following criteria is met: 1. It is carried in an approved cargo rack, bin or compartment; 2. It is secured by approved means; or 3. If number 1 or 2 is not met, then all of the following are met: a. For cargo, it is properly secured by a safety belt or other tie-down having enough strength to eliminate the possibility of shifting under all normally anticipated flight and ground conditions, or for carry-on baggage, it is restrained so as to prevent its movement during air turbulence; b. It is packaged or covered to avoid possible injury to occupants; c. It does not impose any load on seats or on the floor structure that exceeds the load limitation for those components; d. It is not located in a position that obstructs the access to, or use of, any required emergency or regular exit, or the use of the aisle between the crew and passenger compartment, or located in a position that obscures any passenger’s view of the “seatbelt” sign, “no smoking” sign or any required exit sign; and e. It is not carried directly above seated occupants. (PLT385, AA.I.G.K5) — 14 CFR §135.87",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-54 · question 8042 · ATS, RTC",
    "sourceQuestionId": "8042",
    "sourceEdition": "2025–2026",
    "sourcePage": 54,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8043",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Carriage of Passengers and Cargo Requirements",
    "materia": "operaciones",
    "text": "The load manifest must be prepared prior to each takeoff for",
    "options": [
      "any aircraft with a passenger seating capacity of 10 seats or more.",
      "any aircraft with more than one engine.",
      "all helicopters and large aircraft operated by a commuter air carrier."
    ],
    "correctIndex": 1,
    "explanation": "For multi-engine aircraft, each certificate holder is responsible for the preparation and accuracy of a load manifest. (PLT440, AA.I.G.K5) — 14 CFR §135.63",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-54 · question 8043 · ATS, RTC",
    "sourceQuestionId": "8043",
    "sourceEdition": "2025–2026",
    "sourcePage": 54,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9636",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "(Refer to Legend 12.) Newport News/Williamsburg Intl is a 14 CFR Part 139 airport. The Chart Supplements U.S. contains the following entry: ARFF Index A. What is the minimum number of aircraft rescue and fire fighting vehicles, and the type and amount of fire fighting agents that the airport should have?",
    "options": [
      "Two vehicles and 600 pounds dry chemical (DC) or Halon 1211 or 500 pounds of DC plus 100 gallons of water.",
      "One vehicle and 500 pounds of dry chemical (DC) or Halon 1211 or 450 pounds DC plus 100 gallons of water.",
      "One vehicle and 500 pounds of dry chemical (DC) or Halon 1211 or 350 pounds DC and 1,000 gallons of water."
    ],
    "correctIndex": 1,
    "explanation": "FAA Legend 15 indicates that an index A airport must have at least one vehicle with either 500 pounds of DC or Halon 1211, or 450 pounds of DC plus 100 gallons of water. (PLT143, AA.II.A.K5) — Chart Supplements U.S.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-58 · question 9636 · ALL",
    "sourceQuestionId": "9636",
    "sourceEdition": "2025–2026",
    "sourcePage": 58,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": [
      "atp_2026_legend-12.png"
    ]
  },
  {
    "id": "q_la_ATP_2026_9668",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "(Refer to Legend 12 and Figure 185A.) McCarran Intl (LAS) is a 14 CFR Part 139 airport. What is the minimum number of aircraft rescue and fire fighting vehicles and the type and amount of fire fighting agents that the airport should have?",
    "options": [
      "Three vehicles and 500 pounds of dry chemical (DC) or HALON 1211, or 450 pounds of DC and 100 gallons of water plus 6,000 gallons of water.",
      "Two vehicles and 600 pounds dry chemical (DC) or Halon 1211 or 500 pounds of DC plus 4,000 gallons of water.",
      "Three vehicles and 500 pounds of dry chemical (DC) or Halon 1211 or 450 pounds DC plus 3,000 gallons of water."
    ],
    "correctIndex": 0,
    "explanation": "Using FAA Figure 185A, the second line of the McCarran entry indicates it is an ARFF index E airport. FAA Legend 12 indicates that an index E airport must have the requirements for index A plus 6,000 gallons of water. An index E airport must have at least three vehicles and 500 pounds of DC or HALON 1211, or 450 pounds of DC and 100 gallons of water plus 6,000 gallons of water. (PLT143, AA.II.A.K5) — Chart Supplements U.S.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-58 · question 9668 · ALL",
    "sourceQuestionId": "9668",
    "sourceEdition": "2025–2026",
    "sourcePage": 58,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": [
      "atp_2026_legend-12.png",
      "atp_2026_figure-185a.png"
    ]
  },
  {
    "id": "q_la_ATP_2026_9379",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "During an emergency, a pilot-in-command does not deviate from a 14 CFR rule but is given priority by ATC. To whom or under what condition is the pilot required to submit a written report?",
    "options": [
      "To the manager of the General Aviation District Office within 10 days.",
      "To the manager of the facility in control within 10 days.",
      "Upon request by ATC, submit a written report within 48 hours to the ATC manager."
    ],
    "correctIndex": 2,
    "explanation": "Each pilot-in-command who (though not deviating from a rule) is given priority by ATC in an emergency, shall submit a detailed report of that emergency within 48 hours to the manager of that ATC facility, if requested by ATC. (PLT383, AA.I.G.K2) — 14 CFR §91.123",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-58 · question 9379 · ATM, ATS, RTC",
    "sourceQuestionId": "9379",
    "sourceEdition": "2025–2026",
    "sourcePage": 58,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9388",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "When may ATC request a detailed report on an emergency even though a rule has not been violated?",
    "options": [
      "When priority has been given.",
      "Anytime an emergency occurs.",
      "When the emergency occurs in controlled airspace."
    ],
    "correctIndex": 0,
    "explanation": "Each pilot-in-command who (though not deviating from a rule) is given priority by ATC in an emergency, shall submit a detailed report of that emergency within 48 hours to the manager of that ATC facility, if requested by ATC. (PLT044, AA.I.G.K2) — 14 CFR §91.123 Answer (B) is incorrect because a pilot may deviate from a regulation in order to meet an emergency, as long as ATC is notified immediately. A detailed report is usually not required if ATC priority was not given. Answer (C) is incorrect because, regardless of the type of airspace in which it occurs, only when priority has been given may a detailed report be requested by ATC.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-58 · question 9388 · ATM, ATS, RTC",
    "sourceQuestionId": "9388",
    "sourceEdition": "2025–2026",
    "sourcePage": 58,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9388_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "If available, what action could a pilot of an air carrier take if they violate a federal regulation because of an air traffic control direction?",
    "options": [
      "File a report through the Voluntary Disclosure Reporting Program (VDRP).",
      "File a report through the Aviation Safety Action Program (ASAP).",
      "File a report through the Flight Operational Quality Assurance Program (FOQA)."
    ],
    "correctIndex": 0,
    "explanation": "The VDRP is used to collect information on 14 CFR regulation violations to improve the overall safety of the NAS. (PLT044, AA.I.E.K13) — AC 00-58 Answer (B) is incorrect because ASAP is used is to encourage employees of air carriers or repair stations to voluntarily report safety information that may be critical to identifying potential precursors to accidents. Answer (C) is incorrect because an FOQA program is used to reveal operational situations in which risk is increased in order to enable early corrective action before that risk results in an incident or accident.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-58 · question 9388-1 · ATM, ATS, RTC",
    "sourceQuestionId": "9388-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 58,
    "sourceCategories": [
      "ATM",
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9388_2",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "What is the purpose of a Flight Operational Quality Assurance (FOQA) program?",
    "options": [
      "To identify pilots who are having problems operationally.",
      "To identify aggregate information for error trends.",
      "To provide accountability within the air carrier system."
    ],
    "correctIndex": 1,
    "explanation": "FOQA is a voluntary safety program that is designed to make commercial aviation safer by allowing commercial airlines and pilots to share de-identified aggregate information with the FAA, so that the FAA can monitor national trends in aircraft operations and target its resources to address operational risk issues (e.g., flight operations, ATC, airports). (PLT044, AA.I.E.K13) — AC 120-82",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-59 · question 9388-2 · ALL",
    "sourceQuestionId": "9388-2",
    "sourceEdition": "2025–2026",
    "sourcePage": 59,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9388_3",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Your airline recently initiated a new safety partnership with the FAA utilizing the Aviation Safety Action Program (ASAP) for all pilots, flight attendants, dispatchers, and mechanics. What does ASAP encourage?",
    "options": [
      "Encourages an employee to utilize an ASAP report after receiving a criminal substance abuse conviction so they do not face additional FAA enforcement.",
      "Encourages operational situations in which risk is increased in order to enable early corrective action before that risk results in an incident or accident.",
      "Encourages airline management to utilize ASAP reports and voluntarily report safety information to derive synergies and cost savings for the airline."
    ],
    "correctIndex": 2,
    "explanation": "ASAP is used is to encourage employees of air carriers or repair stations to voluntarily report safety information that may be critical to identifying potential precursors to accidents. (PLT044, AA.I.E.K13) — AC 120-66",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-59 · question 9388-3 · ALL",
    "sourceQuestionId": "9388-3",
    "sourceEdition": "2025–2026",
    "sourcePage": 59,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8177",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Which requirement applies to emergency equipment (fire extinguishers, megaphones, first-aid kits, and crash axe) installed in an air carrier airplane?",
    "options": [
      "All emergency equipment, must be readily accessible to the passengers.",
      "Emergency equipment cannot be located in a compartment or area where it is not immediately visible to a flight attendant in the passenger compartment.",
      "Emergency equipment must be clearly identified and clearly marked to indicate its method of operation."
    ],
    "correctIndex": 2,
    "explanation": "Each item of required emergency equipment must be clearly identified and clearly marked to indicate its method of operation. (PLT404, AA.I.G.K4) — 14 CFR §121.309 Answers (A) and (B) are incorrect because the requirement is that the emergency equipment be readily accessible to the crew.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-59 · question 8177 · ATM, ADX",
    "sourceQuestionId": "8177",
    "sourceEdition": "2025–2026",
    "sourcePage": 59,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8176",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Which factor determines the minimum number of hand fire extinguishers required for flight under 14 CFR Part 121?",
    "options": [
      "Number of passengers and crewmembers aboard.",
      "Number of passenger cabin occupants.",
      "Airplane passenger seating accommodations."
    ],
    "correctIndex": 2,
    "explanation": "The minimum number of hand fire extinguishers carried on an air carrier flight is determined by the seating capacity of the airplane. (PLT408, AA.I.A.K14) — 14 CFR §121.309 Answers (A) and (B) are incorrect because passenger capacity, not actual passenger count, determines the number of extinguishers required.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-59 · question 8176 · ATM, ADX",
    "sourceQuestionId": "8176",
    "sourceEdition": "2025–2026",
    "sourcePage": 59,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8160",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Where should the portable battery-powered megaphone be located if only one is required on a passenger-carrying airplane?",
    "options": [
      "The most forward location in the passenger cabin.",
      "In the cabin near the over-the-wing emergency exit.",
      "The most rearward location in the passenger cabin."
    ],
    "correctIndex": 2,
    "explanation": "One megaphone must be installed on each airplane with a seating capacity of more than 60 and less than 100 passengers, at the most rearward location in the passenger cabin where it would be readily accessible to a normal flight attendant seat. (PLT462, AA.I.A.K14) — 14 CFR §121.309",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-59 · question 8160 · ATM, ADX",
    "sourceQuestionId": "8160",
    "sourceEdition": "2025–2026",
    "sourcePage": 59,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8161",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "How many portable battery-powered megaphones are required on an air carrier airplane with a seating capacity of 100 passengers on a trip segment when 45 passengers are carried?",
    "options": [
      "Two; one at the forward end, and the other at the most rearward location in the passenger cabin.",
      "Two; one at the most rearward and one in the center of the passenger cabin.",
      "Two; one located near or accessible to the flightcrew, and one located near the center of the passenger cabin."
    ],
    "correctIndex": 0,
    "explanation": "Two megaphones are required in the passenger cabin of each airplane with a seating capacity of more than 99 passengers, one installed at the forward end and the other at the rearward location where it would be readily accessible to a normal flight attendant seat. (PLT462, AA.I.A.K14) — 14 CFR §121.309",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-60 · question 8161 · ATM, ADX",
    "sourceQuestionId": "8161",
    "sourceEdition": "2025–2026",
    "sourcePage": 60,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8162",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "How many portable battery-powered megaphones are required on an air carrier airplane with a seating capacity of 150 passengers on a trip segment when 75 passengers are carried?",
    "options": [
      "Two; one located near or accessible to the flightcrew, and one located near the center of the passenger cabin.",
      "Two; one at the most rearward and one in the center of the passenger cabin.",
      "Two; one at the forward end, and the other at the most rearward location of the passenger cabin."
    ],
    "correctIndex": 2,
    "explanation": "Two megaphones are required in the passenger cabin of each airplane with a seating capacity of more than 99 passengers, one installed at the forward end and the other at the rearward location where it would be readily accessible to a normal flight attendant seat. (PLT462, AA.I.A.K14) — 14 CFR §121.309",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-60 · question 8162 · ATM, ADX",
    "sourceQuestionId": "8162",
    "sourceEdition": "2025–2026",
    "sourcePage": 60,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8144",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "The emergency lights on a passenger-carrying airplane must be armed or turned on during",
    "options": [
      "taxiing, takeoff, cruise, and landing.",
      "taxiing, takeoff, and landing.",
      "takeoff, cruise, and landing."
    ],
    "correctIndex": 1,
    "explanation": "Each emergency exit light must be armed or turned on during taxiing, takeoff, and landing. (PLT404, AA.I.G.K4) — 14 CFR §121.310 Answers (A) and (C) are incorrect because the emergency lights are not required to be armed or turned on during cruise.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-60 · question 8144 · ATM, ADX",
    "sourceQuestionId": "8144",
    "sourceEdition": "2025–2026",
    "sourcePage": 60,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8159",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Federal Aviation Regulations require that interior emergency lights must",
    "options": [
      "operate automatically when subjected to a negative G load.",
      "be operable manually from the flightcrew station and a point in the passenger compartment.",
      "be armed or turned on during taxiing and all flight operations."
    ],
    "correctIndex": 1,
    "explanation": "The emergency exit light system must be operable from both the flight crew station and from a point in the passenger compartment that is readily accessible to a normal flight attendant seat. Each emergency exit light must be armed or turned on during taxiing, takeoff, and landing. (PLT404, AA.I.G.K4) — 14 CFR §121.310 Answer (A) is incorrect because interior emergency lights must operate automatically with the interruption of the airplane’s normal electrical power. Answer (C) is incorrect because the interior emergency light system must only be armed during taxi, takeoff, and landing portions of the flight.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-60 · question 8159 · ATM, ADX",
    "sourceQuestionId": "8159",
    "sourceEdition": "2025–2026",
    "sourcePage": 60,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8157",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "If a passenger-carrying landplane is required to have an automatic deploying escape slide system, when must this system be armed?",
    "options": [
      "For taxi, takeoff, and landing.",
      "Only for takeoff and landing.",
      "During taxi, takeoff, landing, and after ditching."
    ],
    "correctIndex": 0,
    "explanation": "Each passenger-carrying landplane with an emergency exit (other than over-the-wing) that is more than 6 feet from the ground must have an approved means to assist the occupants in descending to the ground. An assisting means that deploys automatically must be armed during taxi, takeoffs, and landings. (PLT404, AA.I.G.K4) — 14 CFR §121.310",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-60 · question 8157 · ATM, ADX",
    "sourceQuestionId": "8157",
    "sourceEdition": "2025–2026",
    "sourcePage": 60,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8158",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "If there is a required emergency exit located in the flightcrew compartment, the door which separates the compartment from the passenger cabin must be",
    "options": [
      "unlocked during takeoff and landing.",
      "locked at all times, except during any emergency declared by the pilot-in-command.",
      "latched open during takeoff and landing."
    ],
    "correctIndex": 2,
    "explanation": "If it is necessary to pass through a doorway separating the passenger cabin from other areas to reach a required emergency exit from any passenger seat, the door must have means to latch it open, and the door must be latched open during each takeoff and landing. (PLT459, AA.I.G.K4) — 14 CFR §121.310 Answers (A) and (B) are incorrect because the door must always be latched open during takeoff and landing.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-61 · question 8158 · ATM, ADX",
    "sourceQuestionId": "8158",
    "sourceEdition": "2025–2026",
    "sourcePage": 61,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8178",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "A crewmember interphone system is required on which airplane?",
    "options": [
      "A large airplane.",
      "A turbojet airplane.",
      "An airplane with more than 19 passenger seats."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate an airplane with a seating capacity of more than 19 passengers unless the airplane is equipped with a crewmember interphone system. (PLT462, AA.I.G.K4) — 14 CFR §121.319 Answers (A) and (B) are incorrect because the crewmember interphone system requirement is based upon the number of seats.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-61 · question 8178 · ATM, ADX",
    "sourceQuestionId": "8178",
    "sourceEdition": "2025–2026",
    "sourcePage": 61,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8179",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "An air carrier airplane must have an operating public address system if it",
    "options": [
      "has a seating capacity of 19 passengers.",
      "has a seating capacity for more than 19 passengers.",
      "weighs more than 12,500 pounds."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate an airplane with a seating capacity of more than 19 passengers unless the airplane is equipped with an operating public address system. (PLT462, AA.I.G.K4) — 14 CFR §121.318",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-61 · question 8179 · ATM, ADX",
    "sourceQuestionId": "8179",
    "sourceEdition": "2025–2026",
    "sourcePage": 61,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8235",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Each crewmember shall have readily available for individual use on each flight a",
    "options": [
      "key to the flight deck door.",
      "certificate holder’s manual.",
      "flashlight in good working order."
    ],
    "correctIndex": 2,
    "explanation": "Each crewmember shall, on each flight, have readily available for use a flashlight that is in good working order. (PLT405, AA.I.G.K4) — 14 CFR §121.549",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-61 · question 8235 · ATM, ADX",
    "sourceQuestionId": "8235",
    "sourceEdition": "2025–2026",
    "sourcePage": 61,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8173",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "How much supplemental oxygen for emergency descent must a pressurized turbine-powered air transport airplane carry for each flight crewmember on flight deck duty when operating at flight altitudes above 10,000 feet?",
    "options": [
      "A minimum of 2-hours supply.",
      "Sufficient for the duration of the flight above 8,000 feet cabin pressure altitude.",
      "Sufficient for the duration of the flight at 10,000 feet flight altitude, not to exceed 1 hour and 50 minutes."
    ],
    "correctIndex": 0,
    "explanation": "When operating at flight altitudes above 10,000 feet, the certificate holder shall supply enough oxygen for each crewmember for the entire flight at those altitudes and not less than a 2-hour supply for each flight crewmember on flight deck duty. (PLT438, AA.I.G.K4) — 14 CFR §121.331 and §121.333",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-61 · question 8173 · ATM, ADX",
    "sourceQuestionId": "8173",
    "sourceEdition": "2025–2026",
    "sourcePage": 61,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8183",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Each air carrier flight deck crewmember on flight deck duty must be provided with an oxygen mask that can be rapidly placed on his face when operating at flight altitudes",
    "options": [
      "of FL260.",
      "of FL250.",
      "above FL250."
    ],
    "correctIndex": 2,
    "explanation": "When operating at flight altitudes above FL250, each flight crewmember on flight deck duty must be provided with an oxygen mask so designed that it can be rapidly placed on his or her face from its ready position, properly secured, sealed, and supplying oxygen upon demand; and so designed that after being placed on the face it does not prevent immediate communication between the flight crewmember and other crewmembers over the airplane intercom system. When not being used at flight altitudes above FL250, the mask must be kept ready for use and within immediate reach. (PLT438, AA.I.G.K4) — 14 CFR §121.333",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-61 · question 8183 · ATM, ADX",
    "sourceQuestionId": "8183",
    "sourceEdition": "2025–2026",
    "sourcePage": 61,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8184",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "A flight crewmember must be able to don and use a quick-donning oxygen mask within",
    "options": [
      "5 seconds.",
      "10 seconds.",
      "15 seconds."
    ],
    "correctIndex": 0,
    "explanation": "A flight crewmember must be able to place a quick-donning oxygen mask on the face from its ready position, properly secured, sealed, and supplying oxygen upon demand, with one hand and within 5 seconds. (PLT438, AA.I.G.K4) — 14 CFR §121.333",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-62 · question 8184 · ATM, ADX",
    "sourceQuestionId": "8184",
    "sourceEdition": "2025–2026",
    "sourcePage": 62,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8155",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "If either pilot of an air carrier airplane leaves the duty station while flying at FL410, the other pilot",
    "options": [
      "and the flight engineer shall put on their oxygen masks and breathe oxygen.",
      "shall put on the oxygen mask and breathe oxygen.",
      "must have a quick-donning type oxygen mask available."
    ],
    "correctIndex": 2,
    "explanation": "Above FL410 one pilot must wear their mask at all times. If for any reason or at any time it is necessary for one pilot to leave the controls of the airplane when operating at flight altitudes above FL410, the remaining pilot at the controls shall put on and use his or her oxygen mask until the other pilot has returned to their duty station. (PLT440, AA.I.G.K4) — 14 CFR §121.333",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-62 · question 8155 · ATM, ADX",
    "sourceQuestionId": "8155",
    "sourceEdition": "2025–2026",
    "sourcePage": 62,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8156",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "If a turbine-engine-powered, pressurized airplane is not equipped with quick-donning oxygen masks, what is the maximum flight altitude authorized without one pilot wearing and using an oxygen mask?",
    "options": [
      "FL200.",
      "FL300.",
      "FL250."
    ],
    "correctIndex": 2,
    "explanation": "When operating at flight altitudes above FL250, one pilot at the controls of the airplane shall at all times wear and use an oxygen mask secured, sealed, and supplying oxygen. However, the one pilot need not wear and use an oxygen mask while at or below FL410 if each flight crewmember on flight deck duty has a quick-donning type oxygen mask. (PLT438, AA.I.G.K4) — 14 CFR §121.333",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-62 · question 8156 · ATM, ADX",
    "sourceQuestionId": "8156",
    "sourceEdition": "2025–2026",
    "sourcePage": 62,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8187",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "What is the highest flight level that operations may be conducted without the pilot at the controls wearing and using an oxygen mask, while the other pilot is away from the duty station?",
    "options": [
      "FL410.",
      "FL250.",
      "Above FL410."
    ],
    "correctIndex": 0,
    "explanation": "Above FL410 one pilot must wear their mask at all times. If for any reason or at any time it is necessary for one pilot to leave the controls of the airplane when operating at flight altitudes above FL410, the remaining pilot at the controls shall put on and use his or her oxygen mask until the other pilot has returned to their duty station. (PLT438, AA.I.G.K4) — 14 CFR §121.333",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-62 · question 8187 · ATM, ADX",
    "sourceQuestionId": "8187",
    "sourceEdition": "2025–2026",
    "sourcePage": 62,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8174",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "What is the passenger oxygen supply requirement for a flight, in a turbine-powered aircraft, with a cabin pressure altitude in excess of 15,000 feet? Enough oxygen for",
    "options": [
      "each passengers for the entire flight above 15,000 feet cabin altitude.",
      "30 percent of the passengers.",
      "10 percent of the passengers for 30 minutes."
    ],
    "correctIndex": 0,
    "explanation": "For flights at cabin pressure altitudes above 15,000 feet, the certificate holder must provide enough oxygen for each passenger carried during the entire flight at those altitudes. (PLT438, AA.I.G.K4) — 14 CFR §§121.327, 121.329",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-62 · question 8174 · ATM, ADX",
    "sourceQuestionId": "8174",
    "sourceEdition": "2025–2026",
    "sourcePage": 62,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8186",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "For flights above which cabin altitude must oxygen be provided for all passengers during the entire flight at those altitudes?",
    "options": [
      "15,000 feet.",
      "16,000 feet.",
      "14,000 feet."
    ],
    "correctIndex": 0,
    "explanation": "For flights at cabin pressure altitudes above 15,000 feet, the certificate holder must provide enough oxygen for each passenger carried during the entire flight at those altitudes. (PLT438, AA.I.G.K4) — 14 CFR §§121.327, 121.329",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-62 · question 8186 · ATM, ADX",
    "sourceQuestionId": "8186",
    "sourceEdition": "2025–2026",
    "sourcePage": 62,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8185",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "For a 2-hour flight in a reciprocating engine-powered airplane at a cabin pressure altitude of 12,000 feet, how much supplemental oxygen for sustenance must be provided? Enough oxygen for",
    "options": [
      "30 minutes for 10 percent of the passengers.",
      "10 percent of the passengers for 1.5 hours.",
      "each passenger for 30 minutes."
    ],
    "correctIndex": 0,
    "explanation": "For flight in reciprocating-engine-powered airplanes, at cabin pressure altitudes above 8,000 feet, up to and including 14,000 feet, each certificate holder shall provide enough oxygen for 30 minutes for 10 percent of the passengers. (PLT438, AA.I.G.K4) — 14 CFR §121.327",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-63 · question 8185 · ATM, ADX",
    "sourceQuestionId": "8185",
    "sourceEdition": "2025–2026",
    "sourcePage": 63,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8182",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "The supplemental oxygen requirements for passengers when a flight is operated at FL250 is dependent upon the airplane’s ability to make an emer gency descent to a flight altitude of",
    "options": [
      "10,000 feet within 4 minutes.",
      "14,000 feet within 4 minutes.",
      "12,000 feet within 4 minutes or at a minimum rate of 2,500 ft/min, whichever is quicker."
    ],
    "correctIndex": 1,
    "explanation": "The supplemental oxygen requirements for passen gers on pressurized aircraft is dependent upon the ability of the aircraft to descend to 14,000 feet within 4 minutes in the event of a loss of pressurization. (PLT438, AA.I.G.K4) — 14 CFR §121.333",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-63 · question 8182 · ATM, ADX",
    "sourceQuestionId": "8182",
    "sourceEdition": "2025–2026",
    "sourcePage": 63,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8180",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "What is the minimum number of acceptable oxygen-dispensing units for first-aid treatment of occupants who might require undiluted oxygen for physiological reasons?",
    "options": [
      "Two.",
      "Four.",
      "Three."
    ],
    "correctIndex": 0,
    "explanation": "There must be an appropriate number of oxygen dispensing units for first aid treatment of passengers, but in no case less than two. (PLT438, AA.I.G.K4) — 14 CFR §121.333",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-63 · question 8180 · ATM, ADX",
    "sourceQuestionId": "8180",
    "sourceEdition": "2025–2026",
    "sourcePage": 63,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8164",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Which emergency equipment is required for a flag air carrier flight between John F. Kennedy International Airport and London, England?",
    "options": [
      "A life preserver equipped with an approved survivor locator light or other flotation device for the full seating capacity of the airplane.",
      "An appropriately equipped survival kit attached to each required liferaft.",
      "A self-buoyant, water resistant, portable survival-type emergency locator transmitter for each required liferaft."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate an airplane in extended overwater operations without having on the airplane the following equipment: 1. A life preserver equipped with an approved survivor locator light for each occupant of the airplane; 2. Enough life rafts (each equipped with an approved survivor locator light) to accommodate the occupants of the airplane; 3. At least one pyrotechnic signaling device for each life raft; 4. One survival-type ELT; and 5. A survival kit, appropriately equipped for the route to be flown, must be attached to each life raft. (PLT404, AA.I.G.K4) — 14 CFR §121.339 Answer (A) is incorrect because a life preserver or other flotation device for each occupant is required. The requirement is not based upon seating capacity. Answer (C) is incorrect because only one survival type emergency locator transmitter is required to be carried in the aircraft, not one for each life raft.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-63 · question 8164 · ATM, ADX",
    "sourceQuestionId": "8164",
    "sourceEdition": "2025–2026",
    "sourcePage": 63,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8166",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Each large aircraft operating over water must have a life preserver for each",
    "options": [
      "aircraft occupant.",
      "seat on the aircraft.",
      "passenger seat, plus 10 percent."
    ],
    "correctIndex": 0,
    "explanation": "No person may operate an airplane in extended overwater operations without having on the airplane the following equipment: 1. A life preserver equipped with an approved survivor locator light for each occupant of the airplane; 2. Enough life rafts (each equipped with an approved survivor locator light) to accommodate the occupants of the airplane; 3. At least one pyrotechnic signaling device for each life raft; 4. One survival-type ELT; and 5. A survival kit, appropriately equipped for the route to be flown, must be attached to each life raft. (PLT417, AA.I.G.K4) — 14 CFR §121.339 Answers (B) and (C) are incorrect because unlike some regulations that are based upon the number of seats in the aircraft, the number of life preservers required is based on the number of occupants for a particular flight.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-63 · question 8166 · ATM, ADX",
    "sourceQuestionId": "8166",
    "sourceEdition": "2025–2026",
    "sourcePage": 63,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8169",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Life preservers required for overwater oper a tions are stored",
    "options": [
      "within easy reach of each passenger.",
      "under each occupant seat.",
      "within easy reach of each seated occupant."
    ],
    "correctIndex": 2,
    "explanation": "The required life rafts, life preservers, and survival-type emergency locator transmitter must be easily accessible in the event of a ditching without appreciable time for preparatory procedures. (PLT417, AA.I.G.K4) — 14 CFR §121.339",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-64 · question 8169 · ATM, ADX",
    "sourceQuestionId": "8169",
    "sourceEdition": "2025–2026",
    "sourcePage": 64,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8167",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "For a flight over uninhabited terrain, an airplane operated by a flag or supplemental air carrier must carry enough appropriately equipped survival kits for",
    "options": [
      "all of the passengers, plus 10 percent.",
      "all aircraft occupants.",
      "all passenger seats."
    ],
    "correctIndex": 1,
    "explanation": "Unless it has the following equipment, no flag or supplemental carrier or commercial operator may conduct an operation over an uninhabited area: 1. Suitable pyrotechnic signaling devices; 2. A survival-type ELT; and 3. Enough survival kits, appropriately equipped for the route to be flown, for the number of occupants of the airplane. (PLT404, AA.I.G.K4) — 14 CFR §121.353",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-64 · question 8167 · ATM, ADX",
    "sourceQuestionId": "8167",
    "sourceEdition": "2025–2026",
    "sourcePage": 64,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8168",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "When a supplemental air carrier is operating over an uninhabited area, how many appropriately equipped survival kits are required aboard the aircraft?",
    "options": [
      "One for each passenger seat.",
      "One for each passenger, plus 10 percent.",
      "One for each occupant of the aircraft."
    ],
    "correctIndex": 2,
    "explanation": "Unless it has the following equipment, no flag or supplemental carrier or commercial operator may conduct an operation over an uninhabited area: 1. Suitable pyrotechnic signaling devices; 2. A survival-type ELT; and 3. Enough survival kits, appropriately equipped for the route to be flown, for the number of occupants of the airplane. (PLT404, AA.I.G.K4) — 14 CFR §121.353",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-64 · question 8168 · ATM, ADX",
    "sourceQuestionId": "8168",
    "sourceEdition": "2025–2026",
    "sourcePage": 64,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8170",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "An airplane operated by a supplemental air carrier flying over uninhabited terrain must carry which emergency equipment?",
    "options": [
      "Survival kit for each passenger.",
      "Suitable pyrotechnic signaling devices.",
      "Colored smoke flares and a signal mirror."
    ],
    "correctIndex": 1,
    "explanation": "Unless it has the following equipment, no flag or supplemental carrier or commercial operator may conduct an operation over an uninhabited area: 1. Suitable pyrotechnic signaling devices; 2. A survival-type ELT; and 3. Enough survival kits, appropriately equipped for the route to be flown, for the number of occupants of the airplane. (PLT404, AA.I.G.K4) — 14 CFR §121.353",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-64 · question 8170 · ATM, ADX",
    "sourceQuestionId": "8170",
    "sourceEdition": "2025–2026",
    "sourcePage": 64,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8171",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "An airplane operated by a commercial operator flying over uninhabited terrain must carry which emergency equipment?",
    "options": [
      "A signal mirror and colored smoke flares.",
      "Survival kit for each passenger.",
      "An approved survival-type emergency locator transmitter."
    ],
    "correctIndex": 2,
    "explanation": "Unless it has the following equipment, no flag or supplemental carrier or commercial operator may conduct an operation over an uninhabited area: 1. Suitable pyrotechnic signaling devices; 2. A survival-type ELT; and 3. Enough survival kits, appropriately equipped for the route to be flown, for the number of occupants of the airplane. (PLT402, AA.I.G.K4) — 14 CFR §121.353",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-64 · question 8171 · ATM, ADX",
    "sourceQuestionId": "8171",
    "sourceEdition": "2025–2026",
    "sourcePage": 64,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8172",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "An airplane operated by a flag air carrier operator flying over uninhabited terrain must carry which emergency equipment?",
    "options": [
      "Suitable pyrotechnic signaling devices.",
      "Colored smoke flares and a signal mirror.",
      "Survival kit for each passenger."
    ],
    "correctIndex": 0,
    "explanation": "Unless it has the following equipment, no flag or supplemental carrier or commercial operator may conduct an operation over an uninhabited area: 1. Suitable pyrotechnic signaling devices; 2. A survival-type ELT; and 3. Enough survival kits, appropriately equipped for the route to be flown, for the number of occupants of the airplane. (PLT404, AA.I.G.K4) — 14 CFR §121.353",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-65 · question 8172 · ATM, ADX",
    "sourceQuestionId": "8172",
    "sourceEdition": "2025–2026",
    "sourcePage": 65,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8245",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "If an aircraft dispatcher cannot communicate with the pilot of an air carrier flight during an emergency, the aircraft dispatcher should",
    "options": [
      "take any action considered necessary under the circumstances.",
      "comply with the company’s lost aircraft plan.",
      "phone the ARTCC where the flight is located and ask for a phone patch with the flight."
    ],
    "correctIndex": 0,
    "explanation": "If the aircraft dispatcher cannot communicate with the pilot, the dispatcher shall declare an emergency and take any action considered necessary under the circumstances. (PLT403, AA.I.G.K4) — 14 CFR §121.557",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-65 · question 8245 · ATM, ADX",
    "sourceQuestionId": "8245",
    "sourceEdition": "2025–2026",
    "sourcePage": 65,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8198",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Which 14 CFR Part 121 required document includes descriptions of the required crewmember functions to be performed in the event of an emergency?",
    "options": [
      "Airplane Flight Manual.",
      "Certificate holder’s manual.",
      "Pilot’s Emergency Procedures Handbook."
    ],
    "correctIndex": 1,
    "explanation": "Each certificate holder shall, for each type and model of airplane, assign to each category of required crewmember, as appropriate, the necessary functions to be performed in an emergency or a situation requiring emergency evacuation. The certificate holder shall describe in its manual the functions of each category of required crewmember. (PLT436, AA.I.G.K4) — 14 CFR §121.397 Answer (A) is incorrect because the airplane flight manual may contain emergency procedures as a convenience, but they are not required by 14 CFR §121.141. Answer (C) is incorrect because an “Emergency Procedures Handbook” does not exist.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-65 · question 8198 · ATM, ADX",
    "sourceQuestionId": "8198",
    "sourceEdition": "2025–2026",
    "sourcePage": 65,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8200",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "The required crewmember functions that are to be performed in the event of an emergency shall be assigned by the",
    "options": [
      "pilot-in-command.",
      "air carrier’s chief pilot.",
      "certificate holder."
    ],
    "correctIndex": 2,
    "explanation": "Each certificate holder shall, for each type and model of airplane, assign to each category of required crewmember, as appropriate, the necessary functions to be performed in an emergency or a situation requiring emergency evacuation. The certificate holder shall describe in its manual the functions of each category of required crewmember. (PLT374, AA.I.G.K4) — 14 CFR §121.397 Answer (A) is incorrect because, although the PIC may assign duties as necessary during an emergency, the required crewmember functions shall be assigned and described in the certificate holder’s manual. Answer (B) is incorrect because the chief pilot does not have the authority to assign crewmember functions that are to be performed in the event of an emergency. Those functions shall be described in the certificate holder’s manual.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-65 · question 8200 · ATM, ADX",
    "sourceQuestionId": "8200",
    "sourceEdition": "2025–2026",
    "sourcePage": 65,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8204",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "The air carrier must give instruction on such subjects as respiration, hypoxia, and decompression to crewmembers serving on pressurized airplanes operated above",
    "options": [
      "FL180.",
      "FL200.",
      "FL250."
    ],
    "correctIndex": 2,
    "explanation": "Crewmembers who serve in operations above 25,000 feet must receive instruction in respiration, hypoxia, and decompression. (PLT460, AA.I.G.K4) — 14 CFR §121.417",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-65 · question 8204 · ATM, ADX",
    "sourceQuestionId": "8204",
    "sourceEdition": "2025–2026",
    "sourcePage": 65,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8218",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "How often must a crewmember actually operate the airplane emergency equipment, after initial training? Once every",
    "options": [
      "6 calendar months.",
      "12 calendar months.",
      "24 calendar months."
    ],
    "correctIndex": 2,
    "explanation": "Emergency drill requirements must be accomplished during initial training and once each 24 calendar months during recurrent training. (PLT407, AA.I.G.K4) — 14 CFR §121.417",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-65 · question 8218 · ATM, ADX",
    "sourceQuestionId": "8218",
    "sourceEdition": "2025–2026",
    "sourcePage": 65,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8236",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "If an engine’s rotation is stopped in flight, the pilot-in-command must report it, as soon as practicable, to the",
    "options": [
      "appropriate ground radio station.",
      "nearest FAA District Office.",
      "operations manager (or director of operations)."
    ],
    "correctIndex": 0,
    "explanation": "The pilot-in-command shall report each stoppage of engine rotation in flight to the appropriate ground radio station as soon as practicable and shall keep that station fully informed of the progress of the flight. (PLT366, AA.I.G.K4) — 14 CFR §121.565",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-66 · question 8236 · ATM, ADX",
    "sourceQuestionId": "8236",
    "sourceEdition": "2025–2026",
    "sourcePage": 66,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8237",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "If it becomes necessary to shut down one engine on a domestic air carrier three-engine turbojet airplane, the pilot-in-command",
    "options": [
      "must land at the nearest suitable airport, in point of time, at which a safe landing can be made.",
      "may continue to the planned destination if approved by the company aircraft dispatcher.",
      "may continue to the planned destination if this is considered as safe as landing at the nearest suitable airport."
    ],
    "correctIndex": 2,
    "explanation": "If not more than one engine of an airplane that has three or more engines fails or its rotation is stopped, the pilot-in-command may proceed to an airport of their choosing if, after considering the following, the pilot decides that proceeding to that airport is as safe as landing at the nearest suitable airport. (PLT406, AA.I.G.K4) — 14 CFR §121.565",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-66 · question 8237 · ATM, ADX",
    "sourceQuestionId": "8237",
    "sourceEdition": "2025–2026",
    "sourcePage": 66,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8241",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "What action shall the pilot-in-command take if it becomes necessary to shut down one of the two engines on an air carrier airplane?",
    "options": [
      "Land at the airport which the pilot considers to be as safe as the nearest suitable airport in point of time.",
      "Land at the nearest suitable airport in point of time at which a safe landing can be made.",
      "Land at the nearest airport, including military, that has a crash and rescue unit."
    ],
    "correctIndex": 1,
    "explanation": "Whenever an engine of an airplane fails or whenever the rotation of an engine is stopped to prevent possible damage, the pilot-in-command shall land the airplane at the nearest suitable airport, time-wise, at which a safe landing can be made. Note: There are no exceptions to this rule for two-engine airplanes. (PLT223, AA.I.G.K4) — 14 CFR §121.565",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-66 · question 8241 · ATM, ADX",
    "sourceQuestionId": "8241",
    "sourceEdition": "2025–2026",
    "sourcePage": 66,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8163",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "In the event of an engine emergency, the use of a flight deck check procedure by the flightcrew is",
    "options": [
      "encouraged; it helps to ensure that all items on the procedure are accomplished.",
      "required by regulations to prevent reliance upon memorized procedures.",
      "required by the FAA as a doublecheck after the memorized procedure has been accomplished."
    ],
    "correctIndex": 1,
    "explanation": "Each certificate holder shall provide an approved flight deck check procedure for each type of aircraft. The approved procedures must include each item necessary for flight crewmembers to check for safety before starting engines, taking off, or landing, and in engine and systems emergencies. The procedures must be designed so that a flight crewmember will not need to rely upon memory for items to be checked. (PLT404, AA.I.G.K4) — 14 CFR §121.315",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-66 · question 8163 · ATM, ADX",
    "sourceQuestionId": "8163",
    "sourceEdition": "2025–2026",
    "sourcePage": 66,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8240",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "When the pilot-in-command is responsible for a deviation during an emergency, the pilot should submit a written report within",
    "options": [
      "10 days after the deviation.",
      "10 days after returning home.",
      "10 days after returning to home base."
    ],
    "correctIndex": 2,
    "explanation": "A pilot-in-command declaring an emergency shall send a written report of any deviation, through the air carrier’s director of operations, to the Administrator within 10 days after returning to the home base. (PLT403, AA.I.G.K4) — 14 CFR §121.557",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-66 · question 8240 · ATM, ADX",
    "sourceQuestionId": "8240",
    "sourceEdition": "2025–2026",
    "sourcePage": 66,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8246",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Who is required to submit a written report on a deviation that occurs during an emergency?",
    "options": [
      "Pilot-in-command.",
      "Dispatcher.",
      "Person who declares the emergency."
    ],
    "correctIndex": 2,
    "explanation": "The person declaring the emergency shall send a written report of any deviation, through the air carrier’s director of operations, to the Administrator within 10 days. (PLT366, AA.I.G.K4) — 14 CFR §121.557",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-66 · question 8246 · ATM, ADX",
    "sourceQuestionId": "8246",
    "sourceEdition": "2025–2026",
    "sourcePage": 66,
    "sourceCategories": [
      "ATM",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8239",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "An aircraft dispatcher declares an emergency for a flight and a deviation results. A written report shall be sent through the air carrier’s operations manager by the",
    "options": [
      "dispatcher to the FAA Administrator within 10 days of the event.",
      "certificate holder to the FAA Administrator within 10 days of the event.",
      "pilot-in-command to the FAA Administrator within 10 days of the event."
    ],
    "correctIndex": 0,
    "explanation": "An aircraft dispatcher declaring an emergency shall send a written report of any deviation, through the air carrier’s director of operations, to the Administrator within 10 days after the date of the emergency. (PLT394) — 14 CFR §121.557",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-67 · question 8239 · ADX",
    "sourceQuestionId": "8239",
    "sourceEdition": "2025–2026",
    "sourcePage": 67,
    "sourceCategories": [
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8725",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Emergency Equipment and Operations",
    "materia": "operaciones",
    "text": "Bird strikes in flight will be reported to the",
    "options": [
      "nearest state or federal wildlife office on company letterhead.",
      "FAA on an FAA form 5200-7.",
      "nearest FSS via telephone."
    ],
    "correctIndex": 1,
    "explanation": "Pilots are urged to report any bird or other wildlife strike using FAA Form 5200−7, Bird/Other Wildlife Strike Report. (PLT366, AA.I.G.K4) — AIM ¶7-5-3",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-67 · question 8725 · ATM, ATS",
    "sourceQuestionId": "8725",
    "sourceEdition": "2025–2026",
    "sourcePage": 67,
    "sourceCategories": [
      "ATM",
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8020",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "Which is a requirement for flightcrew use of oxygen masks in a pressurized cabin airplane?",
    "options": [
      "Both pilots at the controls shall use oxygen masks above FL350.",
      "At altitudes above 25,000 feet MSL, if one pilot leaves the pilot duty station, the remaining pilot at the controls shall use an oxygen mask.",
      "At altitudes above FL250, one of the two pilots at the controls shall use an oxygen mask continuously."
    ],
    "correctIndex": 1,
    "explanation": "One pilot of a pressurized aircraft must wear an oxygen mask any time the aircraft is flown above 35,000 feet MSL. In addition, one pilot must wear an oxygen mask above a flight altitude of 25,000 feet MSL if the other pilot leaves the duty station. (PLT438, AA.I.G.K5) — 14 CFR §135.89",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-67 · question 8020 · ATS",
    "sourceQuestionId": "8020",
    "sourceEdition": "2025–2026",
    "sourcePage": 67,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8022",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "Which is a requirement for pilot use of oxygen in a pressurized airplane?",
    "options": [
      "The pilot at the controls shall use oxygen continuously any time the cabin pressure altitude is more than 12,000 feet MSL.",
      "At FL250 and above, each pilot shall have an approved quick-donning oxygen mask.",
      "At FL250 and above, the pilot at the controls must have an approved oxygen mask any time the other pilot is away from the duty station."
    ],
    "correctIndex": 0,
    "explanation": "Each pilot of an unpressurized aircraft shall use oxygen continuously when flying: 1. At altitudes above 10,000 feet through 12,000 feet MSL for that part of the flight at those altitudes that is more than 30 minutes duration; and 2. Above 12,000 feet MSL. Whenever a pressurized aircraft is operated with the cabin pressure altitude more than 10,000 feet MSL, each pilot shall comply with the rules for unpressurized aircraft. Whenever a pressurized airplane is operated above 25,000 feet MSL flight altitude both pilots must have a “quick-donning”-type oxygen mask. One pilot of a pressurized aircraft must wear an oxygen mask any time the aircraft is flown above 35,000 feet MSL. In addition, one pilot must wear an oxygen mask above a flight altitude of 25,000 feet MSL if the other pilot leaves the duty station. (PLT438, AA.I.G.K5) — 14 CFR §135.89 Answer (B) is incorrect because the regulation states “above 25,000 feet MSL.” Answer (C) is incorrect because above 25,000 feet MSL, the pilot at the controls must wear an approved oxygen mask any time the other pilot is away from the duty station.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-67 · question 8022 · ATS",
    "sourceQuestionId": "8022",
    "sourceEdition": "2025–2026",
    "sourcePage": 67,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8055",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "The two pilot stations of a pressurized aircraft are equipped with approved quick-donning oxygen masks. What is the maximum altitude authorized if one pilot is not wearing an oxygen mask and breathing oxygen?",
    "options": [
      "41,000 feet MSL.",
      "35,000 feet MSL.",
      "25,000 feet MSL."
    ],
    "correctIndex": 1,
    "explanation": "One pilot of a pressurized aircraft must wear an oxygen mask any time the aircraft is flown above 35,000 feet MSL. (PLT438, AA.I.G.K5) — 14 CFR §135.89",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-68 · question 8055 · ATS",
    "sourceQuestionId": "8055",
    "sourceEdition": "2025–2026",
    "sourcePage": 68,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8056",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "At altitudes above 10,000 feet through 12,000 feet MSL, each pilot of an unpressurized airplane must use supplemental oxygen for that part of the flight that is of a duration of more than",
    "options": [
      "20 minutes.",
      "30 minutes.",
      "45 minutes."
    ],
    "correctIndex": 1,
    "explanation": "Each pilot of an unpressurized aircraft shall use oxygen continuously when flying: 1. At altitudes above 10,000 feet through 12,000 feet MSL for the part of the flight, at those altitudes, that is more than 30 minutes duration; and 2. Above 12,000 feet MSL. (PLT438, AA.I.G.K5) — 14 CFR §135.89",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-68 · question 8056 · ATS",
    "sourceQuestionId": "8056",
    "sourceEdition": "2025–2026",
    "sourcePage": 68,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8072",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "A pressurized airplane being operated at FL330 can descend safely to 15,000 feet MSL in 3.5 minutes. What oxygen supply must be carried for all occupants other than the pilots?",
    "options": [
      "60 minutes.",
      "45 minutes.",
      "30 minutes."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate a pressurized aircraft above 15,000 feet MSL unless it is equipped to supply oxygen to each occupant, other than the pilots, for 1 hour. This is reduced to a 30-minute supply if the aircraft, at all times during flight above 15,000 feet MSL, can safely descend to 15,000 feet within 4 minutes. (PLT438, AA.I.G.K5) — 14 CFR §135.157",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-68 · question 8072 · ATS",
    "sourceQuestionId": "8072",
    "sourceEdition": "2025–2026",
    "sourcePage": 68,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8073",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "At what altitude, in an unpressurized airplane, must all passengers be supplied oxygen?",
    "options": [
      "Above 12,000 feet MSL.",
      "Above 14,000 feet MSL.",
      "Above 15,000 feet MSL."
    ],
    "correctIndex": 2,
    "explanation": "In unpressurized aircraft, at altitudes above 10,000 feet MSL through 15,000 feet MSL, oxygen must be available for 10 percent of the occupants, other than the pilots, for the part of the flight at those altitudes longer than 30 minutes. Above 15,000 feet MSL, oxygen must be available to all occupants, other than the pilots. (PLT438, AA.I.G.K5) — 14 CFR §135.157",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-68 · question 8073 · ATS",
    "sourceQuestionId": "8073",
    "sourceEdition": "2025–2026",
    "sourcePage": 68,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8074",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "Between what altitudes must oxygen be available to at least 10 percent of the occupants, in an unpressurized airplane, other than the pilots?",
    "options": [
      "Above 12,000 feet through 16,000 feet MSL, for any time period.",
      "Above 10,000 feet through 15,000 feet MSL, if flight at those altitudes is of more than a 30-minute duration.",
      "10,000 feet to 15,000 feet MSL, if flight at those altitudes is of more than a 30-minute duration."
    ],
    "correctIndex": 1,
    "explanation": "In unpressurized aircraft, at altitudes above 10,000 feet MSL through 15,000 feet MSL, oxygen must be available for 10 percent of the occupants, other than the pilots, for that part of the flight at those altitudes longer than 30 minutes. Above 15,000 feet MSL, oxygen must be available to all occupants. (PLT438, AA.I.G.K5) — 14 CFR §135.157",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-68 · question 8074 · ATS",
    "sourceQuestionId": "8074",
    "sourceEdition": "2025–2026",
    "sourcePage": 68,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8080",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "The oxygen requirements for occupants of a pressurized airplane operated at altitudes above FL250 is dependent upon the airplane’s ability to descend safely to an altitude of",
    "options": [
      "10,000 feet MSL in 4 minutes.",
      "12,000 feet MSL at a minimum rate of 2,500 ft/min.",
      "15,000 feet MSL in 4 minutes."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate a pressurized aircraft above 15,000 feet MSL unless it is equipped to supply oxygen to each occupant, other than the pilots, for 1 hour. This is reduced to a 30-minute supply if the aircraft, at all times during flight above 15,000 feet MSL, can safely descend to 15,000 feet within 4 minutes. (PLT438, AA.I.G.K5) — 14 CFR §135.157",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-68 · question 8080 · ATS",
    "sourceQuestionId": "8080",
    "sourceEdition": "2025–2026",
    "sourcePage": 68,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8021",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "Above which altitude/flight level must at least one of the two pilots, at the controls of a pressurized aircraft (with quick-donning masks) wear a secured and sealed oxygen mask?",
    "options": [
      "FL300.",
      "FL350.",
      "FL250."
    ],
    "correctIndex": 1,
    "explanation": "One pilot of a pressurized aircraft must wear an oxygen mask any time the aircraft is flown above 35,000 feet MSL. (PLT438, AA.I.G.K5) — 14 CFR §135.89",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-69 · question 8021 · ATS, RTC",
    "sourceQuestionId": "8021",
    "sourceEdition": "2025–2026",
    "sourcePage": 69,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8023",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "Which is a pilot requirement for oxygen?",
    "options": [
      "Each pilot of a pressurized aircraft operating at FL180 and above shall have an approved quick-donning type oxygen mask.",
      "On pressurized aircraft requiring a flightcrew of two pilots, both shall continuously wear oxygen masks whenever the cabin pressure altitude exceeds 12,000 feet MSL.",
      "On unpressurized aircraft, flying above 12,000 feet MSL, pilots shall use oxygen continuously."
    ],
    "correctIndex": 2,
    "explanation": "Each pilot of an unpressurized aircraft shall use oxygen continuously when flying: 1. At altitudes above 10,000 feet through 12,000 feet MSL for that part of the flight at those altitudes longer than 30 minutes; and 2. Above 12,000 feet MSL. (PLT438, AA.I.G.K5) — 14 CFR §135.89 Answer (A) is incorrect because quick-donning type oxygen masks are required above 25,000 feet MSL. Answer (B) is incorrect because both pilots should continuously use oxygen masks when the cabin pressure altitude is more than 10,000 feet MSL.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-69 · question 8023 · ATS, RTC",
    "sourceQuestionId": "8023",
    "sourceEdition": "2025–2026",
    "sourcePage": 69,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8024",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "Which requirement applies when oxygen is stored in liquid form?",
    "options": [
      "Smoking is not permitted within 50 feet of stored liquid oxygen.",
      "Liquefied oxygen is a hazardous material and must be kept in an isolated storage facility.",
      "The equipment used to store liquid oxygen must be covered in the certificate holder’s approved maintenance program."
    ],
    "correctIndex": 2,
    "explanation": "When the oxygen is stored in the form of a liquid, the equipment must have been under the certificate holder’s approved maintenance program since its purchase new, or since the storage container was last purged. (PLT438, AA.I.G.K5) — 14 CFR §135.91",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-69 · question 8024 · ATS, RTC",
    "sourceQuestionId": "8024",
    "sourceEdition": "2025–2026",
    "sourcePage": 69,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8025",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "Which is a condition that must be met when a person is administered medical oxygen in flight?",
    "options": [
      "The distance between a person using medical oxygen and any electrical unit must not be less than 5 feet.",
      "A person using oxygen equipment must be seated to avoid restricting access to, or use of, any required exit.",
      "A person being administered oxygen must be monitored by equipment that displays and records pulse and respiration."
    ],
    "correctIndex": 1,
    "explanation": "Oxygen equipment must be stowed and each person using the equipment must be seated so as not to restrict access to or use of any required emergency or regular exit, or of the aisle in the passenger compartment. (PLT438, AA.I.G.K5) — 14 CFR §135.91",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-69 · question 8025 · ATS, RTC",
    "sourceQuestionId": "8025",
    "sourceEdition": "2025–2026",
    "sourcePage": 69,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8030",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "Which is a requirement regarding the carriage and operation of oxygen equipment for medical use by passengers?",
    "options": [
      "No person may smoke within 10 feet of oxygen storage and dispensing equipment.",
      "When oxygen equipment is used for the medical treatment of a patient, the rules pertaining to emergency exit access are waived.",
      "No person may connect oxygen bottles or any other ancillary equipment until all passengers are aboard the aircraft and seated."
    ],
    "correctIndex": 0,
    "explanation": "No person may smoke within 10 feet of oxygen-dispensing equipment. (PLT438, AA.I.G.K5) — 14 CFR §135.91",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-69 · question 8030 · ATS, RTC",
    "sourceQuestionId": "8030",
    "sourceEdition": "2025–2026",
    "sourcePage": 69,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8031",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "If a certificate holder deviates from the provisions of regulations which pertain to medical use of oxygen by passengers, a complete report of the incident shall be sent to the FAA within",
    "options": [
      "7 working days.",
      "10 working days.",
      "10 days of the deviation."
    ],
    "correctIndex": 1,
    "explanation": "Each certificate holder who deviates from the provisions of the regulations pertaining to use of medical oxygen by passengers, must send a report of the deviation to the FAA Flight Standards District Office within 10 days excluding Saturdays, Sundays, and federal holidays. (PLT438, AA.I.G.K5) — 14 CFR §135.91",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-70 · question 8031 · ATS, RTC",
    "sourceQuestionId": "8031",
    "sourceEdition": "2025–2026",
    "sourcePage": 70,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8081",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "An unpressurized aircraft with 20 occupants other than the pilots will be cruising at 14,000 feet MSL for 25 minutes. For how many, if any, of these occupants must there be an oxygen supply?",
    "options": [
      "Five.",
      "Two.",
      "None."
    ],
    "correctIndex": 2,
    "explanation": "In unpressurized aircraft, at altitudes above 10,000 feet MSL through 15,000 feet MSL, oxygen must be available for 10 percent of the occupants, other than the pilots, for the part of the flight, at those altitudes, in excess of 30 minutes. Above 15,000 feet MSL, oxygen must be available to all occupants, other than the pilots. (PLT438, AA.I.G.K5) — 14 CFR §135.157",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-70 · question 8081 · ATS, RTC",
    "sourceQuestionId": "8081",
    "sourceEdition": "2025–2026",
    "sourcePage": 70,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9819",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "What are the oxygen requirements for passengers if operating at 14,000 feet?",
    "options": [
      "30 minutes for each passenger.",
      "available for 10% of the occupants.",
      "available for 10% of the occupants other than the pilots."
    ],
    "correctIndex": 2,
    "explanation": "In unpressurized aircraft at altitudes above 10,000 feet MSL through 15,000 feet MSL, oxygen must be available for 10 percent of the occupants, other than the pilots, for the part of the flight at those altitudes in excess of 30 minutes. Above 15,000 feet MSL, oxygen must be available to all occupants, other than the pilots. (PLT438, AA.I.G.K5) — 14 CFR §135.157",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-70 · question 9819 · ATS, RTC",
    "sourceQuestionId": "9819",
    "sourceEdition": "2025–2026",
    "sourcePage": 70,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9638",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Oxygen Requirements",
    "materia": "operaciones",
    "text": "(Refer to Figures 186, 187, 188, and 188A.) What are the passenger oxygen requirements on this 14 CFR Part 135 flight from Las Vegas to Provo?",
    "options": [
      "When above 10,000 feet through 15,000 feet, oxygen must be supplied to at least 10 percent of the aircraft occupants, including the pilots.",
      "Starting 30 minutes after climbing through 10,000 feet, 10 percent of the aircraft occupants until reaching cruise at 15,000 feet then all occupants must be supplied oxygen until descending below 15,000 feet, then 10 percent down to 10,000 feet.",
      "Starting 30 minutes after climbing through 10,000 feet, 10 percent of the aircraft occupants, except pilots, must be supplied oxygen until descending below 10,000 feet."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate an unpressurized aircraft at altitudes prescribed in this section unless it is equipped with enough oxygen dispensers and oxygen to supply the pilots under §135.89(a) and to supply when flying — 1. At altitudes above 10,000 feet through 15,000 feet MSL, oxygen to at least 10 percent of the occupants of the aircraft, other than pilots, for the part of the flight at those altitudes longer than 30 minutes; and 2. Above 15,000 feet MSL, oxygen to each occupant of the aircraft other than the pilots. (PLT438) — 14 CFR §135.157",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-70 · question 9638 · RTC",
    "sourceQuestionId": "9638",
    "sourceEdition": "2025–2026",
    "sourcePage": 70,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": [
      "atp_2026_figure-186.png",
      "atp_2026_figure-187.png",
      "atp_2026_figure-188.png",
      "atp_2026_figure-188a.png"
    ]
  },
  {
    "id": "q_la_ATP_2026_8317",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "National Transportation Safety Board (NTSB)",
    "materia": "operaciones",
    "text": "What period of time must a person be hospitalized before an injury may be defined by the NTSB as a “serious injury”?",
    "options": [
      "72 hours; commencing within 10 days after date of injury.",
      "48 hours; commencing within 7 days after date of the injury.",
      "10 days, with no other extenuating circumstances."
    ],
    "correctIndex": 1,
    "explanation": "Serious injury means any injury which requires hospitalization for more than 48 hours, commencing within 7 days from the date the injury was received. (PLT366, AA.I.G.K6) — NTSB §830.2",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-72 · question 8317 · ALL",
    "sourceQuestionId": "8317",
    "sourceEdition": "2025–2026",
    "sourcePage": 72,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8319",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "National Transportation Safety Board (NTSB)",
    "materia": "operaciones",
    "text": "Which of the following constitutes “substantial damage” according to NTSB Part 830?",
    "options": [
      "Ground damage to landing gear, wheels, or tires.",
      "Damage to wingtips (or rotor blades, in the case of a helicopter).",
      "Failure of a component which would adversely affect the performance, and which would require replacement."
    ],
    "correctIndex": 2,
    "explanation": "Substantial damage is defined as damage or failure which would adversely affect the structural strength, performance, or flight characteristics of the aircraft which would normally require major repair or replacement of the damaged component. (PLT395, AA.I.G.K6) — NTSB §830.2 Answer (A) is incorrect because ground damage to landing gear, wheels, or tires is not considered substantial damage for the purpose of NTSB Part 830. Answer (B) is incorrect because damage to wing tips (or rotorblades in the case of a helicopter) is not considered substantial damage for the purpose of NTSB Part 830.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-72 · question 8319 · ALL",
    "sourceQuestionId": "8319",
    "sourceEdition": "2025–2026",
    "sourcePage": 72,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8320",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "National Transportation Safety Board (NTSB)",
    "materia": "operaciones",
    "text": "Which of the following meets the requirements of a “serious injury” as defined by the NTSB?",
    "options": [
      "A simple fracture of the nose or other extremity.",
      "An injury which caused severe tendon damage.",
      "First-degree burns over 5 percent of the body."
    ],
    "correctIndex": 1,
    "explanation": "Serious injury includes severe tendon damage and second or third degree burns covering more than 5 percent of the body. (PLT395, AA.I.G.K6) — NTSB §830.2 Answer (A) is incorrect because simple fractures, such as of the finger, toe, or nose, are not considered a serious injury. Answer (C) is incorrect because only second and third degree burns or first degree burns over more than 5 percent of the body are defined as a serious injury. (First degree burns are less serious than second and third degree burns.)",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-72 · question 8320 · ALL",
    "sourceQuestionId": "8320",
    "sourceEdition": "2025–2026",
    "sourcePage": 72,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8318",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "National Transportation Safety Board (NTSB)",
    "materia": "operaciones",
    "text": "Within what time period should the nearest NTSB field office be notified when an aircraft is involved in an accident which results in substantial damage?",
    "options": [
      "Immediately.",
      "7 calendar days.",
      "10 days."
    ],
    "correctIndex": 0,
    "explanation": "The operator of an aircraft shall immediately, and by the most expeditious means available, notify the nearest NTSB field office when an aircraft accident occurs. (PLT366, AA.I.G.K6) — NTSB §830.5",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-72 · question 8318 · ALL",
    "sourceQuestionId": "8318",
    "sourceEdition": "2025–2026",
    "sourcePage": 72,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8321",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "National Transportation Safety Board (NTSB)",
    "materia": "operaciones",
    "text": "Which incident requires an immediate notification to NTSB?",
    "options": [
      "Aircraft colliding on the ground.",
      "Flight control system malfunction.",
      "Damage to property, other than the aircraft, estimated to exceed $10,000."
    ],
    "correctIndex": 1,
    "explanation": "The NTSB lists a flight control malfunction or failure as an incident requiring immediate notification to the field office. (PLT416, AA.I.G.K6) — NTSB §830.5",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-72 · question 8321 · ALL",
    "sourceQuestionId": "8321",
    "sourceEdition": "2025–2026",
    "sourcePage": 72,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8322",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "National Transportation Safety Board (NTSB)",
    "materia": "operaciones",
    "text": "Within how many days must the operator of an aircraft involved in an accident file a report to the NTSB?",
    "options": [
      "3 days.",
      "7 days.",
      "10 days."
    ],
    "correctIndex": 2,
    "explanation": "The NTSB requires a report to be filed within 10 days of the accident. (PLT366, AA.I.G.K6) — NTSB §830.15",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-72 · question 8322 · ALL",
    "sourceQuestionId": "8322",
    "sourceEdition": "2025–2026",
    "sourcePage": 72,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8323",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "National Transportation Safety Board (NTSB)",
    "materia": "operaciones",
    "text": "When is an operator of an aircraft, which has been involved in an incident, required to submit a report to the nearest field office of the NTSB?",
    "options": [
      "Within 7 days.",
      "Within 10 days.",
      "Only if requested to do so by the NTSB."
    ],
    "correctIndex": 2,
    "explanation": "An aircraft involved in an incident is required to file a report only on request from the NTSB. (PLT366, AA.I.G.K6) — NTSB §830.15",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-72 · question 8323 · ALL",
    "sourceQuestionId": "8323",
    "sourceEdition": "2025–2026",
    "sourcePage": 72,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9836",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "National Transportation Safety Board (NTSB)",
    "materia": "operaciones",
    "text": "Pilots and/or flightcrew members involved in near midair collision (NMAC) occurrences are urged to report each incident immediately",
    "options": [
      "by cell phone to the nearest Flight Standards District Office, as this is an emergency.",
      "to local law enforcement.",
      "by radio or telephone to the nearest FAA ATC facility or FSS."
    ],
    "correctIndex": 2,
    "explanation": "The primary purpose of the NMAC Reporting Program is to provide information for use in enhancing the safety and efficiency of the National Airspace System. Pilots and/or flightcrew members involved in NMAC occurrences are urged to report each incident immediately by radio or telephone to the nearest FAA ATC facility or FSS. (PLT526, AA.I.G.K6) — AIM ¶7-7-3",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-73 · question 9836 · ALL",
    "sourceQuestionId": "9836",
    "sourceEdition": "2025–2026",
    "sourcePage": 73,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9836_1",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "National Transportation Safety Board (NTSB)",
    "materia": "operaciones",
    "text": "What information is de-identified when a report is submitted through the Aviation Safety Reporting System (ASRS)?",
    "options": [
      "Crew identity information when criminal offenses have occurred.",
      "Crew identity information involving time-sensitive data.",
      "Crew identity information when prompt NTSB reporting is required."
    ],
    "correctIndex": 1,
    "explanation": "The ASRS is a voluntary, confidential, and non-punitive incident reporting system. All identifying information is removed from the report before the data is entered into the ASRS database. The FAA will not use reports submitted to this program (or information derived therefrom) in any enforcement action except information concerning accidents or criminal offenses which are wholly excluded from the program. (PLT526, AA.I.E.K13) — AC 00-46",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-73 · question 9836-1 · ALL",
    "sourceQuestionId": "9836-1",
    "sourceEdition": "2025–2026",
    "sourcePage": 73,
    "sourceCategories": [
      "ALL"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8053",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What aircraft operating under 14 CFR Part 135 are required to have a third gyroscopic bank-and-pitch indicator installed?",
    "options": [
      "All airplanes that are turbojet powered.",
      "All multiengine airplanes that require a two pilot flightcrew.",
      "All turbine powered aircraft having a passenger seating capacity of 30 seats or more."
    ],
    "correctIndex": 0,
    "explanation": "A third gyroscopic pitch-and-bank indicator is required on all turbojet-powered airplanes. (PLT405, AA.I.G.K5) — 14 CFR §135.149",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-73 · question 8053 · ATS",
    "sourceQuestionId": "8053",
    "sourceEdition": "2025–2026",
    "sourcePage": 73,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8054",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "In airplanes where a third gyroscopic bank-and-pitch indicator is required, that instrument must",
    "options": [
      "continue reliable operation for at least 30 minutes after the output of the airplane’s electrical generating system falls below an optimum level.",
      "be operable by a selector switch which may be actuated from either pilot station.",
      "continue reliable operation for a minimum of 30 minutes after total failure of the electrical generating system."
    ],
    "correctIndex": 2,
    "explanation": "A third gyroscopic pitch-and-bank indicator is required on all turbojet-powered airplanes. This indicator must be able to continue reliable operation for at least 30 minutes after the failure of the aircraft’s electrical generating system. (PLT405, AA.I.G.K5) — 14 CFR §135.149",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-73 · question 8054 · ATS",
    "sourceQuestionId": "8054",
    "sourceEdition": "2025–2026",
    "sourcePage": 73,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8069",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "In which airplanes is a Class A TAWS required?",
    "options": [
      "All airplanes having a passenger seating configuration, excluding any pilot seat, of 10 seats or more.",
      "Turbine-powered airplanes having a passenger seating configuration, excluding any pilot seat, of 10 seats or more.",
      "Turbine-powered aircraft having a passenger seating configuration, including any pilot seat, of 10 seats or more."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate a turbine-powered airplane having a passenger seating configuration, excluding any pilot seat, of 10 seats or more unless it is equipped with a terrain awareness system (TAWS). (PLT139, AA.I.G.K5) — 14 CFR §135.154",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-73 · question 8069 · ATS",
    "sourceQuestionId": "8069",
    "sourceEdition": "2025–2026",
    "sourcePage": 73,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8075",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Which airplanes must have a shoulder harness installed at each flight crewmember station?",
    "options": [
      "All airplanes used in commuter air service, having a passenger seating configuration of 9, excluding any pilot seat.",
      "All airplanes operating under 14 CFR Part 135, having a seating configuration for 10 persons.",
      "All turbojet-powered airplanes."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate a turbojet aircraft or an aircraft having a passenger seating configuration, excluding any pilot seat, of 10 seats or more unless it is equipped with an approved shoulder harness installed for each flight crewmember station. (PLT464, AA.I.G.K5) — 14 CFR §135.171",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-74 · question 8075 · ATS",
    "sourceQuestionId": "8075",
    "sourceEdition": "2025–2026",
    "sourcePage": 74,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8165",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What emergency equipment is required for extended overwater operations?",
    "options": [
      "A portable survival emergency locator transmitter for each liferaft.",
      "A pyrotechnic signaling device for each life preserver.",
      "A life preserver equipped with a survivor locator light, for each person on the airplane."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate an aircraft in extended overwater operations unless it carries an approved life preserver (easily accessible to each seated occupant) equipped with an approved survivor locator light for each occupant of the aircraft, and enough approved life rafts of a rated capacity and buoyancy to accommodate the occupants of the aircraft. An approved survival-type emergency locator transmitter must be attached to one of the life rafts. (PLT404, AA.I.G.K5) — 14 CFR §135.167 Answer (A) is incorrect because only one survival emergency locator transmitter is required to be carried on the airplane. Answer (B) is incorrect because one pyrotechnic signaling device is required for each life raft.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-74 · question 8165 · ATS, ADX",
    "sourceQuestionId": "8165",
    "sourceEdition": "2025–2026",
    "sourcePage": 74,
    "sourceCategories": [
      "ATS",
      "ADX"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8088",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "If the weather forecasts do not require the listing of an alternate airport on an IFR flight, the airplane must carry sufficient fuel to fly to the destination airport and",
    "options": [
      "make one missed approach and thereafter have a 45-minute reserve at normal cruising speed.",
      "fly thereafter for 45 minutes at normal cruising speed.",
      "fly for 45 minutes thereafter at normal cruise climb speed."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate an aircraft in IFR conditions unless it carries enough fuel (considering weather reports and forecasts) to: 1. Complete the flight to the first airport of intended landing; 2. Fly from that airport to the alternate airport (if one is required); and 3. Fly after that for 45 minutes at normal cruising speed. (PLT413, AA.I.G.K5) — 14 CFR §135.223",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-74 · question 8088 · ATS",
    "sourceQuestionId": "8088",
    "sourceEdition": "2025–2026",
    "sourcePage": 74,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8089",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "If the weather forecasts require the listing of an alternate airport on an IFR flight, the airplane must carry enough fuel to fly to the first airport of intended landing, then to the alternate, and fly thereafter for a minimum of",
    "options": [
      "45 minutes at normal holding speed.",
      "45 minutes at normal cruise speed and then complete an approach and landing.",
      "45 minutes at normal cruise speed."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate an aircraft in IFR conditions unless it carries enough fuel (considering weather reports and forecasts) to: 1. Complete the flight to the first airport of intended landing; 2. Fly from that airport to the alternate airport (if one is required); and 3. Fly after that for 45 minutes at normal cruising speed. (PLT413, AA.I.G.K5) — 14 CFR §135.223",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-74 · question 8089 · ATS",
    "sourceQuestionId": "8089",
    "sourceEdition": "2025–2026",
    "sourcePage": 74,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8115",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "When computing the takeoff data for reciprocating powered airplanes, what is the percentage of the reported headwind component that may be applied to the “still air” data?",
    "options": [
      "Not more than 150 percent.",
      "Not more than 100 percent.",
      "Not more than 50 percent."
    ],
    "correctIndex": 2,
    "explanation": "When computing takeoff data not more than 50 percent of the reported headwind component may be taken into account. (PLT011, AA.I.B.K2b) — 14 CFR §135.389",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-74 · question 8115 · ATS",
    "sourceQuestionId": "8115",
    "sourceEdition": "2025–2026",
    "sourcePage": 74,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8116",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "When computing takeoff data, what is the percentage of the effective tailwind component which may be applied to the “still air” data?",
    "options": [
      "Not less than 150 percent.",
      "Not less than 100 percent.",
      "Not more than 50 percent."
    ],
    "correctIndex": 0,
    "explanation": "When computing takeoff data not less than 150 percent of the reported tailwind component may be taken into account. (PLT011, AA.I.B.K2b) — 14 CFR §135.389",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-75 · question 8116 · ATS",
    "sourceQuestionId": "8116",
    "sourceEdition": "2025–2026",
    "sourcePage": 75,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8050",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Which performance requirement applies to passenger-carrying land airplanes being operated over water?",
    "options": [
      "Multiengine airplanes must be able to climb, with the critical engine inoperative, at least 50 ft/min at 1,500 feet above the surface.",
      "Single-engine airplanes must be operated at an altitude that will allow them to reach land in case of engine failure.",
      "Multiengine airplanes must be able to climb, with the critical engine inoperative, at least 100 ft/min at 1,000 feet above the surface."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate a land aircraft carrying passengers over water unless it is operated at an altitude that allows it to reach land in the case of engine failure. (PLT437, AA.I.G.K5) — 14 CFR §135.183",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-75 · question 8050 · ATS",
    "sourceQuestionId": "8050",
    "sourceEdition": "2025–2026",
    "sourcePage": 75,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8051",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What performance is required of a multiengine airplane with the critical engine inoperative, while carrying passengers for hire in IFR weather conditions?",
    "options": [
      "Climb at least 100 ft/min at the highest MEA of the route to be flown or 5,000 feet MSL, whichever is higher.",
      "Climb at least 50 ft/min at the MEA’s of the route to be flown or 5,000 feet AGL, whichever is higher.",
      "Climb at least 50 ft/min at the MEA’s of the route to be flown or 5,000 feet MSL, whichever is higher."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate a multi-engine airplane carrying passengers in VFR over-the-top or IFR conditions at a weight that will not allow it to climb with the critical engine inoperative at 50 fpm when operating at the MEAs of the route to be flown or 5,000 feet MSL, whichever is higher. (PLT223, AA.I.G.K5) — 14 CFR §135.181",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-75 · question 8051 · ATS",
    "sourceQuestionId": "8051",
    "sourceEdition": "2025–2026",
    "sourcePage": 75,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8792",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The crewmember interphone system on a large turbojet-powered airplane provides a means of two-way communications between ground personnel and at least one of two flight crewmembers in the pilot compartment, when the aircraft is on the ground. The interphone station for use by ground personnel must be located so that those using the system from that station",
    "options": [
      "are always visible from within the airplane.",
      "are able to avoid the intake areas of the engines.",
      "may avoid visible detection from within the airplane."
    ],
    "correctIndex": 2,
    "explanation": "The interphone system station for use by ground personnel must be so located that personnel using the system may avoid visible detection from within the airplane. (PLT462, AA.I.G.K5) — 14 CFR §135.150",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-75 · question 8792 · ATS",
    "sourceQuestionId": "8792",
    "sourceEdition": "2025–2026",
    "sourcePage": 75,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8831",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "For which of these aircraft may part of the “clearway” distance, for a particular runway, be considered in computing the takeoff distance?",
    "options": [
      "Passenger-carrying transport aircraft.",
      "Turbine-engine-powered transport airplanes, certificated after September 30, 1958.",
      "U.S. certified transport airplane, certificated before August 26, 1957."
    ],
    "correctIndex": 1,
    "explanation": "The clearway may be used in computing the takeoff distance of turbine-engine-powered airplanes certificated after September 30, 1958. (PLT456, AA.I.G.K5) — 14 CFR §1.1",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-75 · question 8831 · ATS",
    "sourceQuestionId": "8831",
    "sourceEdition": "2025–2026",
    "sourcePage": 75,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8832",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What requirement must be met regarding cargo that is carried anywhere in the passenger compartment of a commuter air carrier airplane?",
    "options": [
      "Cargo may not be carried anywhere in the rear of the passenger compartment.",
      "The bin in which the cargo is carried may not be installed in a position that restricts access to, or use of the aisle between the crew and the passenger compartment.",
      "The container or bin in which the cargo is carried must be made of material which is at least flash resistant."
    ],
    "correctIndex": 1,
    "explanation": "No person may carry cargo, including carry-on baggage, in an aircraft unless it is in an approved cargo rack, bin, or compartment and it does not obstruct access to, or use of, the aisle between the passenger and crew compartment. (PLT385, AA.I.G.K5) — 14 CFR §135.87",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-75 · question 8832 · ATS",
    "sourceQuestionId": "8832",
    "sourceEdition": "2025–2026",
    "sourcePage": 75,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8833",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Information recorded during normal operation of a flight deck voice recorder in a multiengine turbine powered airplane",
    "options": [
      "may all be erased or otherwise obliterated except for the last 30 minutes.",
      "may all be erased or otherwise obliterated except for the last 30 minutes prior to landing.",
      "may all be erased, prior to each flight, unless the NTSB has requested that it be kept for 60 days."
    ],
    "correctIndex": 0,
    "explanation": "Information recorded more than 30 minutes earlier may be erased or obliterated. (PLT388, AA.I.G.K5) — 14 CFR §135.151",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-76 · question 8833 · ATS",
    "sourceQuestionId": "8833",
    "sourceEdition": "2025–2026",
    "sourcePage": 76,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8842",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "An airplane operated by a commuter air carrier flying in extended overwater operations must carry enough approved liferafts of a rated capacity and buoyancy to accommodate the occupants of the aircraft. Each liferaft must be equipped with",
    "options": [
      "one approved pyrotechnic signaling device.",
      "colored smoke flares and a signal mirror.",
      "one fishing kit for each person the raft is rated to carry."
    ],
    "correctIndex": 0,
    "explanation": "Every aircraft flown in extended overwater operations must carry enough appropriately equipped life rafts to accommodate the occupants of the aircraft. Each raft must have an approved pyrotechnic signaling device (either smoke or flare type flare). (PLT082, AA.I.G.K5) — 14 CFR §135.167 Answer (B) is incorrect because the survival kit is not required to have colored smoke flares. Answer (C) is incorrect because the survival kit is only required to have one fishing kit per liferaft, not one per person.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-76 · question 8842 · ATS",
    "sourceQuestionId": "8842",
    "sourceEdition": "2025–2026",
    "sourcePage": 76,
    "sourceCategories": [
      "ATS"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8001",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "A certificate holder must have “exclusive use” of",
    "options": [
      "at least one aircraft that meets the requirements of each kind of operation authorized in the Operations Specifications.",
      "at least one aircraft that meets the requirements of at least one kind of operation authorized in the certificate holder’s Operations Specifications.",
      "at least one aircraft that meets the requirements of the specific operations authorized in the certificate holder’s Operations Specifications."
    ],
    "correctIndex": 1,
    "explanation": "Each certificate holder must have the exclusive use of at least one aircraft that meets the requirements for at least one kind of operation authorized in the certificate holder’s operations specifications. (PLT454, AA.I.G.K5) — 14 CFR §135.25",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-76 · question 8001 · ATS, RTC",
    "sourceQuestionId": "8001",
    "sourceEdition": "2025–2026",
    "sourcePage": 76,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8005",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Where is the certificate holder required to list the name and title of each person authorized to exercise operational control for a particular flight?",
    "options": [
      "Operations Specifications.",
      "Attached to the load manifest.",
      "Certificate holder’s manual."
    ],
    "correctIndex": 2,
    "explanation": "Each certificate holder is responsible for operational control and shall list in the manual the name and title of each person authorized to exercise operational control. (PLT282, AA.I.G.K5) — 14 CFR §135.77",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-76 · question 8005 · ATS, RTC",
    "sourceQuestionId": "8005",
    "sourceEdition": "2025–2026",
    "sourcePage": 76,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8010",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "An aircraft being operated outside of the United States, over a foreign country, by a 14 CFR Part 135 operator must comply with",
    "options": [
      "the International Civil Aviation Organization (ICAO), Annex 3, Rules of the Air.",
      "regulations of the foreign country.",
      "rules of the U.S. State Department and the foreign country."
    ],
    "correctIndex": 1,
    "explanation": "Each person operating an aircraft under Part 135 while operating outside the United States, shall comply with Annex 2, Rules of the Air, to the Convention of International Civil Aviation or the regulations of any foreign country, whichever applies. (PLT392, AA.I.G.K5) — 14 CFR §135.3",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-76 · question 8010 · ATS, RTC",
    "sourceQuestionId": "8010",
    "sourceEdition": "2025–2026",
    "sourcePage": 76,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8011",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Who is responsible for keeping copies of the certificate holder’s manual up to date with approved changes or additions?",
    "options": [
      "Each of the certificate holder’s employees who are furnished a manual.",
      "An employee designated by the certificate holder.",
      "A representative of the certificate holder approved by the Administrator."
    ],
    "correctIndex": 0,
    "explanation": "Each employee of the certificate holder to whom a manual (or appropriate portions of it) is furnished shall keep it up to date with changes and additions furnished to them. (PLT282, AA.I.G.K5) — 14 CFR §135.21",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-76 · question 8011 · ATS, RTC",
    "sourceQuestionId": "8011",
    "sourceEdition": "2025–2026",
    "sourcePage": 76,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9807",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "No person may operate a U.S. registered civil aircraft",
    "options": [
      "for which an AFM or RFM is required by Part 21 section 21.5 unless there is a current, approved operator’s manual available.",
      "for which an AFM or RFM is required by Part 21 section 21.5 unless there is a current, approved AFM or RFM available.",
      "for which an AFM or RFM is required by Part 21 section 21.5 unless there is a current, approved AFM or RFM available or the manual specified in Part 135 section 135.19(b)."
    ],
    "correctIndex": 1,
    "explanation": "Per 14 CFR §21.5, with each airplane or rotorcraft not type certificated with an airplane or rotorcraft flight manual and having no flight time before March 1, 1979, the holder of a type certificate (including amended or supplemental type certificates) or the licensee of a type certificate must make available to the owner at the time of delivery of the aircraft a current approved airplane or rotorcraft flight manual. (PLT373, AA.I.G.S1) — 14 CFR §21.5",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-77 · question 9807 · ATS, RTC",
    "sourceQuestionId": "9807",
    "sourceEdition": "2025–2026",
    "sourcePage": 77,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8013",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What is the lowest altitude above the terrain that an autopilot may be used during en route operations, if the Airplane Flight Manual specifies a malfunction under cruise conditions?",
    "options": [
      "1,000 feet.",
      "500 feet.",
      "100 feet."
    ],
    "correctIndex": 1,
    "explanation": "Except for approaches, no person may use an autopilot at an altitude above the terrain which is less than 500 feet or less than twice the maximum altitude loss specified in the approved AFM or equivalent for a malfunction of the autopilot, whichever is higher. (PLT424, AA.I.G.K5) — 14 CFR §135.93",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-77 · question 8013 · ATS, RTC",
    "sourceQuestionId": "8013",
    "sourceEdition": "2025–2026",
    "sourcePage": 77,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8033",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Who may be allowed to carry a deadly weapon on board an aircraft operated under 14 CFR Part 135?",
    "options": [
      "Official bodyguards attached to foreign legations.",
      "Crewmembers and/or others authorized by the certificate holder.",
      "Employees of a municipality or a state, or of the United States."
    ],
    "correctIndex": 1,
    "explanation": "No person may carry a deadly weapon on a Part 135 flight except for: 1. Officials or employees of a municipality or a state or of the United States, who are authorized to carry arms; or 2. Crewmembers and other persons authorized by the certificate holder to carry arms. (PLT440, AA.I.G.K5) — 14 CFR §135.119",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-77 · question 8033 · ATS, RTC",
    "sourceQuestionId": "8033",
    "sourceEdition": "2025–2026",
    "sourcePage": 77,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8038",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Which person may be carried aboard an aircraft without complying with the passenger-carrying requirements of 14 CFR Part 135?",
    "options": [
      "An individual who is necessary for the safe handling of hazardous material on the aircraft.",
      "A representative of the Administrator, traveling to attend a meeting.",
      "A member of the United States diplomatic corps on an official courier mission."
    ],
    "correctIndex": 0,
    "explanation": "The following persons may be carried on an aircraft without complying with the passenger-carrying rules of Part 135: 1. A crewmember or other employee of the certificate holder; 2. A person necessary for the safe handling of animals on the aircraft; 3. A person necessary for the safe handling of hazardous materials; 4. A person performing duty as a security or honor guard accompanying a shipment made by or under the authority of the U.S. Government; 5. A military courier or a military route supervisor carried by a military cargo contract air carrier or commercial operator; 6. An authorized representative of the Administrator conducting an enroute inspection; or 7. A person, authorized by the Administrator, who is performing a duty connected with a cargo operation of the certificate holder. (PLT385, AA.I.G.K5) — 14 CFR §135.85",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-77 · question 8038 · ATS, RTC",
    "sourceQuestionId": "8038",
    "sourceEdition": "2025–2026",
    "sourcePage": 77,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8004",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "If previous arrangements have not been made by the operator, where can the procedures for servicing the aircraft be found?",
    "options": [
      "Certificate holder’s maintenance manual.",
      "Certificate holder’s manual.",
      "Pilot’s Handbook."
    ],
    "correctIndex": 1,
    "explanation": "The certificate holder’s manual must contain procedures to be followed by the pilot-in-command to obtain maintenance, preventative maintenance, and servicing of the aircraft at a place where previous arrangements have not been made by the operator, when the pilot is authorized to so act for the operator. (PLT282, AA.I.G.K5) — 14 CFR §135.23",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-78 · question 8004 · ATS, RTC",
    "sourceQuestionId": "8004",
    "sourceEdition": "2025–2026",
    "sourcePage": 78,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8006",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Who is directly responsible for determining the status of each mechanical irregularity previously entered in the aircraft maintenance log?",
    "options": [
      "Aircraft dispatcher.",
      "Line maintenance supervisor.",
      "The next pilot-in-command."
    ],
    "correctIndex": 2,
    "explanation": "Before each flight, the pilot-in-command shall determine, if the pilot does not already know, the status of each irregularity entered in the maintenance log at the end of the preceding flight. (PLT374, AA.I.G.K5) — 14 CFR §135.65",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-78 · question 8006 · ATS, RTC",
    "sourceQuestionId": "8006",
    "sourceEdition": "2025–2026",
    "sourcePage": 78,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8012",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What document contains procedures that explain how the required return-to-service conditions have been met?",
    "options": [
      "Maintenance manual.",
      "Pilot’s Handbook.",
      "Certificate holder’s manual."
    ],
    "correctIndex": 2,
    "explanation": "The certificate holder’s manual must include procedures for ensuring that the pilot-in-command knows that required airworthiness inspections have been made and that the aircraft has been returned to service in compliance with applicable maintenance requirements. (PLT375, AA.I.G.K5) — 14 CFR §135.23",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-78 · question 8012 · ATS, RTC",
    "sourceQuestionId": "8012",
    "sourceEdition": "2025–2026",
    "sourcePage": 78,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8019",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Procedures for keeping copies of the aircraft maintenance log in the aircraft and available to appropriate personnel shall be set forth in",
    "options": [
      "the certificate holder’s manual.",
      "the maintenance procedures handbook.",
      "the Operations Specifications."
    ],
    "correctIndex": 0,
    "explanation": "Each certificate holder shall establish a procedure for keeping copies of the aircraft maintenance log in the aircraft for access by appropriate personnel and shall include that procedure in the manual. (PLT282, AA.I.G.K5) — 14 CFR §135.65",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-78 · question 8019 · ATS, RTC",
    "sourceQuestionId": "8019",
    "sourceEdition": "2025–2026",
    "sourcePage": 78,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8093",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "If a certificate holder makes arrangements for another person to perform aircraft maintenance, that maintenance shall be performed in accordance with the",
    "options": [
      "certificate holder’s manual and 14 CFR Parts 43, 91, and 135.",
      "provisions of a contract prepared by a certificate holder and approved by the supervising FAA district office.",
      "provisions and standards as outlined in the certificate holder’s manual."
    ],
    "correctIndex": 0,
    "explanation": "The certificate holder shall ensure that any maintenance, preventative maintenance, or alteration that is performed by another person is performed under the certificate holder’s manual and regulations. (PLT282, AA.I.G.K5) — 14 CFR §135.413",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-78 · question 8093 · ATS, RTC",
    "sourceQuestionId": "8093",
    "sourceEdition": "2025–2026",
    "sourcePage": 78,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8112",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Who is responsible for submitting a Mechanical Reliability Report?",
    "options": [
      "Each certificate holder.",
      "Director of maintenance at the facility that discovers the reportable condition.",
      "Chief inspector at the facility where the condition is found."
    ],
    "correctIndex": 0,
    "explanation": "The certificate holder is responsible for submitting required mechanical reliability reports. (PLT443, AA.I.G.K5) — 14 CFR §135.415",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-78 · question 8112 · ATS, RTC",
    "sourceQuestionId": "8112",
    "sourceEdition": "2025–2026",
    "sourcePage": 78,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8014",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The maximum altitude loss specified for malfunction of a certain autopilot under cruise conditions is 50 feet. What is the lowest altitude this autopilot may be used en route?",
    "options": [
      "500 feet AGL.",
      "550 feet AGL.",
      "600 feet AGL."
    ],
    "correctIndex": 0,
    "explanation": "Except for approaches, no person may use an autopilot at an altitude above the terrain which is less than 500 feet or less than twice the maximum altitude loss specified in the approved AFM or equivalent for a malfunction of the autopilot, whichever is higher. (PLT424, AA.I.G.K5) — 14 CFR §135.93",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-79 · question 8014 · ATS, RTC",
    "sourceQuestionId": "8014",
    "sourceEdition": "2025–2026",
    "sourcePage": 79,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8015",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The maximum altitude loss for a particular malfunctioning autopilot under approach conditions is 55 feet. If the TDZE is 571 feet and the MDA is 1,100 feet, to which minimum altitude may you use this autopilot?",
    "options": [
      "626 feet MSL.",
      "990 feet MSL.",
      "1,050 feet MSL."
    ],
    "correctIndex": 2,
    "explanation": "When using an instrument approach facility other than ILS, no person may use an autopilot at an altitude above the terrain that is less than 50 feet below the approved minimum descent altitude for that procedure, or less than twice the maximum loss specified in the approved AFM or equivalent for malfunction of the autopilot under approach conditions, whichever is higher. (PLT424, AA.I.G.K5) — 14 CFR §135.93",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-79 · question 8015 · ATS, RTC",
    "sourceQuestionId": "8015",
    "sourceEdition": "2025–2026",
    "sourcePage": 79,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8016",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The maximum altitude loss for a malfunctioning autopilot with an approach coupler is 40 feet. To which minimum altitude may the autopilot be used during an ILS approach in less than basic VFR conditions?",
    "options": [
      "40 feet AGL.",
      "50 feet AGL.",
      "80 feet AGL."
    ],
    "correctIndex": 1,
    "explanation": "For ILS approaches, when reported weather is less than VFR minimums, no person may use an autopilot with an approach coupler at an altitude that is less than 50 feet above the terrain, or the maximum altitude loss specified in the approved AFM or equivalent, for the malfunction of the autopilot with an approach coupler, whichever is higher. (PLT424, AA.I.G.K5) — 14 CFR §135.93",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-79 · question 8016 · ATS, RTC",
    "sourceQuestionId": "8016",
    "sourceEdition": "2025–2026",
    "sourcePage": 79,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8017",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The maximum altitude loss for a malfunctioning autopilot without an approach coupler is 45 feet. If the MDA is 1,620 feet MSL and the TDZE is 1,294 feet, to which minimum altitude may you use the autopilot?",
    "options": [
      "1,510 feet MSL.",
      "1,339 feet MSL.",
      "1,570 feet MSL."
    ],
    "correctIndex": 2,
    "explanation": "When using an instrument approach facility other than ILS, no person may use an autopilot at an altitude above the terrain that is less than 50 feet below the approved minimum descent altitude for that procedure, or less than twice the maximum loss specified in the approved AFM or equivalent for malfunction of the autopilot under approach conditions, whichever is higher. (PLT424, AA.I.G.K5) — 14 CFR §135.93",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-79 · question 8017 · ATS, RTC",
    "sourceQuestionId": "8017",
    "sourceEdition": "2025–2026",
    "sourcePage": 79,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8037",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The altitude loss for a particular malfunctioning autopilot with an approach coupler is 60 feet. If the reported weather is below basic VFR minimums and an ILS approach using the approach coupler is to be used, what minimum altitude may be used?",
    "options": [
      "50 feet AGL.",
      "55 feet AGL.",
      "60 feet AGL."
    ],
    "correctIndex": 2,
    "explanation": "For ILS approaches, when reported weather is less than VFR, no person may use an autopilot with an approach coupler at an altitude that is less than 50 feet above the terrain, or the maximum altitude loss specified in the approved AFM or equivalent, for the malfunction of the autopilot with an approach coupler, whichever is higher. (PLT424, AA.I.G.K5) — 14 CFR §135.93",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-79 · question 8037 · ATS, RTC",
    "sourceQuestionId": "8037",
    "sourceEdition": "2025–2026",
    "sourcePage": 79,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8045",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "During which time period must a required voice recorder of a passenger-carrying airplane be continuously operated?",
    "options": [
      "From the beginning of taxi to the end of the landing roll.",
      "From engine start at departure airport to engine shutdown at landing airport.",
      "From the use of the checklist before the flight to completion of the final check at the end of the flight."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate a multi-engine, turbine-powered airplane or rotorcraft having a passenger seating configuration of 20 or more seats unless it is equipped with an approved flight deck voice recorder that: 1. Is installed in compliance with Parts 23, 25, 27, or 29 as applicable to Part 135; and 2. Is operated continuously from the use of the checklist before the flight to completion of the final check at the end of the flight. (PLT405, AA.I.G.K5) — 14 CFR §135.151",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-79 · question 8045 · ATS, RTC",
    "sourceQuestionId": "8045",
    "sourceEdition": "2025–2026",
    "sourcePage": 79,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8046",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "An approved flight deck voice recorder is required equipment in",
    "options": [
      "large turbine-powered airplanes having a maximum passenger capacity of 20 or more seats.",
      "multiengine, turbine-powered airplanes having a passenger seating configuration of 20 or more seats.",
      "all aircraft operated in commuter air carrier service having a passenger seating configuration of 20 seats or more."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate a multi-engine, turbine-powered airplane or rotorcraft having a passenger seating configuration of 20 or more seats unless it is equipped with an approved flight deck voice recorder. (PLT405, AA.I.G.K5) — 14 CFR §135.151",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-80 · question 8046 · ATS, RTC",
    "sourceQuestionId": "8046",
    "sourceEdition": "2025–2026",
    "sourcePage": 80,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8047",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Information recorded during normal operation of a flight deck voice recorder in a large turbine powered airplane",
    "options": [
      "may be erased or otherwise obliterated except for the last 30 minutes prior to landing.",
      "may all be erased or otherwise obliterated except for the last 30 minutes.",
      "may all be erased, as the voice recorder is not required on an aircraft with reciprocating engines."
    ],
    "correctIndex": 0,
    "explanation": "No person may operate a multi-engine, turbine-powered airplane or rotorcraft having a passenger seating configuration of 20 or more seats unless it is equipped with an approved flight deck voice recorder that: 1. Is installed in compliance with Parts 23, 25, 27, or 29 as applicable to Part 135; and 2. Is operated continuously from the use of the checklist before the flight to completion of the final check at the end of the flight. In complying with this section, information recorded more than 30 minutes earlier may be erased or otherwise obliterated. (PLT388, AA.I.G.K5) — 14 CFR §135.151",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-80 · question 8047 · ATS, RTC",
    "sourceQuestionId": "8047",
    "sourceEdition": "2025–2026",
    "sourcePage": 80,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8048",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Which aircraft must be equipped with an approved public address and crewmember interphone system?",
    "options": [
      "All turbine-engine-powered aircraft having a seating configuration of more than 19 seats.",
      "Aircraft having a passenger seating configuration, excluding any pilot seat, of more than 19 seats.",
      "Multiengine aircraft having a passenger seating configuration of 10 seats or more."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate an aircraft having a passen ger seat ing configuration, excluding any pilot seat, of more than 19 unless an approved public address and crew interphone system is installed. (PLT462, AA.I.G.K5) — 14 CFR §135.150",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-80 · question 8048 · ATS, RTC",
    "sourceQuestionId": "8048",
    "sourceEdition": "2025–2026",
    "sourcePage": 80,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8052",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "To operate an aircraft with certain equipment inoperative under the provisions of a minimum equipment list, what document authorizing it must be issued to the certificate holder?",
    "options": [
      "Letter of Authorization from the Regional Airworthiness Office authorizing such an operation.",
      "Operations specifications issued by the FAA district office having certification responsibility.",
      "Letter of Authorization issued by the FAA district office having certification responsibility."
    ],
    "correctIndex": 1,
    "explanation": "No person may takeoff with inoperable instruments or equipment installed unless the following conditions are met: 1. An approved Minimum Equipment List exists for that aircraft. 2. The certificate-holding district office has issued the certificate holder operations specifications authorizing operations in accordance with an approved MEL. The flight crew shall have direct access at all times prior to flight to all of the information contained in the approved MEL through printed or other means approved by the Administrator in the certificate holders operations specifications. An approved MEL, as authorized by the operations specifications, constitutes an approved change to the type design without requiring recertification. (PLT428, AA.I.G.K5) — 14 CFR §135.179",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-80 · question 8052 · ATS, RTC",
    "sourceQuestionId": "8052",
    "sourceEdition": "2025–2026",
    "sourcePage": 80,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8058",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "When a crash axe is required equipment on an aircraft, where should it be located?",
    "options": [
      "In the flight crew compartment.",
      "At a location inaccessible to the passengers during normal operations.",
      "At a location accessible to both the crew and passengers during normal operations."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate an aircraft having a passenger seating configuration, excluding any pilot seat, of more than 19 seats unless it is equipped with a crash axe carried that is accessible to the crew but inaccessible to passengers during normal operations. (PLT404, AA.I.G.K5) — 14 CFR §135.177",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-81 · question 8058 · ATS, RTC",
    "sourceQuestionId": "8058",
    "sourceEdition": "2025–2026",
    "sourcePage": 81,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8059",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "How many, if any, approved first aid kits are required on an aircraft having a passenger seating configuration of 20 seats and a passenger load of 14?",
    "options": [
      "None.",
      "One.",
      "Two."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate an aircraft having a passenger seating configuration, excluding any pilot seat, of more than 19 seats unless it is equipped with one approved first aid kit for the treatment of injuries likely to occur in flight or in a minor accident. (PLT404, AA.I.G.K5) — 14 CFR §135.177",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-81 · question 8059 · ATS, RTC",
    "sourceQuestionId": "8059",
    "sourceEdition": "2025–2026",
    "sourcePage": 81,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8060",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "An aircraft has a passenger seating configuration of 19 seats, excluding any pilot seats. How many, if any, approved first aid kits are required?",
    "options": [
      "One.",
      "Two.",
      "None."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate an aircraft having a passenger seating configuration, excluding any pilot seat, of more than 19 seats unless it is equipped with one approved first aid kit for the treatment of injuries likely to occur in flight or in a minor accident. (PLT404, AA.I.G.K5) — 14 CFR §135.177",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-81 · question 8060 · ATS, RTC",
    "sourceQuestionId": "8060",
    "sourceEdition": "2025–2026",
    "sourcePage": 81,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8061",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Airborne weather radar equipment must be installed in large transport category aircraft, in the conterminous 48 United States,",
    "options": [
      "that are engaged in passenger-carrying operations.",
      "that are engaged in either cargo or passenger-carrying operations.",
      "and be fully operational, although weather forecasts indicate no hazardous conditions."
    ],
    "correctIndex": 0,
    "explanation": "No person may operate a large, transport category aircraft in passenger-carrying operations unless approved airborne weather radar equipment is installed in the aircraft. (PLT367, AA.I.G.K5) — 14 CFR §135.175",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-81 · question 8061 · ATS, RTC",
    "sourceQuestionId": "8061",
    "sourceEdition": "2025–2026",
    "sourcePage": 81,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8062",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "In which aircraft, or under what conditions, is airborne thunderstorm detection equipment required?",
    "options": [
      "Large multiengine turbine-powered aircraft having a passenger seating configuration of 19 seats or more being operated by a commuter air carrier.",
      "Any aircraft having a passenger seating configuration of 19 seats or more that is engaged in passenger-carrying operations under IFR or at night.",
      "Small aircraft having a passenger seating configuration of 10 seats or more, excluding any pilot seat, that are engaged in passenger-carrying operations."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate an aircraft that has a passenger seating configuration, excluding any pilot seat, of 10 seats or more in passenger-carrying operations unless the aircraft is equipped with either approved thunderstorm detection equipment or approved airborne weather radar equipment. (PLT367, AA.I.G.K5) — 14 CFR §135.173",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-81 · question 8062 · ATS, RTC",
    "sourceQuestionId": "8062",
    "sourceEdition": "2025–2026",
    "sourcePage": 81,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8070",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "When a ground proximity warning system is required under 14 CFR Part 135, it must",
    "options": [
      "convey warnings of any deviation below glide slope and of excessive closure rate with the terrain.",
      "convey warnings for excessive closure rates with the terrain but not for deviation from an ILS glide slope.",
      "alert the pilot by an audible and visual warning signals when deviation above or below glide slope occurs."
    ],
    "correctIndex": 0,
    "explanation": "An approved ground proximity warning system must convey warnings of excessive closure rates with the terrain and any deviations below the glide slope by visual and audible means. (PLT139, AA.I.G.K5) — 14 CFR §135.154",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-82 · question 8070 · ATS, RTC",
    "sourceQuestionId": "8070",
    "sourceEdition": "2025–2026",
    "sourcePage": 82,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8071",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "When a ground proximity warning system is required, it must",
    "options": [
      "apply corrective control pressure when deviation below glide slope occurs.",
      "incorporate a means of alerting the pilot when a system malfunction occurs.",
      "incorporate a backup feature that activates automatically upon total failure of the aircraft’s electrical generating system."
    ],
    "correctIndex": 1,
    "explanation": "An approved ground proximity warning system must convey warnings of excessive closure rates with the terrain and any deviations below glide slope by visual and audible means. It must also incorporate a means of alerting the pilot when a malfunction occurs. (PLT139, AA.I.G.K5) — 14 CFR §135.154",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-82 · question 8071 · ATS, RTC",
    "sourceQuestionId": "8071",
    "sourceEdition": "2025–2026",
    "sourcePage": 82,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8077",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Which group of aircraft must have a shoulder harness installed at each flight crewmember station?",
    "options": [
      "Aircraft having a passenger seating configuration, excluding any pilot seat, of 10 seats or more.",
      "All passenger-carrying aircraft operating under 14 CFR Part 135, having a seating configuration for 10 persons.",
      "Large aircraft being operated in commuter air service, having a passenger seating configuration of 9, excluding any pilot seat."
    ],
    "correctIndex": 0,
    "explanation": "No person may operate a turbojet aircraft or an aircraft having a passenger seating configuration, excluding any pilot seat, of 10 seats or more unless it is equipped with an approved shoulder harness installed for each flight crewmember station. (PLT464, AA.I.G.K5) — 14 CFR §135.171",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-82 · question 8077 · ATS, RTC",
    "sourceQuestionId": "8077",
    "sourceEdition": "2025–2026",
    "sourcePage": 82,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8078",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Which is a requirement for life preservers during extended overwater operations? Each life preserver must be equipped with",
    "options": [
      "a dye marker.",
      "an approved survivor locator light.",
      "one flashlight having at least two size “D” cells or equivalent."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate an aircraft in extended overwater operations unless it carries an approved life preserver equipped with an approved survivor locator light for each occupant of the aircraft. (PLT437, AA.I.G.K5) — 14 CFR §135.167",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-82 · question 8078 · ATS, RTC",
    "sourceQuestionId": "8078",
    "sourceEdition": "2025–2026",
    "sourcePage": 82,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8079",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "In addition to fully-equipped liferafts and life preservers, what emergency equipment must be provided during extended overwater operations?",
    "options": [
      "One water resistant, self-buoyant, portable survival-type emergency radio transmitter for each liferaft.",
      "Each aircraft must have at least one liferaft, equipped with a survival-type emergency locator transmitter.",
      "One pyrotechnic signaling device for each aircraft."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate an aircraft in extended overwater operations unless there is attached to one of the required life rafts, a survival-type emergency locator transmitter. (PLT437, AA.I.G.K5) — 14 CFR §135.167",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-82 · question 8079 · ATS, RTC",
    "sourceQuestionId": "8079",
    "sourceEdition": "2025–2026",
    "sourcePage": 82,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8057",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "A pilot may make an IFR departure from an airport that does not have an approved standard instrument approach procedure if",
    "options": [
      "there is a departure alternate within 60 minutes and the weather there is above landing minimums.",
      "the Administrator has issued Operations Specifications to the certificate holder approving the procedure.",
      "the departure airport is within 30 minutes flying time of another airport that has an approved standard instrument approach procedure."
    ],
    "correctIndex": 1,
    "explanation": "The Administrator may issue operations specifications to the certificate holder to allow it to depart at an airport that does not have an approved standard instrument approach procedure when the Administrator determines that it is necessary to make an IFR departure from that airport and that the proposed operations can be conducted safely. (PLT459, AA.I.G.K5) — 14 CFR §135.215",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-83 · question 8057 · ATS, RTC",
    "sourceQuestionId": "8057",
    "sourceEdition": "2025–2026",
    "sourcePage": 83,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8063",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Assuming the required ceiling exists, an alternate for the destination airport is not required under 14 CFR 135 if, for at least 1 hour before and after the ETA, the forecast visibility is at least",
    "options": [
      "5 miles, or 3 miles more than the lowest applicable visibility minimums for the instrument approach procedure to be used, whichever is greater.",
      "3 miles, or 2 miles more than the lowest applicable visibility minimums for the instrument approach procedure to be used, whichever is greater.",
      "3 nautical miles, or 2 nautical miles more than the lowest applicable visibility minimums for the approach procedure to be used, which ever is greater."
    ],
    "correctIndex": 1,
    "explanation": "An alternate airport need not be designated if the ceiling criteria is met and the visibility is forecast to be at least 3 miles, or 2 miles more than the lowest applicable visibility minimums, whichever is the greater, for the instrument approach procedure to be used at the destination airport. (PLT379, AA.I.G.K5) — 14 CFR §135.223",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-83 · question 8063 · ATS, RTC",
    "sourceQuestionId": "8063",
    "sourceEdition": "2025–2026",
    "sourcePage": 83,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8064",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "A pilot may not designate an airport as an alternate unless the weather reports, or forecasts, or any combination of them indicate that it will be at or above alternate airport landing minimum at the",
    "options": [
      "time of departure.",
      "estimated time of arrival, plus or minus 1 hour.",
      "estimated time of arrival."
    ],
    "correctIndex": 2,
    "explanation": "No person may designate an alternate airport unless the weather reports or forecasts, or any combination of them, indicate that the weather conditions will be at or above authorized alternate airport landing minimums for that airport at the estimated time of arrival. (PLT379, AA.I.G.K5) — 14 CFR §135.221",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-83 · question 8064 · ATS, RTC",
    "sourceQuestionId": "8064",
    "sourceEdition": "2025–2026",
    "sourcePage": 83,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8065",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "A takeoff may not be made from an airport that is below the authorized IFR landing minimums unless",
    "options": [
      "there is an alternate airport with the required IFR landing minimums within 60 minutes flying time, at normal cruising speed in still air.",
      "the departure airport is forecast to have the required IFR landing minimums within 1 hour.",
      "there is an alternate airport with the required IFR landing minimums within 60 minutes flying time, at normal cruising speed in still air with one engine inoperative."
    ],
    "correctIndex": 0,
    "explanation": "No person may takeoff an aircraft under IFR from an airport where weather conditions are at or above takeoff minimums, but are below landing minimums, unless there is an alternate airport within one hour’s flying time (at normal cruising speed in still air) of the airport of departure. (PLT459, AA.I.G.K5) — 14 CFR §135.217",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-83 · question 8065 · ATS, RTC",
    "sourceQuestionId": "8065",
    "sourceEdition": "2025–2026",
    "sourcePage": 83,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8066",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "A pilot may not begin an IFR operation unless the next airport of intended landing is forecast to be at or above authorized IFR landing minimums at",
    "options": [
      "the estimated time of arrival, ±1 hour.",
      "the estimated time of arrival.",
      "the estimated time of arrival, ±30 minutes."
    ],
    "correctIndex": 1,
    "explanation": "No person may takeoff an aircraft under IFR or begin an IFR or VFR over-the-top operation unless the latest weather reports or forecasts, or any combination of them, indicate that weather conditions at the estimated time of arrival at the next airport of intended landing will be at or above authorized IFR landing minimums. (PLT459, AA.I.G.K5) — 14 CFR §135.219",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-83 · question 8066 · ATS, RTC",
    "sourceQuestionId": "8066",
    "sourceEdition": "2025–2026",
    "sourcePage": 83,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8068",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Which condition must be met to conduct IFR operations from an airport that is not at the location where weather observations are made?",
    "options": [
      "An “Authorization Letter” permitting the procedure must be issued by the FAA district office charged with the overall inspection of the certificate holder.",
      "A “Letter of Waiver” authorizing the procedure must be issued by the Administrator, after an investigation by the U.S. National Weather Service and the FSDO which find the standard of safety to be satisfactory.",
      "The Administrator must issue Operations Specifications that permit the procedure."
    ],
    "correctIndex": 2,
    "explanation": "The Administrator may issue operations specifications to the certificate holder to allow it to depart at an airport that does not have an approved standard instrument approach procedure when the Administrator determines that it is necessary to make an IFR departure from that airport and that the proposed operations can be conducted safely. (PLT282, AA.I.G.K5) — 14 CFR §135.215",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-84 · question 8068 · ATS, RTC",
    "sourceQuestionId": "8068",
    "sourceEdition": "2025–2026",
    "sourcePage": 84,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8084",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Which is an operational requirement concerning ice, snow, or frost on structural surfaces?",
    "options": [
      "A takeoff may be made with ice, snow, or frost adhering to the wings or stabilizing or control surfaces, but polished smooth, if the anti-icing and deicing equipment is operating.",
      "If snow, ice, or frost is adhering to the airplane’s lift or control surfaces, but polished smooth, a takeoff may be made.",
      "A takeoff may not be made if ice or snow is adhering to the wings or stabilizing or control surfaces."
    ],
    "correctIndex": 2,
    "explanation": "No pilot may takeoff in an aircraft that has snow or ice adhering to the wings, stabilizing, or control surfaces. (PLT493, AA.I.G.K5) — 14 CFR §135.227",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-84 · question 8084 · ATS, RTC",
    "sourceQuestionId": "8084",
    "sourceEdition": "2025–2026",
    "sourcePage": 84,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8085",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Which is one required condition for a pilot to take off under IFR with less-than-standard takeoff minimums at an airport where a straight-in instrument approach procedure is authorized and there is an approved weather reporting source?",
    "options": [
      "The pilot must have at least 100 hours as pilot-in-command in the type airplane to be flown.",
      "The certificate holder has been approved for such operation and the visibility at the time of takeoff must be at least RVR 16.",
      "Wind direction and velocity must be such that a straight-in approach can be made to the runway served by the procedure."
    ],
    "correctIndex": 2,
    "explanation": "At airports where straight-in instrument approach procedures are authorized, a pilot may takeoff in an aircraft under IFR when the weather conditions are equal to or better than the lowest straight-in landing minimums if: 1. The wind direction and velocity at the time of takeoff are such that a straight-in instrument approach can be made to the runway served by instrument approach; 2. The associated ground facilities upon which the landing minimums are predicated and the related airborne equipment are in normal operation; and 3. The certificate holder has been approved for such operations. (PLT459, AA.I.G.K5) — 14 CFR §135.225",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-84 · question 8085 · ATS, RTC",
    "sourceQuestionId": "8085",
    "sourceEdition": "2025–2026",
    "sourcePage": 84,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8086",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "After passing the final approach fix on a VOR approach, a weather report is received indicating the visibility is below prescribed minimums. In this situation, the pilot",
    "options": [
      "may continue the approach and land, if at the MDA, the actual weather conditions are at least equal to the minimums prescribed for the procedure.",
      "may continue the approach and land regardless of the visibility observed at the MDA, if prior to beginning the approach, the visibility was reported at or above minimums.",
      "should leveloff and continue to fly the approach to the MAP, and execute the missed approach."
    ],
    "correctIndex": 0,
    "explanation": "If a pilot has begun the final approach segment of a VOR, NDB, or comparable approach procedure and has passed the final approach fix when he or she receives a weather report indicating below minimum conditions, the pilot may continue the approach and, if upon reaching the MDA finds the weather at least equal to the prescribed minimums, may land. (PLT379, AA.I.G.K5) — 14 CFR §135.225",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-84 · question 8086 · ATS, RTC",
    "sourceQuestionId": "8086",
    "sourceEdition": "2025–2026",
    "sourcePage": 84,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8087",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "An alternate for a destination airport (circling not authorized) is not required if, for at least 1 hour before and after the ETA, the required visibility exists, and the forecast ceiling is at least",
    "options": [
      "1,500 feet above the lowest published minimum, or 2,000 feet above the airport elevation, whichever is higher.",
      "1,500 feet above the lowest MDA or 2,000 feet above the runway touchdown zone elevation, whichever is higher.",
      "1,000 feet above the lowest published minimum, or 1,500 feet above the airport elevation, whichever is higher."
    ],
    "correctIndex": 0,
    "explanation": "An alternate airport need not be designated if the required visibility criteria exists and the ceiling is forecast to be at least 1,500 feet above the lowest circling approach MDA. If no circling approach is authorized the ceiling must be forecast to be 1,500 feet above the lowest published minimum, or 2,000 feet above the airport elevation, whichever is higher. (PLT380, AA.I.G.K5) — 14 CFR §135.223",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-85 · question 8087 · ATS, RTC",
    "sourceQuestionId": "8087",
    "sourceEdition": "2025–2026",
    "sourcePage": 85,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8090",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "At a military airport, a pilot may not take off under IFR unless the reported weather conditions indicate that the",
    "options": [
      "visibility is at least 1 mile.",
      "ceiling is at least 500 feet and the visibility is 1 mile or more.",
      "airport has landing minimums."
    ],
    "correctIndex": 0,
    "explanation": "Each pilot making an IFR takeoff or approach and landing at a military or foreign airport shall comply with applicable instrument approach procedures and weather minimums prescribed by the authority having jurisdiction over that airport. In addition, no pilot may takeoff at that airport when the visibility is less than 1 mile. (PLT459, AA.I.G.K5) — 14 CFR §135.225",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-85 · question 8090 · ATS, RTC",
    "sourceQuestionId": "8090",
    "sourceEdition": "2025–2026",
    "sourcePage": 85,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8091",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "A pilot may not take off under IFR at a foreign airport unless the visibility is",
    "options": [
      "1/2 mile or more above landing minimums.",
      "1 mile or more and the ceiling is 500 feet or more.",
      "at least 1 mile."
    ],
    "correctIndex": 2,
    "explanation": "Each pilot making an IFR takeoff or approach and landing at a military or foreign airport shall comply with applicable instrument approach procedures and weather minimums prescribed by the authority having jurisdiction over that airport. In addition, no pilot may takeoff at that airport when the visibility is less than 1 mile. (PLT459, AA.I.G.K5) — 14 CFR §135.225",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-85 · question 8091 · ATS, RTC",
    "sourceQuestionId": "8091",
    "sourceEdition": "2025–2026",
    "sourcePage": 85,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8092",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "An instrument approach procedure to an airport may not be initiated unless the latest weather report issued by an authorized weather reporting facility indicates that weather conditions",
    "options": [
      "are at or above the circling minimums for the runway the pilot intends to use.",
      "are at or above the authorized IFR landing minimums for that procedure.",
      "exceed the straight-in minimums for all nonprecision approaches."
    ],
    "correctIndex": 1,
    "explanation": "No pilot may begin an instrument approach procedure to an airport unless the latest weather report issued by that weather reporting facility indicates that weather conditions are at or above the authorized IFR landing minimums for that airport. (PLT420, AA.I.G.K5) — 14 CFR §135.225",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-85 · question 8092 · ATS, RTC",
    "sourceQuestionId": "8092",
    "sourceEdition": "2025–2026",
    "sourcePage": 85,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8114",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What is the minimum ceiling and visibility for an airplane to operate under VFR in Class G airspace?",
    "options": [
      "2,000-foot ceiling; 1-mile visibility.",
      "2,000-foot ceiling; 1-mile flight visibility.",
      "1,000-foot ceiling; 2-miles flight visibility."
    ],
    "correctIndex": 2,
    "explanation": "No person may operate an airplane under VFR in uncontrolled airspace when the ceiling is less than 1,000 feet unless flight visibility is at least 2 miles. (PLT163, AA.I.G.K5) — 14 CFR §135.205",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-85 · question 8114 · ATS, RTC",
    "sourceQuestionId": "8114",
    "sourceEdition": "2025–2026",
    "sourcePage": 85,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8807",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Which document would constitute an approved change to the type design without requiring a recertification?",
    "options": [
      "An approved Minimum Equipment List.",
      "The Operations Specifications as approved by the Administrator.",
      "A special flight permit."
    ],
    "correctIndex": 0,
    "explanation": "An approved MEL, as authorized by the operations specifications, constitutes an approved change to the type design without requiring recertification. (PLT428, AA.I.G.K5) — 14 CFR §135.179",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-86 · question 8807 · ATS, RTC",
    "sourceQuestionId": "8807",
    "sourceEdition": "2025–2026",
    "sourcePage": 86,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8808",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "No person may operate an aircraft under 14 CFR Part 135, carrying passengers under VFR at night, unless",
    "options": [
      "each flight crewmember has a flashlight having at least two size “D” batteries or the equivalent.",
      "it is equipped with a flashlight having at least two size “D” cell or the equivalent.",
      "each crewmember has a flashlight having at least two size “D” cells and a spare bulb."
    ],
    "correctIndex": 1,
    "explanation": "No person may operate an aircraft carrying passengers under VFR at night unless it is equipped with a flashlight having at least two size “D” cells or equivalent. (PLT405, AA.I.G.K5) — 14 CFR §135.159",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-86 · question 8808 · ATS, RTC",
    "sourceQuestionId": "8808",
    "sourceEdition": "2025–2026",
    "sourcePage": 86,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8809",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "For operations during the period beginning 1 hour after sunset and ending 1 hour before sunrise (as published in the Air Almanac), no certificate holder may use any person, nor may any person serve, as pilot-in-command of an aircraft carrying passengers unless that person has made three takeoffs and three landings, within the preceding 90 days,",
    "options": [
      "as the sole manipulator of the flight controls in an aircraft of the same category and class and, if a type rating is required, of the same type in which that person is to serve.",
      "as pilot-in-command of an aircraft of the same category and class and, if a type rating is required, of the same type in which that person is to serve.",
      "as the sole manipulator of the flight controls in an aircraft of the same type in which that person is to serve."
    ],
    "correctIndex": 0,
    "explanation": "No person may serve as PIC of an aircraft carrying passengers unless, within the preceding 90 days, that person has, for operation during the period beginning 1 hour after sunset and ending 1 hour before sunrise (as published in the air almanac), made three takeoffs and three landings as the sole manipulator of the flight controls in an aircraft of the same category and class and, if a type rating is required, of the same type in which the person is to serve. (PLT442, AA.I.G.K5) — 14 CFR §135.247",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-86 · question 8809 · ATS, RTC",
    "sourceQuestionId": "8809",
    "sourceEdition": "2025–2026",
    "sourcePage": 86,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8813",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "An employee who performs safety-sensitive functions, for a certificate holder, who has actual knowledge of an accident involving an aircraft for which he or she performed a safety-sensitive function at or near the time of the accident shall not use alcohol",
    "options": [
      "until 4 hours after the accident.",
      "within 8 hours of the accident.",
      "until given a release by the NTSB or FAA."
    ],
    "correctIndex": 1,
    "explanation": "No covered employee who has actual knowledge of an accident involving an aircraft for which he or she has performed a safety-sensitive function at or near the time of the accident shall use alcohol for 8 hours following the accident. (PLT463, AA.I.G.K5) — 14 CFR §120.215",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-86 · question 8813 · ATS, RTC",
    "sourceQuestionId": "8813",
    "sourceEdition": "2025–2026",
    "sourcePage": 86,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8814",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What is the maximum number of hours that a pilot may fly in 7 consecutive days as a pilot in commercial flying and as a pilot for a commuter air carrier?",
    "options": [
      "32 hours.",
      "34 hours.",
      "35 hours."
    ],
    "correctIndex": 1,
    "explanation": "No certificate holder may schedule any flight crewmember for flight in scheduled operations if that crewmember’s total time in commercial flying will exceed: 1. 1,200 hours in any calendar year. 2. 120 hours in any calendar month. 3. 34 hours in any seven consecutive days. (PLT409, AA.I.G.K5) — 14 CFR §135.265",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-86 · question 8814 · ATS, RTC",
    "sourceQuestionId": "8814",
    "sourceEdition": "2025–2026",
    "sourcePage": 86,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8815",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What is the maximum number of hours that a commuter air carrier may schedule a flight crewmember to fly in scheduled operations and other commercial flying in any calendar month?",
    "options": [
      "100.",
      "110.",
      "120."
    ],
    "correctIndex": 2,
    "explanation": "No certificate holder may schedule any flight crewmember for flight in scheduled operations if that crewmember’s total time in commercial flying will exceed: 1. 1,200 hours in any calendar year. 2. 120 hours in any calendar month. 3. 34 hours in any seven consecutive days. (PLT409, AA.I.G.K5) — 14 CFR §135.265",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-87 · question 8815 · ATS, RTC",
    "sourceQuestionId": "8815",
    "sourceEdition": "2025–2026",
    "sourcePage": 87,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8819",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The pilot-in-command may deviate from 14 CFR Part 135 during an emergency involving the safety of persons or property only",
    "options": [
      "after ATC is notified of the emergency and the extent of deviation required.",
      "to the extent required to meet that emergency.",
      "if required to, by the emergency flight deck checklist."
    ],
    "correctIndex": 1,
    "explanation": "In an emergency involving the safety of persons or property, the pilot-in-command may deviate from the rules of Part 135 to the extent required to meet that emergency. (PLT444, AA.I.G.K5) — 14 CFR §135.19",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-87 · question 8819 · ATS, RTC",
    "sourceQuestionId": "8819",
    "sourceEdition": "2025–2026",
    "sourcePage": 87,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8820",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The training required for flight crewmembers who have not qualified and served in the same capacity on an aircraft is",
    "options": [
      "upgrade training.",
      "transition training.",
      "initial training."
    ],
    "correctIndex": 2,
    "explanation": "Initial training is the term used for the training required for crewmembers who have not qualified and served in the same capacity on an aircraft. (PLT407, AA.I.G.K5) — 14 CFR §135.321",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-87 · question 8820 · ATS, RTC",
    "sourceQuestionId": "8820",
    "sourceEdition": "2025–2026",
    "sourcePage": 87,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8821",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "A crewmember who has served as second in command on a particular aircraft type (e.g., BE-1900), may serve as pilot-in-command upon completing which training program?",
    "options": [
      "Upgrade training.",
      "Transition training.",
      "Initial training."
    ],
    "correctIndex": 0,
    "explanation": "Upgrade training is the training required of crewmembers who have qualified and served as second-in-command on a particular aircraft before they serve as PIC of that aircraft. (PLT407, AA.I.G.K5) — 14 CFR §135.321",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-87 · question 8821 · ATS, RTC",
    "sourceQuestionId": "8821",
    "sourceEdition": "2025–2026",
    "sourcePage": 87,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8827",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The training required for crewmembers who have been qualified and served in the same capacity on another aircraft is",
    "options": [
      "difference training.",
      "transition training.",
      "upgrade training."
    ],
    "correctIndex": 1,
    "explanation": "Transition training is the training required of crewmembers who have qualified and served in the same capacity on another aircraft. (PLT407, AA.I.G.K5) — 14 CFR §135.321",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-87 · question 8827 · ATS, RTC",
    "sourceQuestionId": "8827",
    "sourceEdition": "2025–2026",
    "sourcePage": 87,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8828",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The certificate holder must give instruction on such subjects as respiration, hypoxia, gas expansion, and decompression to crewmembers who serve in operations above",
    "options": [
      "FL180.",
      "FL200.",
      "FL250."
    ],
    "correctIndex": 2,
    "explanation": "Crewmembers who serve in operations above 25,000 feet must receive instruction in respiration, hypoxia, duration of consciousness without supplemental oxygen at altitude, gas expansion, gas bubble formation and physical phenomena and incidents of decompression. (PLT460, AA.I.G.K5) — 14 CFR §135.331",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-87 · question 8828 · ATS, RTC",
    "sourceQuestionId": "8828",
    "sourceEdition": "2025–2026",
    "sourcePage": 87,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8829",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "The air carrier must give instruction on such subjects as gas bubble formation, hypoxia, decompression, and length of consciousness without supplemental oxygen at altitude to crewmembers serving on aircraft operated above",
    "options": [
      "FL250.",
      "FL200.",
      "FL180."
    ],
    "correctIndex": 0,
    "explanation": "Crewmembers who serve in operations above 25,000 feet must receive instruction in respiration, hypoxia, duration of consciousness without supplemental oxygen at altitude, gas expansion, gas bubble formation and physical phenomena and incidents of decompression. (PLT407, AA.I.G.K5) — 14 CFR §135.331",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-88 · question 8829 · ATS, RTC",
    "sourceQuestionId": "8829",
    "sourceEdition": "2025–2026",
    "sourcePage": 88,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8830",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What is one of the requirements that must be met by a pilot-in-command to re-establish recency of experience?",
    "options": [
      "At least one full stop landing must be made from a circling approach.",
      "Three takeoffs and landings must be made as the sole manipulator of the controls, in the type, if a type rating is required, if not in the same category and class aircraft that the person is to serve.",
      "At least one nonprecision approach must be made to the lowest minimums authorized for the certificate holder."
    ],
    "correctIndex": 1,
    "explanation": "No person may serve as PIC of an aircraft carrying passengers unless, within the preceding 90 days, that person has made three takeoffs and three landings as the sole manipulator of the flight controls in an aircraft of the same category and class and, if a type rating is required, of the same type in which the person is to serve. (PLT442, AA.I.G.K5) — 14 CFR §135.247",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-88 · question 8830 · ATS, RTC",
    "sourceQuestionId": "8830",
    "sourceEdition": "2025–2026",
    "sourcePage": 88,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8834",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Federal Aviation Regulations require that interior emergency lights, on aircraft having a passenger seating configuration of 20 or more seats, must",
    "options": [
      "operate automatically when subjected to a negative G load.",
      "be operable manually from the flight crew station and a point in the passenger compartment.",
      "be armed or turned on during taxiing and all flight operations."
    ],
    "correctIndex": 1,
    "explanation": "Emergency exit lights must be operable manually from the flight crew station and from a station in the passenger compartment that is readily accessible to a normal flight attendant seat. (PLT404, AA.I.G.K5) — 14 CFR §135.178 Answer (A) is incorrect because the lights must operate automatically either with loss of normal electrical power or when an emergency assist means is activated, depending on the aircraft certification. Answer (C) is incorrect because the lights must be armed or turned on during taxi, takeoff and landing but not necessarily during all other flight operations.",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-88 · question 8834 · ATS, RTC",
    "sourceQuestionId": "8834",
    "sourceEdition": "2025–2026",
    "sourcePage": 88,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": [],
    "sourceOriginalText": "Federal Aviation Regulations require that interior emergency lights, on aircraft having a passenger seating configuration of 20 to",
    "sourceCorrection": "Printed prompt is incomplete after \"20 to\"; seating threshold completed from 14 CFR 135.178. Choices and answer B are unchanged.",
    "sourceCorrectionUrl": "https://www.ecfr.gov/current/title-14/chapter-I/subchapter-G/part-135/subpart-C/section-135.178"
  },
  {
    "id": "q_la_ATP_2026_8838",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "What emergency equipment is required for extended overwater operations?",
    "options": [
      "A portable survival emergency locator transmitter for each life raft.",
      "A pyrotechnic signaling device for each life preserver.",
      "A life preserver equipped with a survivor locator light, for each person on the airplane."
    ],
    "correctIndex": 2,
    "explanation": "Every aircraft flown in extended overwater operations must carry an approved life preserver for every occupant of the aircraft. This life preserver must be equipped with an approved survivor locator light. A life preserver must be readily accessible to each seated occupant. In addition, there must be enough appropriately equipped life rafts to accommodate all the occupants of the aircraft. One of the life rafts must have a survival type emergency locator transmitter. (PLT437, AA.I.G.K5) — 14 CFR §135.167",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-88 · question 8838 · ATS, RTC",
    "sourceQuestionId": "8838",
    "sourceEdition": "2025–2026",
    "sourcePage": 88,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8840",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Each aircraft being operated in extended overwater operations, must have a life preserver for each",
    "options": [
      "aircraft occupant.",
      "seat on the aircraft.",
      "passenger seat, plus 10 percent."
    ],
    "correctIndex": 0,
    "explanation": "Every aircraft flown in extended overwater operations must carry an approved life preserver for every occupant of the aircraft. (PLT437, AA.I.G.K5) — 14 CFR §135.167",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-88 · question 8840 · ATS, RTC",
    "sourceQuestionId": "8840",
    "sourceEdition": "2025–2026",
    "sourcePage": 88,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8841",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "Life preservers required for extended overwater operations are stored",
    "options": [
      "within easy reach of each passenger.",
      "under each occupant seat.",
      "within easy access of each seated occupant."
    ],
    "correctIndex": 2,
    "explanation": "Every aircraft flown in extended overwater operations must carry an approved life preserver for every occupant of the aircraft. A life preserver must be readily accessible to each seated occupant. (PLT437, AA.I.G.K5 ) — 14 CFR §135.167",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-89 · question 8841 · ATS, RTC",
    "sourceQuestionId": "8841",
    "sourceEdition": "2025–2026",
    "sourcePage": 89,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8843",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Part 135 Regulations",
    "materia": "operaciones",
    "text": "No person may takeoff an aircraft under IFR from an airport that has takeoff weather minimums but that is below landing minimums unless there is an alternate airport within",
    "options": [
      "1 hour at normal indicated airspeed of the departure airport.",
      "1 hour at normal cruise speed in still air of the departure airport.",
      "1 hour at normal cruise speed in still air with one engine operating."
    ],
    "correctIndex": 1,
    "explanation": "No person may takeoff in an aircraft under IFR from an airport where weather conditions are at or above takeoff minimums, but are below authorized IFR landing minimums unless there is an alternate airport within 1 hour’s flying time (in still air) of the airport of departure. (PLT459, AA.I.G.K5) — 14 CFR §135.217",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-89 · question 8843 · ATS, RTC",
    "sourceQuestionId": "8843",
    "sourceEdition": "2025–2026",
    "sourcePage": 89,
    "sourceCategories": [
      "ATS",
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8002",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "What minimum rest period must be provided for a pilot assigned to Helicopter Hospital Emergency Medical Evacuation Service (HEMES) who has been on duty for a 47 hour period?",
    "options": [
      "16 consecutive hours.",
      "14 consecutive hours.",
      "12 consecutive hours."
    ],
    "correctIndex": 2,
    "explanation": "Each pilot must be given a rest period upon completion of the HEMES assignment and prior to being assigned any further duty with the certificate holder of at least 12 consecutive hours for an assignment of less than 48 hours, and at least 16 consecutive hours for an assignment of more than 48 hours. (PLT409) — 14 CFR §135.271",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-89 · question 8002 · RTC",
    "sourceQuestionId": "8002",
    "sourceEdition": "2025–2026",
    "sourcePage": 89,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9043",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "What is a helicopter pilot’s responsibility when cleared to “air taxi” on the airport?",
    "options": [
      "Taxi direct to destination as quickly as possible.",
      "Taxi at hover altitude using taxiways.",
      "Taxi below 100 feet AGL avoiding other aircraft and personnel."
    ],
    "correctIndex": 2,
    "explanation": "Air taxi is the preferred method for helicopter ground movements on airports. Unless otherwise requested or instructed, pilots are expected to remain below 100 feet AGL. Helicopters should avoid overflight of other aircraft, vehicles, and personnel during air taxi operations. (PLT112) — AIM ¶4-3-17",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-89 · question 9043 · RTC",
    "sourceQuestionId": "9043",
    "sourceEdition": "2025–2026",
    "sourcePage": 89,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9336",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "What minimum instrument experience in the past 6 calendar months meets the second-in-command requirement to maintain IFR currency in a helicopter?",
    "options": [
      "6 hours in actual IFR conditions or 3 hours actual and 3 hours simulated IFR in a helicopter plus six instrument approaches.",
      "Holding procedures, intercepting and tracking courses using the navigation equipment, six instrument approaches logged in actual or simulated IFR in a helicopter, simulator or a flight training device.",
      "6 hours of actual or simulated time in a helicopter of the same type, plus six instrument approaches."
    ],
    "correctIndex": 1,
    "explanation": "For flight under IFR, the second-in-command must meet the recent instrument requirements of Part 61: No pilot may act as PIC under IFR unless the pilot has performed and logged, within the past six calendar months, at least six instrument approaches, holding procedures, and intercepting and tracking courses through the use of navigation systems in the appropriate category of aircraft for the instrument privileges sought. (PLT442) — 14 CFR §135.245 and §61.57",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-89 · question 9336 · RTC",
    "sourceQuestionId": "9336",
    "sourceEdition": "2025–2026",
    "sourcePage": 89,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9337",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "What minimum conditions are necessary for the instrument approaches required for second-in-command IFR currency in a helicopter?",
    "options": [
      "Six must be performed and logged under actual or simulated instrument conditions in a rotorcraft.",
      "Six must be performed and logged under actual or simulated instrument conditions; three must be in a rotorcraft, three may be in an airplane or an approved flight simulator.",
      "All must be made in a rotorcraft category of aircraft, or approved simulator, or flight training device and logged while under actual or simulated IFR conditions."
    ],
    "correctIndex": 2,
    "explanation": "For flight under IFR, the second-in-command must meet the recent instrument requirements of Part 61: No pilot may act as PIC under IFR unless the pilot has performed and logged, within the past six calendar months, at least six instrument approaches, holding procedures, and intercepting and tracking courses through the use of navigation systems in the appropriate category of aircraft for the instrument privileges sought. (PLT442) — 14 CFR §135.245 and §61.57",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-90 · question 9337 · RTC",
    "sourceQuestionId": "9337",
    "sourceEdition": "2025–2026",
    "sourcePage": 90,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9338",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "Within the past 6 months, a pilot has accomplished: Two approaches in a helicopter. Two approaches in an airplane. Two approaches in a glider. What additional instrument experience must the pilot obtain prior to acting as second in command (under 14 CFR part 135) on an IFR flight?",
    "options": [
      "Four approaches in an aircraft, approved training device, flight simulator (that is representative of the aircraft category), holding, intercepting and tracking courses using the navigation systems.",
      "Passes an instrument proficiency check in any category aircraft, approved simulator or training device.",
      "Holding, intercepting and tracking courses (using the navigation systems) in an aircraft, approved simulator or approved flight training device."
    ],
    "correctIndex": 0,
    "explanation": "For flight under IFR, the second-in-command must meet the recent instrument requirements of Part 61: No pilot may act as PIC under IFR unless the pilot has performed and logged, within the past six calendar months, at least six instrument approaches, holding procedures, and intercepting and tracking courses through the use of navigation systems in the appropriate category of aircraft for the instrument privileges sought. (PLT442) — 14 CFR §135.245 and §61.57",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-90 · question 9338 · RTC",
    "sourceQuestionId": "9338",
    "sourceEdition": "2025–2026",
    "sourcePage": 90,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9341",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "Within the past 6 months, a pilot has accomplished: Two approaches and intercepting, tracking courses using the navigation systems in a helicopter. Two approaches, missed approaches and holding in an approved airplane flight simulator. Two approaches and holding in an approved rotorcraft flight training device. What additional instrument experience, if any, must the pilot perform to act as second in command (under 14 CFR part 135) on an IFR helicopter flight?",
    "options": [
      "None.",
      "Two approaches in a rotorcraft category aircraft.",
      "Two approaches in either a helicopter or an airplane."
    ],
    "correctIndex": 1,
    "explanation": "For flight under IFR, the second-in-command must meet the recent instrument requirements of Part 61: No pilot may act as PIC under IFR unless the pilot has performed and logged, within the past six calendar months, at least six instrument approaches, holding procedures, and intercepting and tracking courses through the use of navigation systems in the appropriate category of aircraft for the instrument privileges sought. (PLT442) — 14 CFR §135.245, §61.57",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-90 · question 9341 · RTC",
    "sourceQuestionId": "9341",
    "sourceEdition": "2025–2026",
    "sourcePage": 90,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9366",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "Unless otherwise prescribed, what is the rule regarding altitude and course to be maintained by a helicopter during an off-airways IFR flight over non-mountainous terrain?",
    "options": [
      "1,000 feet above the highest obstacle within 4 nautical miles of course.",
      "2,000 feet above the highest obstacle within 5 statute miles of course.",
      "1,500 feet above the highest obstacle within a horizontal distance of 3 statute miles of course."
    ],
    "correctIndex": 0,
    "explanation": "In the case of operations over areas that are not designated as mountainous areas; no person may operate an aircraft under IFR below an altitude of 1,000 feet above the highest obstacle within a horizontal distance of 4 NM from the course to be flown. (PLT430) — 14 CFR §91.177",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-90 · question 9366 · RTC",
    "sourceQuestionId": "9366",
    "sourceEdition": "2025–2026",
    "sourcePage": 90,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9367",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "Unless otherwise prescribed, what is the rule regarding altitude and course to be maintained by a helicopter during an IFR off-airways flight over mountainous terrain?",
    "options": [
      "1,000 feet above the highest obstacle within a horizontal distance of 4 nautical miles.",
      "2,500 feet above the highest obstacle within a horizontal distance of 3 nautical miles of course.",
      "2,000 feet above the highest obstacle within a horizontal distance of 4 nautical miles."
    ],
    "correctIndex": 2,
    "explanation": "In the case of operations over areas designated as mountainous, no person may operate an aircraft under IFR below an altitude of 2,000 feet above the highest obstacle within a horizontal distance of 4 NM from the course to be flown. (PLT430) — 14 CFR §91.177",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-91 · question 9367 · RTC",
    "sourceQuestionId": "9367",
    "sourceEdition": "2025–2026",
    "sourcePage": 91,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9371",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "According to 14 CFR Part 91, when takeoff minimums are not prescribed for a civil airport, what are the takeoff minimums under IFR for a multiengine helicopter?",
    "options": [
      "1 SM visibility.",
      "1/2 SM visibility.",
      "1200 RVR."
    ],
    "correctIndex": 1,
    "explanation": "If takeoff minimums are not prescribed under Part 97, the takeoff minimums under IFR for helicopters are 1/2 SM visibility. (PLT459) — 14 CFR §91.175",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-91 · question 9371 · RTC",
    "sourceQuestionId": "9371",
    "sourceEdition": "2025–2026",
    "sourcePage": 91,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9372",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "According to 14 CFR Part 91, when takeoff minimums are not prescribed for a civil airport, what are the takeoff minimums under IFR for a single-engine helicopter?",
    "options": [
      "1/2 SM visibility.",
      "1 SM visibility.",
      "1200 RVR."
    ],
    "correctIndex": 0,
    "explanation": "If takeoff minimums are not prescribed under Part 97, the takeoff minimums under IFR for helicopters are 1/2 SM visibility. (PLT459) — 14 CFR §91.175",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-91 · question 9372 · RTC",
    "sourceQuestionId": "9372",
    "sourceEdition": "2025–2026",
    "sourcePage": 91,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9373",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "What minimum altitude should a helicopter maintain while en route?",
    "options": [
      "Over congested areas such as towns, no lower than 1,000 feet over the highest obstacle within a horizontal radius of 2,000 feet of the helicopter.",
      "That specifically prescribed by the air carrier for the operation.",
      "That prescribed by the Administrator."
    ],
    "correctIndex": 2,
    "explanation": "Each person operating a helicopter shall comply with routes or altitudes specifically prescribed for helicopters by the Administrator. (PLT430) — 14 CFR §91.119",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-91 · question 9373 · RTC",
    "sourceQuestionId": "9373",
    "sourceEdition": "2025–2026",
    "sourcePage": 91,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9414",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "In addition to a two-way radio capable of communicating with ATC on appropriate frequencies, which equipment is the helicopter required to have to operate within Class B airspace? (Letter of agreement not applicable.)",
    "options": [
      "A VOR or TACAN receiver.",
      "DME, a VOR or TACAN receiver, and an appropriate transponder beacon.",
      "An appropriate ATC transponder."
    ],
    "correctIndex": 2,
    "explanation": "An operable ATC transponder is required to operate all aircraft in Class B airspace except for helicopters operated at or below 1,000 feet AGL under the terms of a letter of agreement. (PLT405) — 14 CFR §91.131, 91.215",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-91 · question 9414 · RTC",
    "sourceQuestionId": "9414",
    "sourceEdition": "2025–2026",
    "sourcePage": 91,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_9415",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "Which of the following is a transponder requirement for helicopter operations?",
    "options": [
      "Helicopters with a certified gross weight of more than 12,500 pounds that are engaged in commercial operations are required to be equipped with operable ATC transponders.",
      "Helicopters may not be operated at or below 1,000 feet AGL within Class B airspace without an operable ATC transponder.",
      "Operable ATC transponders are required when operating helicopters within Class D airspace at night under special VFR."
    ],
    "correctIndex": 1,
    "explanation": "An operable ATC transponder is required to operate all aircraft in Class B airspace except as authorized by ATC. (PLT405) — 14 CFR §91.215",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-91 · question 9415 · RTC",
    "sourceQuestionId": "9415",
    "sourceEdition": "2025–2026",
    "sourcePage": 91,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  },
  {
    "id": "q_la_ATP_2026_8975",
    "fuente": "ATP",
    "capitulo": 1,
    "capituloTitulo": "Regulations",
    "seccion": "Helicopter Regulations",
    "materia": "operaciones",
    "text": "Which of the following are required for a helicopter ILS approach with a decision height lower than 200 feet HAT?",
    "options": [
      "Special aircrew training and aircraft certification.",
      "Both a marker beacon and a radio altimeter.",
      "ATP helicopter certificate and CAT II certification."
    ],
    "correctIndex": 0,
    "explanation": "Approaches with a HAT below 200 feet are annotated with the note: “Special Aircraft & Aircraft Certification Required” since the FAA must approve the helicopter and its avionics, and the flight crew must have the required experience, training, and checking. (PLT356) — FAA-H-8083-16",
    "cite": "ASA Airline Transport Pilot Test Prep 2025–2026 · Chapter 1 Regulations · p. 1-92 · question 8975 · RTC",
    "sourceQuestionId": "8975",
    "sourceEdition": "2025–2026",
    "sourcePage": 92,
    "sourceCategories": [
      "RTC"
    ],
    "status": "publicada",
    "source": "import",
    "imagenes": []
  }
]
$questions$::jsonb;
  v_missing text;
BEGIN
  IF jsonb_array_length(v_questions) <> 363 THEN
    RAISE EXCEPTION 'Expected 363 Regulations questions';
  END IF;

  SELECT string_agg(required.file, ', ' ORDER BY required.file) INTO v_missing
  FROM (
    SELECT DISTINCT jsonb_array_elements_text(q->'imagenes') AS file
    FROM jsonb_array_elements(v_questions) q
  ) required
  WHERE NOT EXISTS (
    SELECT 1 FROM storage.objects o
    WHERE o.bucket_id = 'atp-images' AND o.name = required.file
  );
  IF v_missing IS NOT NULL THEN
    RAISE EXCEPTION 'Upload missing ATP figures before replacing questions: %', v_missing;
  END IF;

  UPDATE public.content c
  SET data = c.data || jsonb_build_object(
      'status', 'oculta', 'replacedByEdition', '2025–2026', 'updatedAt', now()::text
    ), updated_at = now()
  WHERE c.collection = 'questions'
    AND c.data->>'fuente' = 'ATP'
    AND c.data->>'capitulo' = '1'
    AND NOT EXISTS (
      SELECT 1 FROM jsonb_array_elements(v_questions) q WHERE q->>'id' = c.id
    );

  INSERT INTO public.content(collection, id, data, updated_at)
  SELECT 'questions', q->>'id', q || jsonb_build_object(
    'createdAt', COALESCE(existing.data->>'createdAt', now()::text),
    'updatedAt', now()::text
  ), now()
  FROM jsonb_array_elements(v_questions) q
  LEFT JOIN public.content existing
    ON existing.collection = 'questions' AND existing.id = q->>'id'
  ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data, updated_at = EXCLUDED.updated_at;

  IF (
    SELECT count(*) FROM public.content
    WHERE collection = 'questions' AND data->>'fuente' = 'ATP'
      AND data->>'capitulo' = '1' AND data->>'status' = 'publicada'
  ) <> 363 THEN
    RAISE EXCEPTION 'Regulations replacement count failed; transaction rolled back';
  END IF;
END;
$migration$;
