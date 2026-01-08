# 🗄️ DATABASE STRUCTURE - BEST PRACTICES

## ✅ Current Optimal Structure (After Migration)

### Database: `egec_crm`

```
egec_crm/
├── 📁 customers (13 documents)
│   ├── Customer data
│   ├── Personal information
│   ├── Desired program details
│   └── Assignment information
│
├── 📁 frontenduser (7 documents)
│   ├── User accounts
│   ├── Roles and permissions
│   └── Authentication data
│
├── 📁 followups (1 document)
│   ├── Follow-up records
│   └── Communication history
│
├── 📁 auditlogs (134 documents)
│   ├── System audit trail
│   ├── User actions
│   └── Changes history
│
├── 📁 systemsettings (17 documents)
│   ├── study_destinations (ENGLISH ✅)
│   ├── counselor_statuses
│   ├── university_countries
│   └── Other dropdown options
│
└── 📁 universities (152 documents)
    ├── University information
    ├── Countries (ENGLISH ✅)
    └── Programs/Colleges
```

---

## 🎯 Why This Structure is Best

### 1. **Professional Database Name**
- ✅ `egec_crm` - Descriptive and professional
- ❌ `test` - Generic, looks unprofessional
- Easier to identify in backups
- Clear purpose and ownership

### 2. **Consistent Language**
- ✅ All reference data in **English**
- ✅ Easier for developers
- ✅ Better for API integrations
- ✅ International compatibility

### 3. **Proper Organization**
- Logical collection names
- Clear data relationships
- Easy to understand structure
- Scalable design

### 4. **Performance Optimized**
- Indexed fields for fast queries
- Efficient document structure
- Proper data types
- Optimized for Next.js/Mongoose

---

## 📚 Collection Details

### `customers` Collection

**Purpose:** Store customer/lead information

**Structure:**
```javascript
{
  _id: ObjectId,
  name: String,
  phone: String,
  email: String,
  degreeType: String, // 'bachelor', 'master', 'phd'
  
  desiredProgram: {
    studyDestination: String, // ENGLISH country name
    desiredUniversity: String,
    desiredCollege: String,
    desiredDegree: String,
    desiredSpecialization: String
  },
  
  evaluation: {
    interestRate: String,
    callQuality: String,
    educationalLevel: String
  },
  
  assignedAgentId: ObjectId,
  createdBy: ObjectId,
  counselorStatus: String,
  
  createdAt: Date,
  updatedAt: Date,
  isDeleted: Boolean
}
```

**Indexes:**
- `assignedAgentId`
- `createdBy`
- `degreeType`
- `counselorStatus`
- `createdAt`
- `isDeleted`
- Compound: `(assignedAgentId, degreeType)`
- Compound: `(createdBy, degreeType)`

---

### `frontenduser` Collection

**Purpose:** User accounts and authentication

**Structure:**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String, // Hashed
  phone: String,
  
  role: String, // 'superadmin', 'admin', 'superagent', 'dataentry', 'agent'
  
  teamId: ObjectId,
  permissions: Object,
  
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `email` (unique)
- `role`
- `isActive`
- `teamId`

---

### `systemsettings` Collection

**Purpose:** System-wide configuration and dropdown options

**Structure:**
```javascript
{
  _id: ObjectId,
  settingKey: String, // 'study_destinations', 'counselor_statuses', etc.
  settingValue: Array, // List of options
  settingType: String, // 'dropdown_options', 'config', etc.
  description: String,
  
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
  updatedBy: ObjectId
}
```

**Important Settings:**
- `study_destinations` - **MUST be in ENGLISH**
- `counselor_statuses` - Customer status options
- `university_countries` - Country list
- `degree_types` - Bachelor, Master, PhD

**Indexes:**
- `settingKey` (unique)
- `isActive`

---

### `universities` Collection

**Purpose:** University data with programs

**Structure:**
```javascript
{
  _id: ObjectId,
  name: String,
  country: String, // ENGLISH country name
  universityType: String,
  accreditation: String,
  status: String,
  
  colleges: [
    {
      collegeId: ObjectId,
      collegeName: String,
      
      degreecollegeunversityinfo: [
        {
          degreeId: ObjectId,
          degreeName: String,
          
          specializations: [
            {
              specializationId: ObjectId,
              specializationName: String
            }
          ]
        }
      ]
    }
  ],
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `name`
- `country`
- `universityType`
- `status`
- `colleges.collegeId`
- Compound: `(country, status)`
- Text search: `(name, country)`

---

### `followups` Collection

**Purpose:** Track customer follow-ups

**Structure:**
```javascript
{
  _id: ObjectId,
  customerId: ObjectId,
  userId: ObjectId,
  
  followupDate: Date,
  nextFollowupDate: Date,
  notes: String,
  status: String,
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `customerId`
- `userId`
- `followupDate`
- `nextFollowupDate`
- `status`

---

### `auditlogs` Collection

**Purpose:** System audit trail

**Structure:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  userEmail: String,
  userName: String,
  userRole: String,
  
  action: String, // 'CREATE', 'UPDATE', 'DELETE', 'VIEW'
  entityType: String, // 'customer', 'user', etc.
  entityId: ObjectId,
  entityName: String,
  
  oldValues: Object,
  newValues: Object,
  changes: Array,
  
  ipAddress: String,
  userAgent: String,
  requestMethod: String,
  requestPath: String,
  
  createdAt: Date
}
```

**Indexes:**
- `userId`
- `entityType`
- `entityId`
- `action`
- `createdAt`
- Compound: `(entityType, entityId)`
- Compound: `(userId, createdAt)`

---

## 🔐 Best Practices

### 1. **Always Specify Database Name**
```javascript
// ✅ Good
const uri = "mongodb+srv://user:pass@cluster.mongodb.net/egec_crm";

