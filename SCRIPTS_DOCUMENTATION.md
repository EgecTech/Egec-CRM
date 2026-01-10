# Scripts Documentation 📜

**EduGate CRM - Automation, Migration, Testing & Maintenance Scripts**

---

## 📋 Overview

The `scripts/` folder contains utility scripts for:
- 🗄️ **Database Seeding** - Initial data setup
- 🔄 **Data Migration** - Schema updates & data transformation
- 🧪 **Testing** - Performance & load testing
- ✅ **Validation** - Environment & data verification
- 🛠️ **Maintenance** - Database optimization & cleanup

---

## 📊 Script Categories

```
scripts/
├── 🌱 Seeding Scripts       (5 scripts)
├── 🔄 Migration Scripts     (5 scripts)
├── 🧪 Testing Scripts       (2 scripts)
├── ✅ Validation Scripts    (3 scripts)
├── 🛠️ Maintenance Scripts   (3 scripts)
└── 📦 Data Files           (1 file)
```

---

## 🌱 1. SEEDING SCRIPTS
### Purpose: Initial data setup and system configuration

### **seedSystemSettings.js**
**Purpose:** Seed initial system settings and dropdown values

**What it does:**
- Creates `SystemSetting` collection
- Populates dropdown options for:
  - Sources (مصادر العملاء)
  - Study Destinations (الوجهات الدراسية)
  - Study Times (أوقات الدراسة)
  - Counselor Statuses (حالات المرشد)
  - Interest Rates (معدلات الاهتمام)
  - Overall Ratings (التقديرات)
  - Study Systems (أنظمة الدراسة)
  - Countries & Nationalities

**Usage:**
```bash
npm run seed:crm
```

**When to use:**
- First time setup
- After database reset
- When adding new system settings

---

### **seedUniversities.js**
**Purpose:** Seed university data with colleges

**What it does:**
- Loads universities from database
- Creates university documents
- Associates colleges with universities
- Creates indexes

**Usage:**
```bash
npm run seed:universities
```

**Data includes:**
- University name
- Location
- Colleges list
- Programs offered

---

### **seed153Universities.js**
**Purpose:** Seed 153 Egyptian universities with complete data

**What it does:**
- Loads data from `universities153.json`
- Creates 153 university records
- Includes detailed college information
- Sets up cascading dropdowns

**Usage:**
```bash
npm run seed:new-universities
```

**Data source:** `scripts/universities153.json`

---

### **updateStudyDestinations.js**
**Purpose:** Update study destination values in system settings

**What it does:**
- Updates study destination dropdown
- Sets default values
- Validates data integrity

**Usage:**
```bash
npm run seed:destinations
```

**Destinations:**
- Egypt (Default)
- Saudi Arabia
- UAE
- Turkey
- UK
- USA
- Canada
- Australia
- Germany
- France

---

### **updateStudyTimes.js**
**Purpose:** Update study time values in system settings

**What it does:**
- Updates study time dropdown
- Sets academic year options
- Configures semester options

**Usage:**
```bash
node scripts/updateStudyTimes.js
```

---

## 🔄 2. MIGRATION SCRIPTS
### Purpose: Schema updates and data transformation

### **migrateToEgecCRM.js** ⭐ **IMPORTANT**
**Purpose:** Complete migration from Information System to CRM

**What it does:**
- Transforms old data structure to new CRM schema
- Migrates customer records
- Updates field mappings
- Preserves historical data
- Creates backup before migration

**Key Transformations:**
```javascript
Old Structure → New Structure
─────────────────────────────
basicInfo     → basicData
qualification → currentQualification
desired       → desiredProgram
```

**Usage:**
```bash
npm run migrate:db
```

**⚠️ WARNING:** Always backup database before running!

---

### **migrateAssignedAgents.js** ⭐ **CRITICAL**
**Purpose:** Migrate to multi-agent assignment system

**What it does:**
- Converts single-agent to multi-agent structure
- Creates `assignedAgents` array
- Migrates `counselorStatus` per agent
- Preserves assignment history
- Updates all customer records

