# 📁 Project Folder Structure Guide

**Purpose:** Organize development, testing, and documentation files separately from production code.

---

## 🏗️ RECOMMENDED FOLDER STRUCTURE

```
Egec-CRM/
├── scripts/                    ✅ PRODUCTION SCRIPTS (Deployed)
│   ├── production/            # Essential production scripts
│   │   ├── seedSystemSettings.js
│   │   ├── seedUniversities.js
│   │   ├── seed153Universities.js
│   │   ├── seedAllUniversitiesNew.js
│   │   ├── createIndexes.js
│   │   └── universities153.json
│   │
│   └── maintenance/           # Optional maintenance scripts
│       ├── updateUniversitiesComplete.js
│       ├── updateStudyDestinations.js
│       ├── updateStudyTimes.js
│       ├── updateSources.js
│       ├── updateTo153Universities.js
│       ├── verifyStudyDestinations.js
│       └── parseInfoFile.js
│
├── dev/                       ⚠️ NOT DEPLOYED (In .gitignore)
│   ├── docs/                  # Development documentation
│   │   ├── database/
│   │   ├── architecture/
│   │   ├── features/
│   │   └── security/
│   │
│   ├── testing/              # Testing scripts & data
│   │   ├── performance/
│   │   ├── api/
│   │   └── generators/
│   │
│   ├── diagrams/             # Visual diagrams & charts
│   │   ├── er-diagrams/
│   │   ├── flowcharts/
│   │   └── ui-mockups/
│   │
│   ├── migrations/           # One-time migration scripts
│   │   └── archive/
│   │
│   └── notes/                # Development notes & research
│
├── docs/                      ✅ PRODUCTION DOCS (Deployed)
│   ├── README.md
│   ├── CRM_GUIDE.md
│   ├── DEPLOYMENT_READY.md
│   ├── VERCEL_ENV_SETUP.md
│   └── database/
│       ├── SIMPLE_ER_DIAGRAM.md
│       ├── COMPLETE_ER_DIAGRAM.md
│       └── ER_QUICK_REFERENCE.md
│
├── pages/                     ✅ APPLICATION CODE (Deployed)
├── components/                ✅ COMPONENTS (Deployed)
├── lib/                       ✅ UTILITIES (Deployed)
├── models/                    ✅ DATABASE MODELS (Deployed)
├── styles/                    ✅ STYLES (Deployed)
├── public/                    ✅ PUBLIC ASSETS (Deployed)
└── package.json               ✅ DEPENDENCIES (Deployed)
```

---

## 📂 FOLDER PURPOSES

### ✅ **scripts/** - Production Scripts
**Status:** DEPLOYED  
**Purpose:** Essential scripts needed for production setup and maintenance

#### **scripts/production/** (Required)
- `seedSystemSettings.js` - Initialize system configuration
- `seedUniversities.js` - Load university data
- `seed153Universities.js` - Load 153 universities
- `seedAllUniversitiesNew.js` - Complete university seeding
- `createIndexes.js` - Database performance optimization
- `universities153.json` - University database

#### **scripts/maintenance/** (Optional)
- `updateUniversitiesComplete.js` - Update university data
- `updateStudyDestinations.js` - Update study destinations
- `updateStudyTimes.js` - Update study times
- `updateSources.js` - Update source data
- `updateTo153Universities.js` - Expand to 153 universities
- `verifyStudyDestinations.js` - Verify data integrity
- `parseInfoFile.js` - Import data from info files

---

### ⚠️ **dev/** - Development Files
**Status:** NOT DEPLOYED (In .gitignore)  
**Purpose:** Development, testing, documentation, and temporary files

#### **dev/docs/** - Development Documentation
Store all development notes, explanations, and technical documentation:
- Database design documents
- Architecture decisions
- Feature specifications
- Security audit reports
- Performance testing reports

**Example files that were deleted but can go here:**
- BACKEND_TECHNOLOGY_STACK.md
- CUSTOMER_DEGREE_DATA_STRUCTURE.md
- MULTI_AGENT_WORKFLOW_EXPLAINED.md
- PERFORMANCE_TESTING_1M_CUSTOMERS.md
- SECURITY_AUDIT_REPORT.md

#### **dev/testing/** - Testing Scripts
Store all testing, debugging, and performance testing scripts:
- Performance test scripts
- API testing tools
- Database verification scripts
- Test data generators

**Example files that were deleted:**
- testApiResponse.js
- testQueryPerformance.js
- generateTestCustomers.js
- checkLatestStatus.js
- checkSpecificCustomer.js

#### **dev/diagrams/** - Visual Diagrams
Store all visual documentation:
- ER diagrams (HTML/image versions)
- System flowcharts
- UI mockups
- Architecture diagrams

**Example files:**
- customer-degree-diagrams.html (deleted)