// ❌ Bad
const uri = "mongodb+srv://user:pass@cluster.mongodb.net/";
```

### 2. **Use Environment Variables**
```bash
# .env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/egec_crm
DATABASE_NAME=egec_crm
```

### 3. **Connection Best Practices**
```javascript
// lib/mongoose.js
const databaseName = process.env.DATABASE_NAME || 'egec_crm';
// Ensure URI includes database name
if (!uri.includes(`/${databaseName}`)) {
  uri = `${uri}/${databaseName}`;
}
```

### 4. **Index Strategy**
- Index frequently queried fields
- Use compound indexes for multiple-field queries
- Add text indexes for search functionality
- Monitor slow queries and add indexes as needed

### 5. **Data Consistency**
- Use English for reference data (countries, etc.)
- Maintain consistent field naming
- Use proper data types (Date, ObjectId, etc.)
- Validate data on insert/update

### 6. **Backup Strategy**
```bash
# Daily backups
mongodump --uri="mongodb+srv://..." --db=egec_crm --out=/backups/$(date +%Y%m%d)

# Weekly full backup
mongodump --uri="mongodb+srv://..." --out=/backups/full/$(date +%Y%m%d)
```

---

## 🚀 Migration Checklist

When migrating or restructuring database:

- [ ] Backup current database
- [ ] Test connection to target database
- [ ] Verify target database is empty or has expected data
- [ ] Run migration script
- [ ] Verify data integrity
- [ ] Update environment variables
- [ ] Update connection strings
- [ ] Test application with new database
- [ ] Monitor for errors
- [ ] Keep old database as backup for 1-2 weeks
- [ ] Document changes

---

## 📊 Monitoring

### Key Metrics to Monitor:
1. **Connection Pool**
   - Active connections
   - Available connections
   - Wait queue length

2. **Query Performance**
   - Slow queries (>100ms)
   - Index usage
   - Collection scan vs index scan

3. **Database Size**
   - Total size
   - Collection sizes
   - Index sizes
   - Growth rate

4. **Operations**
   - Reads per second
   - Writes per second
   - Update patterns
   - Delete patterns

---

## 🔧 Maintenance Commands

### Check Database Structure
```bash
npm run fix:db
```

### Verify Study Destinations
```bash
npm run verify:destinations
```

### Check Universities
```bash
npm run check:universities
```

### Create/Update Indexes
```bash
npm run db:indexes
```

### Migrate Data
```bash
npm run migrate:db
```

### Seed Data
```bash
npm run seed:all
```

---

## ⚠️ Common Pitfalls to Avoid

### 1. **Using Default Database**
- MongoDB defaults to `test` database
- Always explicitly specify database name
- Check connection logs

### 2. **Mixing Languages**
- Don't mix Arabic and English reference data
- Keep UI labels separate from data
- Use i18n for translations

### 3. **Missing Indexes**
- Queries on non-indexed fields are slow
- Monitor query performance
- Add indexes proactively

### 4. **Incorrect Data Types**
- Use ObjectId for references
- Use Date for timestamps
- Use Boolean for flags
- Use Number for counts

### 5. **No Backup Strategy**
- Always have backups
- Test restore procedures
- Keep multiple backup versions

---

## 📝 Summary

### Current Setup (OPTIMAL ✅)
- **Database:** `egec_crm`
- **Collections:** 6 (customers, frontenduser, followups, auditlogs, systemsettings, universities)
- **Language:** English for all reference data
- **Indexes:** Properly indexed for performance
- **Structure:** Clean, organized, scalable

### Key Success Factors
1. ✅ Professional database name
2. ✅ Consistent English reference data
3. ✅ Proper indexes on all collections
4. ✅ Clear data relationships
5. ✅ Environment-based configuration
6. ✅ Audit trail for all changes
7. ✅ Scalable structure for growth

---

**Last Updated:** January 8, 2026  
**Status:** ✅ Production Ready  
**Database:** `egec_crm` (Active)