**Migration:**
```javascript
Before:
assignment: {
  assignedAgentId: ObjectId,
  assignedAgentName: "Ahmed"
}
evaluation: {
  counselorStatus: "مهتم جدا"
}

After:
assignment: {
  assignedAgentId: ObjectId,
  assignedAgentName: "Ahmed",
  assignedAgents: [
    {
      agentId: ObjectId,
      agentName: "Ahmed",
      counselorStatus: "مهتم جدا",  // Moved here
      isActive: true
    }
  ]
}
```

**Usage:**
```bash
npm run migrate:agents
```

**Status:** ✅ Already executed (you should have run this)

---

### **migrateDegreeTypes.js**
**Purpose:** Migrate degree type field structure

**What it does:**
- Updates degree type enum values
- Standardizes bachelor/master/phd
- Validates all customer records
- Reports migration statistics

**Usage:**
```bash
node scripts/migrateDegreeTypes.js
```

---

### **fixDatabaseStructure.js**
**Purpose:** Fix schema inconsistencies and data quality issues

**What it does:**
- Validates required fields
- Fixes missing default values
- Repairs broken references
- Cleans invalid data
- Reports issues found

**Common Fixes:**
- Sets default `degreeType`
- Fixes empty ObjectIds
- Repairs broken agent assignments
- Validates phone/email formats

**Usage:**
```bash
npm run fix:db
```

**When to use:**
- After major updates
- When data integrity issues occur
- Regular maintenance (monthly)

---

### **updateTo153Universities.js**
**Purpose:** Update existing system to use 153 universities

**What it does:**
- Updates university references
- Migrates customer data
- Updates dropdown options
- Preserves existing assignments

**Usage:**
```bash
npm run update:153universities
```

---

## 🧪 3. TESTING SCRIPTS
### Purpose: Performance testing and load testing

### **generateTestCustomers.js** ⭐ **PERFORMANCE TESTING**
**Purpose:** Generate test data for performance testing

**What it does:**
- Generates up to 1,000,000 test customers
- Batch inserts (10,000 at a time)
- Creates realistic test data
- Distributes across all degree types
- Progress tracking with ETA

**Configuration:**
```javascript
TOTAL_CUSTOMERS = 1,000,000
BATCH_SIZE = 10,000
DEGREE_TYPES = ['bachelor', 'master', 'phd']
```

**Generated Data:**
- Customer numbers
- Full names (Arabic/English)
- Contact information
- Degree-specific qualifications
- Desired programs
- Evaluation data
- Random but realistic values

**Usage:**
```bash
npm run test:generate-data
```

**Time:** ~30-45 minutes for 1M customers

**⚠️ WARNING:** 
- Use ONLY on test database
- Requires ~5-10 GB disk space
- Do NOT run on production!

---

### **testQueryPerformance.js** ⭐ **PERFORMANCE ANALYSIS**
**Purpose:** Test database query performance

**What it does:**
- Tests common query patterns
- Measures response times
- Validates indexes
- Generates performance report

**Tests Include:**
1. **List Queries** (pagination)
   - All customers
   - By degree type
   - By agent
   - By status

2. **Search Queries**
   - By name
   - By phone
   - By email
   - By customer number

3. **Filter Queries**
   - By date range
   - By multiple criteria
   - Complex aggregations

4. **Index Usage**
   - Verifies index effectiveness
   - Identifies slow queries

**Usage:**
```bash
npm run test:performance
```

**Output:**
```
📊 Performance Test Results:
─────────────────────────────
✓ List all customers:        487ms
✓ Search by name:             156ms
✓ Filter by degree:           98ms
✓ Agent assignment query:     234ms
✓ Complex aggregation:        1.2s
─────────────────────────────
Average Response Time: 434ms
```

---

## ✅ 4. VALIDATION SCRIPTS
### Purpose: Environment and data verification

### **checkEnvironment.js** ⭐ **PRE-DEPLOYMENT**
**Purpose:** Validate environment variables and dependencies

**What it does:**
- Checks all required environment variables
- Validates MongoDB connection
- Tests database access
- Verifies file permissions
- Checks Node.js version
- Validates package dependencies

