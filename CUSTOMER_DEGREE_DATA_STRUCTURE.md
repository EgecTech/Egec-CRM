# Customer Data Structure by Degree Type 📊

**Complete visual guide to customer data organization in the CRM**

---

## 🎓 Overview

Each customer in the system has a **common base structure** plus **degree-specific fields** that vary based on their chosen program (Bachelor, Master, or PhD).

---

## 📋 Complete Customer Data Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        CUSTOMER DOCUMENT                         │
│                      (models/Customer.js)                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                ┌────────────────┼────────────────┐
                │                │                │
                ▼                ▼                ▼
        ┌───────────┐    ┌──────────┐    ┌──────────┐
        │  COMMON   │    │  DEGREE  │    │  SYSTEM  │
        │   DATA    │    │ SPECIFIC │    │   DATA   │
        └───────────┘    └──────────┘    └──────────┘
```

---

## 🔵 1. COMMON DATA (All Degrees)

### Basic Information
```javascript
{
  customerNumber: "CUS-2026-0001",              // Auto-generated
  
  basicData: {
    customerName: "أحمد محمد علي",              // Full name
    customerEmail: "ahmed@example.com",
    customerPhone: "+966501234567",
    customerWhatsapp: "+966501234567",
    customerGender: "male",                     // male, female
    customerCity: "الرياض",
    customerNationality: "Saudi Arabia"
  },
  
  desiredProgram: {
    degreeType: "bachelor",                     // bachelor, master, phd
    desiredSpecialization: "Computer Science",
    studyDestination: "Turkey",
    studyTime: "2024/2025",
    desiredUniversity: "Istanbul Technical University"
  }
}
```

---

## 🎓 2. DEGREE-SPECIFIC DATA

### 📘 BACHELOR DEGREE

```
┌──────────────────────────────────────────────────────────┐
│              BACHELOR (بكالوريوس) DATA                    │
└──────────────────────────────────────────────────────────┘

basicData: {
  // Common fields above +
  customerBirthdate: "2000-05-15"              // Date of birth
}

bachelor: {
  // High School Information
  highSchoolType: "Scientific",                // Scientific, Literary, Islamic, Commercial
  highSchoolCountry: "Saudi Arabia",
  graduationYear: "2023",
  gpaType: "percentage",                       // percentage, gpa4, gpa5
  gpa: "95.5",
  
  // Certifications
  hasCertificates: true,
  certificateType: "IELTS",                    // IELTS, TOEFL, SAT, None
  certificateScore: "6.5",
  certificateDate: "2023-06-15"
}

desiredProgram: {
  degreeType: "bachelor",
  desiredSpecialization: "Computer Engineering",
  studyDestination: "Turkey",
  studyTime: "2024/2025",
  desiredUniversity: "Istanbul Technical University",
  programLanguage: "English"                   // English, Turkish, Arabic
}
```

**Bachelor Visual Structure:**
```
Bachelor Student
├── Personal Info
│   ├── Name
│   ├── Email
│   ├── Phone
│   ├── WhatsApp
│   ├── Gender
│   ├── Birthdate ⭐
│   ├── City
│   └── Nationality
│
├── High School Info ⭐
│   ├── School Type (Scientific/Literary/etc)
│   ├── School Country
│   ├── Graduation Year
│   ├── GPA Type
│   └── GPA Score
│
├── Certifications ⭐
│   ├── Certificate Type (IELTS/TOEFL/SAT)
│   ├── Score
│   └── Date
│
└── Desired Program
    ├── Specialization
    ├── Study Destination
    ├── Study Time
    ├── University
    └── Program Language
```

---

### 📕 MASTER DEGREE

```
┌──────────────────────────────────────────────────────────┐
│               MASTER (ماجستير) DATA                      │
└──────────────────────────────────────────────────────────┘

basicData: {
  // Common fields above (NO birthdate)
}

master: {
  // Bachelor Degree Information
  bachelorUniversity: "King Saud University",
  bachelorMajor: "Computer Science",
  bachelorCountry: "Saudi Arabia",
  bachelorGraduationYear: "2023",
  bachelorGpaType: "gpa5",                     // percentage, gpa4, gpa5
  bachelorGpa: "4.5",
  
  // Research Interest
  researchInterest: "Artificial Intelligence and Machine Learning",
  preferredStudyType: "thesis",                // thesis, coursework, mixed
  
  // Certifications
  hasCertificates: true,
  certificateType: "IELTS",                    // IELTS, TOEFL, GRE, GMAT, None
  certificateScore: "7.0",
  certificateDate: "2023-08-20"
}

