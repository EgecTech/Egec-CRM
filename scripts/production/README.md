# 🚀 Production Scripts

**✅ THESE SCRIPTS ARE DEPLOYED AND RUN IN PRODUCTION**

These are essential scripts needed for initial system setup and production operations.

---

## 📋 Scripts in This Folder

### System Initialization

#### `seedSystemSettings.js`
**Purpose:** Initialize system configuration  
**When:** First deployment or when resetting system settings  
**Usage:**
```bash
node scripts/production/seedSystemSettings.js
```

#### `createIndexes.js`
**Purpose:** Create database indexes for performance optimization  
**When:** After first deployment or when database is slow  
**Usage:**
```bash
node scripts/production/createIndexes.js
```

### University Data

#### `seedUniversities.js`
**Purpose:** Seed basic university data  
**When:** Initial setup  
**Usage:**
```bash
node scripts/production/seedUniversities.js
```

#### `seed153Universities.js`
**Purpose:** Seed 153 universities data  
**When:** Initial setup or expanding university list  
**Usage:**
```bash
node scripts/production/seed153Universities.js
```

#### `seedAllUniversitiesNew.js`
**Purpose:** Complete university seeding (recommended)  
**When:** Initial setup  
**Usage:**
```bash
node scripts/production/seedAllUniversitiesNew.js
```

#### `universities153.json`
**Purpose:** University data source file  
**Type:** Data file  
**Usage:** Referenced by seeding scripts

---

## 🎯 Quick Start

After deployment, run these scripts in order:

```bash
# 1. Initialize system settings
node scripts/production/seedSystemSettings.js

# 2. Seed universities
node scripts/production/seedAllUniversitiesNew.js

# 3. Create database indexes
node scripts/production/createIndexes.js
```

Or use npm script:
```bash
npm run seed:crm
```

---

## ⚠️ Important Notes

1. **These scripts ARE deployed** to production
2. **Run them carefully** in production environment
3. **Backup database** before running (if updating existing data)
4. **Check environment** (.env) before running
5. **Monitor logs** for errors

---

## 🔐 Security

- ✅ No sensitive data in these scripts
- ✅ Use environment variables for credentials
- ✅ Safe to commit to Git
- ✅ Production-ready code

---

**Status:** Production Ready ✅