**Checks:**
```javascript
✓ MONGODB_URI - exists and valid
✓ NEXTAUTH_SECRET - exists and secure
✓ NEXTAUTH_URL - exists and valid
✓ NODE_ENV - set correctly
✓ Database connection - working
✓ Write permissions - available
✓ Node.js version - compatible
```

**Usage:**
```bash
npm run check:env
```

**When to use:**
- Before deployment
- After environment changes
- Troubleshooting connection issues
- New developer onboarding

---

### **checkUniversities.js**
**Purpose:** Validate university data integrity

**What it does:**
- Counts total universities
- Validates college associations
- Checks for duplicates
- Reports data quality issues

**Usage:**
```bash
npm run check:universities
```

**Output:**
```
📊 University Data Check:
──────────────────────────
Total Universities: 153
With Colleges: 142
Without Colleges: 11
Duplicates Found: 0
──────────────────────────
Status: ✓ OK
```

---

### **verifyStudyDestinations.js**
**Purpose:** Verify study destination data

**What it does:**
- Validates dropdown values
- Checks customer references
- Identifies orphaned data
- Reports usage statistics

**Usage:**
```bash
npm run verify:destinations
```

---

## 🛠️ 5. MAINTENANCE SCRIPTS
### Purpose: Database optimization and cleanup

### **createIndexes.js** ⭐ **PERFORMANCE CRITICAL**
**Purpose:** Create and optimize database indexes

**What it does:**
- Creates all required indexes
- Optimizes query performance
- Updates index configurations
- Reports index creation status

**Indexes Created:**
```javascript
Customers:
- customerNumber (unique)
- basicData.customerPhone + basicData.email (compound unique)
- assignment.assignedAgentId
- degreeType
- evaluation.salesStatus
- Text search index

Profiles:
- email (unique)
- role

AuditLogs:
- userId, action, timestamp
- TTL index (90 days)
```

**Usage:**
```bash
npm run db:indexes
```

**When to use:**
- After database restore
- Performance degradation
- After major data migrations
- Monthly maintenance

---

### **updateSources.js**
**Purpose:** Update source values in system settings

**What it does:**
- Updates source dropdown options
- Adds new marketing sources
- Removes deprecated sources
- Validates existing data

**Usage:**
```bash
node scripts/updateSources.js
```

---

### **parseInfoFile.js**
**Purpose:** Parse and import data from information files

**What it does:**
- Reads data files
- Parses various formats
- Imports into database
- Reports import statistics

**Usage:**
```bash
npm run parse:info
```

---

## 📦 6. DATA FILES

### **universities153.json** (2,210 lines)
**Purpose:** Complete Egyptian university database

**Structure:**
```json
{
  "universities": [
    {
      "name": "Cairo University",
      "location": "Cairo",
      "type": "Public",
      "colleges": [
        {
          "name": "Faculty of Engineering",
          "programs": ["Civil Engineering", "Computer Science", ...]
        },
        ...
      ]
    },
    ...
  ]
}
```

**Contains:**
- 153 Egyptian universities
- Complete college listings
- Program information
- Location data

---

## 🚀 Quick Start Guide

### First Time Setup
```bash
# 1. Check environment
npm run check:env

# 2. Seed system settings
npm run seed:crm

# 3. Seed universities
npm run seed:universities

# 4. Create indexes
npm run db:indexes
```

### Performance Testing
```bash
# 1. Generate test data (use test database!)
npm run test:generate-data

# 2. Run performance tests
npm run test:performance
```

### After Major Updates
```bash
# 1. Fix database structure
npm run fix:db

# 2. Create/update indexes
npm run db:indexes

# 3. Verify data integrity
npm run check:universities
```

### Before Deployment
```bash
# 1. Validate environment
npm run check:env

# 2. Run migrations
npm run migrate:agents  # If not done yet

# 3. Create indexes
npm run db:indexes
```

---

## 📊 Script Execution Times

| Script | Execution Time | Database Impact |
|--------|---------------|-----------------|
| seedSystemSettings | 5-10 seconds | Low - Creates ~50 records |
| seedUniversities | 30-60 seconds | Medium - Creates 153 records |
| migrateAssignedAgents | 5-20 minutes | High - Updates ALL customers |
| generateTestCustomers | 30-45 minutes | Very High - Creates 1M records |
| testQueryPerformance | 2-5 minutes | Low - Read-only |
| createIndexes | 2-10 minutes | Medium - Creates indexes |
| checkEnvironment | 5-10 seconds | None - Read-only |
| fixDatabaseStructure | 5-30 minutes | High - Updates ALL customers |