desiredProgram: {
  degreeType: "master",
  desiredSpecialization: "Artificial Intelligence",
  studyDestination: "UK",
  studyTime: "2024/2025",
  desiredUniversity: "University of Oxford",
  programLanguage: "English"
}
```

**Master Visual Structure:**
```
Master Student
├── Personal Info
│   ├── Name
│   ├── Email
│   ├── Phone
│   ├── WhatsApp
│   ├── Gender
│   ├── City
│   └── Nationality (NO Birthdate)
│
├── Bachelor Degree Info ⭐
│   ├── University
│   ├── Major
│   ├── Country
│   ├── Graduation Year
│   ├── GPA Type
│   └── GPA Score
│
├── Research & Study Type ⭐
│   ├── Research Interest
│   └── Preferred Study Type (Thesis/Coursework)
│
├── Certifications ⭐
│   ├── Certificate Type (IELTS/TOEFL/GRE/GMAT)
│   ├── Score
│   └── Date
│
└── Desired Program
    ├── Specialization
    ├── Study Destination
    ├── Study Time
    ├── University
    └── Program Language
```

---

### 📗 PHD DEGREE

```
┌──────────────────────────────────────────────────────────┐
│                 PHD (دكتوراه) DATA                       │
└──────────────────────────────────────────────────────────┘

basicData: {
  // Common fields above (NO birthdate)
}

phd: {
  // Bachelor Degree Information
  bachelorUniversity: "King Saud University",
  bachelorMajor: "Computer Science",
  bachelorCountry: "Saudi Arabia",
  bachelorGraduationYear: "2019",
  bachelorGpaType: "gpa5",
  bachelorGpa: "4.3",
  
  // Master Degree Information ⭐
  masterUniversity: "King Abdullah University",
  masterMajor: "Artificial Intelligence",
  masterCountry: "Saudi Arabia",
  masterGraduationYear: "2023",
  masterGpaType: "gpa4",
  masterGpa: "3.8",
  masterThesisTitle: "Deep Learning Applications in Healthcare",
  
  // Research Proposal ⭐
  researchProposal: "Developing AI systems for early disease detection...",
  researchInterest: "Medical AI and Computer Vision",
  potentialSupervisor: "Dr. John Smith",
  hasPublications: true,
  publicationsCount: 3,
  publicationsList: "1. Paper in IEEE... 2. Paper in ACM...",
  
  // Certifications
  hasCertificates: true,
  certificateType: "IELTS",
  certificateScore: "7.5",
  certificateDate: "2023-09-10"
}

desiredProgram: {
  degreeType: "phd",
  desiredSpecialization: "Medical AI",
  studyDestination: "USA",
  studyTime: "2024/2025",
  desiredUniversity: "Stanford University",
  programLanguage: "English"
}
```

**PhD Visual Structure:**
```
PhD Student
├── Personal Info
│   ├── Name
│   ├── Email
│   ├── Phone
│   ├── WhatsApp
│   ├── Gender
│   ├── City
│   └── Nationality (NO Birthdate)
│
├── Bachelor Degree Info ⭐
│   ├── University
│   ├── Major
│   ├── Country
│   ├── Graduation Year
│   ├── GPA Type
│   └── GPA Score
│
├── Master Degree Info ⭐⭐
│   ├── University
│   ├── Major
│   ├── Country
│   ├── Graduation Year
│   ├── GPA Type
│   ├── GPA Score
│   └── Thesis Title ⭐
│
├── Research Information ⭐⭐
│   ├── Research Proposal
│   ├── Research Interest
│   ├── Potential Supervisor
│   ├── Has Publications?
│   ├── Publications Count
│   └── Publications List
│
├── Certifications
│   ├── Certificate Type (IELTS/TOEFL/GRE)
│   ├── Score
│   └── Date
│
└── Desired Program
    ├── Specialization
    ├── Study Destination
    ├── Study Time
    ├── University
    └── Program Language