#### **dev/migrations/** - One-Time Migrations
Store migration scripts that have already been executed:
- migrateAssignedAgents.js (deleted)
- migrateLatestCounselorStatus.js (deleted)
- migrateToEgecCRM.js (deleted)
- fixDatabaseStructure.js (deleted)

#### **dev/notes/** - Development Notes
Store temporary notes, research, and brainstorming:
- Feature ideas
- Bug investigation notes
- Research findings
- Meeting notes

---

### ✅ **docs/** - Production Documentation
**Status:** DEPLOYED  
**Purpose:** User-facing documentation and deployment guides

**Essential files:**
- README.md - Project overview
- CRM_GUIDE.md - Complete user guide
- DEPLOYMENT_READY.md - Deployment checklist
- VERCEL_ENV_SETUP.md - Environment setup
- Database ER diagrams (for reference)

---

## 🔒 SECURITY: .gitignore Configuration

Add these lines to `.gitignore` to prevent development files from being deployed:

```gitignore
# Development files (NOT for production)
/dev/
/dev/**/*

# Temporary development files
*.local.md
*.draft.md
*.temp.*
/temp/
/tmp/

# Development databases
*.db
*.sqlite
*.sqlite3

# Development environment
.env.development
.env.local
```

---

## 🚀 DEPLOYMENT BEHAVIOR

### What Gets Deployed:
✅ `scripts/` - Production scripts  
✅ `docs/` - Production documentation  
✅ `pages/` - Application code  
✅ `components/` - React components  
✅ `lib/` - Utility libraries  
✅ `models/` - Database models  
✅ `styles/` - CSS styles  
✅ `public/` - Static assets  
✅ `package.json` - Dependencies  

### What NEVER Gets Deployed:
❌ `dev/` - Development files  
❌ `node_modules/` - Dependencies (installed on server)  
❌ `.env` - Environment variables  
❌ `.next/` - Build cache  
❌ `*.log` - Log files  

---

## 📊 SCRIPT CATEGORIES

### Category 1: Essential Production Scripts
**Required for initial setup:**
```bash
npm run seed:crm  # Runs all essential seeding
```

Scripts included:
- seedSystemSettings.js
- seedUniversities.js
- createIndexes.js

### Category 2: Maintenance Scripts
**Run manually when needed:**
- Update university data
- Verify data integrity
- Import external data
- Database maintenance

### Category 3: Development/Testing Scripts
**NEVER run in production:**
- Performance testing
- Test data generation
- API debugging
- Database inspection

### Category 4: Migration Scripts
**Run once, then archive:**
- Schema migrations
- Data structure updates
- One-time fixes

---

## 🎯 BEST PRACTICES

### DO ✅
1. Keep production scripts in `scripts/`
2. Store development files in `dev/`
3. Add `dev/` to `.gitignore`
4. Document script purposes
5. Separate one-time migrations
6. Version control production docs

### DON'T ❌
1. Put test scripts in `scripts/`
2. Commit sensitive data
3. Mix development and production files
4. Leave migration scripts in root
5. Deploy testing databases
6. Include personal notes in commits

---

## 🔧 HOW TO USE THIS STRUCTURE

### For New Development Files:
```bash
# Create in dev folder
dev/docs/new-feature-spec.md
dev/testing/test-new-api.js
dev/diagrams/new-feature-flow.html
```

### For Production Scripts:
```bash
# Keep in scripts folder
scripts/production/newSeed.js
scripts/maintenance/updateData.js
```

### For Documentation:
```bash
# User-facing docs → docs/
docs/USER_GUIDE.md

# Technical docs → dev/docs/
dev/docs/TECHNICAL_ARCHITECTURE.md
```

---

## ⚠️ IMPORTANT NOTES

1. **The `dev/` folder is for YOUR development work**
   - Never pushed to production
   - Can contain sensitive data
   - Can be messy - it's your workspace

2. **The `scripts/` folder is for PRODUCTION needs**
   - Clean, documented code
   - No sensitive data
   - Tested and verified

3. **The `docs/` folder is for END USERS**
   - Clear, simple documentation
   - Deployment guides
   - User manuals

4. **Vercel Deployment ignores:**
   - Everything in `.gitignore`
   - The `dev/` folder (once added to .gitignore)
   - Any `*.local.*` files

---

## 📝 MIGRATION CHECKLIST

To implement this structure:

- [ ] Create folder structure
- [ ] Move production scripts to `scripts/production/`
- [ ] Move maintenance scripts to `scripts/maintenance/`
- [ ] Update `.gitignore` to exclude `dev/`
- [ ] Update `package.json` scripts if needed
- [ ] Test that seeding still works
- [ ] Verify deployment doesn't include `dev/`
- [ ] Document any custom scripts

---

**Status:** Recommended structure for secure, organized development  
**Security:** Development files never deployed  
**Maintainability:** Clear separation of concerns