---

## ⚠️ Important Warnings

### 🔴 **NEVER Run on Production:**
- `generateTestCustomers.js` - Testing ONLY
- `testQueryPerformance.js` - Test database recommended

### 🟡 **Backup Before Running:**
- `migrateToEgecCRM.js` - Major data transformation
- `migrateAssignedAgents.js` - Updates all customers
- `fixDatabaseStructure.js` - Modifies data

### 🟢 **Safe to Run Anytime:**
- `checkEnvironment.js` - Read-only
- `checkUniversities.js` - Read-only
- `verifyStudyDestinations.js` - Read-only

---

## 🔧 Common Use Cases

### Scenario 1: New Installation
```bash
npm run check:env
npm run seed:all
npm run db:indexes
```

### Scenario 2: Performance Issues
```bash
npm run db:indexes
npm run test:performance
npm run fix:db
```

### Scenario 3: Data Migration
```bash
# Backup first!
npm run migrate:agents
npm run fix:db
npm run db:indexes
```

### Scenario 4: Testing Performance
```bash
# Use test database!
npm run test:generate-data
npm run test:performance
```

### Scenario 5: Production Deployment
```bash
npm run check:env
npm run db:indexes
# Deploy application
```

---

## 📝 Script Dependencies

### All Scripts Require:
- ✅ Valid `.env` file with `MONGODB_URI`
- ✅ MongoDB connection
- ✅ Node.js 18+ with ES Modules support

### Some Scripts Require:
- 📦 `models/` - Database models
- 📦 `lib/mongoose.js` - Database connection
- 📦 Data files (e.g., `universities153.json`)

---

## 🎯 Best Practices

### 1. **Always Backup**
```bash
# MongoDB backup command
mongodump --uri="your-mongodb-uri" --out=./backup-$(date +%Y%m%d)
```

### 2. **Test on Staging First**
- Run migrations on test database
- Verify results
- Then apply to production

### 3. **Monitor Execution**
- Watch console output
- Check for errors
- Verify completion messages

### 4. **Regular Maintenance**
```bash
# Monthly:
npm run db:indexes
npm run check:universities

# Quarterly:
npm run fix:db
```

### 5. **Keep Logs**
- Save migration outputs
- Document changes
- Track execution times

---

## 🔍 Troubleshooting

### Script Won't Run
```bash
# Check environment
npm run check:env

# Verify database connection
node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
```

### Slow Performance
```bash
# Create indexes
npm run db:indexes

# Test performance
npm run test:performance
```

### Data Inconsistencies
```bash
# Fix database
npm run fix:db

# Verify integrity
npm run check:universities
```

---

## 📚 Additional Resources

### Related Documentation:
- `BACKEND_TECHNOLOGY_STACK.md` - Backend architecture
- `PERFORMANCE_TESTING_1M_CUSTOMERS.md` - Performance guide
- `package.json` - All npm scripts

### MongoDB Commands:
```bash
# Connect to database
mongosh "your-mongodb-uri"

# Count customers
db.customers.countDocuments()

# Check indexes
db.customers.getIndexes()

# Database stats
db.stats()
```

---

## 🎯 Summary

**The `scripts/` folder provides:**

✅ **20 utility scripts** for automation  
✅ **5 categories** of functionality  
✅ **Complete data management** tools  
✅ **Performance testing** capabilities  
✅ **Migration support** for schema changes  
✅ **Validation tools** for data integrity  
✅ **Maintenance utilities** for optimization  

**Key Scripts You Should Know:**
1. 🌱 `seedSystemSettings.js` - Initial setup
2. 🔄 `migrateAssignedAgents.js` - Multi-agent migration
3. 🧪 `generateTestCustomers.js` - Performance testing
4. ✅ `checkEnvironment.js` - Pre-deployment
5. 🛠️ `createIndexes.js` - Performance optimization

**Your scripts are production-ready and well-organized! 🚀**