```

---

## 🔄 3. ASSIGNMENT & STATUS (All Degrees)

### Agent Assignment System
```javascript
assignment: {
  // Primary Agent
  assignedAgentId: ObjectId("..."),
  assignedAgentName: "محمد أحمد",
  assignedAt: "2024-01-15T10:30:00Z",
  
  // Multi-Agent System ⭐
  assignedAgents: [
    {
      agentId: ObjectId("..."),
      agentName: "محمد أحمد",
      agentEmail: "mohamed@crm.com",
      isActive: true,
      assignedAt: "2024-01-15T10:30:00Z",
      
      // Per-Agent Status ⭐
      counselorStatus: "مهتم جدا",              // Independent for each agent
      lastStatusUpdate: "2024-01-20T14:30:00Z",
      lastStatusBy: "محمد أحمد"
    },
    {
      agentId: ObjectId("..."),
      agentName: "فاطمة علي",
      agentEmail: "fatima@crm.com",
      isActive: true,
      assignedAt: "2024-01-18T09:00:00Z",
      
      counselorStatus: "متجاوب",                // Different status - independent!
      lastStatusUpdate: "2024-01-22T11:15:00Z",
      lastStatusBy: "فاطمة علي"
    }
  ]
}
```

**Agent Assignment Flow:**
```
Customer Created
     │
     ├──> Assigned to Agent 1 (Primary)
     │    └──> Agent 1: counselorStatus = "جديد"
     │
     ├──> Admin adds Agent 2
     │    ├──> Agent 1: counselorStatus = "مهتم جدا" (unchanged)
     │    └──> Agent 2: counselorStatus = null (starts fresh)
     │
     └──> Both agents work independently
          ├──> Agent 1 sees: counselorStatus = "مهتم جدا"
          └──> Agent 2 sees: counselorStatus = null
```

---

## 📊 4. EVALUATION & COMMUNICATION

### Common Fields (All Degrees)
```javascript
evaluation: {
  currentStage: "Initial Contact",
  notes: "Student is highly motivated...",
  tags: ["High Priority", "Scholarship Candidate"]
}

communication: {
  preferredMethod: "whatsapp",                 // phone, email, whatsapp
  bestTimeToContact: "Evening",
  timezone: "Asia/Riyadh",
  communicationNotes: "Prefers WhatsApp after 6 PM"
}

documents: {
  hasPassport: true,
  hasTranscript: true,
  hasRecommendationLetters: false,
  documentsList: ["Passport Copy", "High School Certificate"]
}
```

---

## 🎯 5. COMPARISON TABLE

| Feature | Bachelor | Master | PhD |
|---------|----------|--------|-----|
| **Birthdate** | ✅ Required | ❌ Not stored | ❌ Not stored |
| **High School Info** | ✅ Yes | ❌ No | ❌ No |
| **Bachelor Info** | ❌ No | ✅ Yes | ✅ Yes |
| **Master Info** | ❌ No | ❌ No | ✅ Yes |
| **Thesis Title** | ❌ No | ❌ No | ✅ Yes (Master's) |
| **Research Proposal** | ❌ No | ✅ Basic | ✅ Detailed |
| **Publications** | ❌ No | ❌ No | ✅ Yes |
| **Potential Supervisor** | ❌ No | ❌ No | ✅ Yes |
| **Certificates** | ✅ IELTS/TOEFL/SAT | ✅ IELTS/TOEFL/GRE/GMAT | ✅ IELTS/TOEFL/GRE |
| **Multi-Agent Support** | ✅ Yes | ✅ Yes | ✅ Yes |
| **Per-Agent Status** | ✅ Yes | ✅ Yes | ✅ Yes |

---

## 🔄 6. DATA FLOW DIAGRAM

```
User Input
    │
    ├──> Select Degree Type
    │    ├──> Bachelor
    │    │    ├──> Show: Birthdate field
    │    │    ├──> Show: High School section
    │    │    └──> Show: SAT option
    │    │
    │    ├──> Master
    │    │    ├──> Hide: Birthdate field
    │    │    ├──> Show: Bachelor Degree section
    │    │    ├──> Show: Research Interest
    │    │    └──> Show: GRE/GMAT options
    │    │
    │    └──> PhD
    │         ├──> Hide: Birthdate field
    │         ├──> Show: Bachelor Degree section
    │         ├──> Show: Master Degree section
    │         ├──> Show: Research Proposal
    │         ├──> Show: Publications
    │         └──> Show: Potential Supervisor
    │
    └──> Save to Database
         └──> Customer Document Created
```

---

## 📈 7. DATABASE STATISTICS VIEW

### Degree Distribution
```
Total Customers: 15
├── Bachelor: 3 (20%)
├── Master: 6 (40%)
└── PhD: 6 (40%)
```

### Data Completeness by Degree
```
Bachelor Students:
├── Has all required fields: 100%
├── Has optional certificates: 67%
└── Has documents uploaded: 33%

Master Students:
├── Has all required fields: 100%
├── Has research interest: 83%
├── Has optional certificates: 83%
└── Has documents uploaded: 50%

PhD Students:
├── Has all required fields: 100%
├── Has research proposal: 83%
├── Has publications: 67%
├── Has potential supervisor: 50%
└── Has documents uploaded: 67%
```

---

## 🔍 8. SEARCH & FILTER CAPABILITY

### Available Filters
```javascript
// All Degrees
✅ Degree Type (bachelor, master, phd)
✅ Specialization
✅ Study Destination
✅ Study Time
✅ University
✅ Agent Assignment (Primary/All Agents)
✅ Counselor Status (Per Agent)
✅ Creation Date Range

// Bachelor Only
✅ High School Type
✅ Graduation Year
✅ GPA Range

// Master Only
✅ Bachelor University
✅ Bachelor Major
✅ Study Type (Thesis/Coursework)

// PhD Only
✅ Has Publications
✅ Publication Count
✅ Master University
```

---

## 💾 9. DATABASE SCHEMA SUMMARY

```javascript
{
  // Unique Identifiers
  _id: ObjectId,
  customerNumber: String,
  
  // Common to ALL degrees
  basicData: Object,
  desiredProgram: Object,
  assignment: Object,
  evaluation: Object,
  communication: Object,
  documents: Object,
  
  // Degree-specific (only ONE will be populated)
  bachelor: Object || undefined,
  master: Object || undefined,
  phd: Object || undefined,
  
  // System fields
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean
}
```

---

## 🎯 KEY INSIGHTS

### 1. **Conditional Fields**
- Only ONE degree object (`bachelor`, `master`, or `phd`) exists per customer
- The system shows/hides fields dynamically based on `degreeType`

### 2. **Multi-Agent Independence**
- Each agent has their own `counselorStatus` for the same customer
- Agents don't see each other's updates
- Reports can show status per agent or aggregated

### 3. **Progressive Complexity**
- Bachelor: Simplest (High School → University)
- Master: Moderate (Bachelor → Master)
- PhD: Most Complex (Bachelor → Master → PhD + Research)

### 4. **Smart Validation**
- Required fields vary by degree type
- GPA types adapt to country standards
- Certificate options change per degree level

---

## 🚀 PRACTICAL EXAMPLES

### Example 1: Bachelor Student
```javascript
{
  customerNumber: "CUS-2026-0001",
  basicData: { customerName: "أحمد محمد", customerBirthdate: "2000-05-15" },
  desiredProgram: { degreeType: "bachelor" },
  bachelor: { highSchoolType: "Scientific", gpa: "95" },
  master: undefined,  // Not populated
  phd: undefined      // Not populated
}
```

### Example 2: PhD Student with Multi-Agents
```javascript
{
  customerNumber: "CUS-2026-0015",
  basicData: { customerName: "فاطمة علي" },  // NO birthdate
  desiredProgram: { degreeType: "phd" },
  bachelor: undefined,  // Not populated
  master: undefined,    // Not populated
  phd: {
    bachelorUniversity: "...",
    masterUniversity: "...",
    researchProposal: "...",
    hasPublications: true
  },
  assignment: {
    assignedAgents: [
      { agentName: "محمد", counselorStatus: "بيجهز الاوراق" },
      { agentName: "سارة", counselorStatus: "مهتم جدا" }
    ]
  }
}
```

---

## ✅ SUMMARY

**Your CRM uses a flexible, degree-adaptive data model:**

1. ✅ **One Model, Three Paths** - Same customer model adapts to all degrees
2. ✅ **Smart Field Display** - Only relevant fields shown per degree
3. ✅ **Independent Agent Tracking** - Each agent manages their own status
4. ✅ **Progressive Complexity** - Data requirements increase with degree level
5. ✅ **Optimized Storage** - Only store what's needed per degree type

**This design ensures:**
- 🚀 Fast queries (indexed by degree type)
- 💾 Efficient storage (no empty fields)
- 🎯 Role-based access (agents see only their status)
- 📊 Flexible reporting (aggregate or per-agent)
- 🔄 Easy maintenance (one model to rule them all)

---

**Your system is production-ready with excellent data organization! 🎉**
