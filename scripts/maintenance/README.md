# 🔧 Maintenance Scripts

**✅ THESE SCRIPTS ARE DEPLOYED BUT RUN MANUALLY AS NEEDED**

These are optional maintenance scripts for updating data and verifying system integrity.

---

## 📋 Scripts in This Folder

### University Data Updates

#### `updateUniversitiesComplete.js`
**Purpose:** Complete update of university data  
**When:** When university information changes  
**Usage:**
```bash
node scripts/maintenance/updateUniversitiesComplete.js
```

#### `updateTo153Universities.js`
**Purpose:** Expand university list to 153 entries  
**When:** Expanding university coverage  
**Usage:**
```bash
node scripts/maintenance/updateTo153Universities.js
```

### Field Updates

#### `updateStudyDestinations.js`
**Purpose:** Update study destination fields  
**When:** When study destinations list changes  
**Usage:**
```bash
node scripts/maintenance/updateStudyDestinations.js
```

#### `updateStudyTimes.js`
**Purpose:** Update study time options  
**When:** When study time options change  
**Usage:**
```bash
node scripts/maintenance/updateStudyTimes.js
```

#### `updateSources.js`
**Purpose:** Update customer source options  
**When:** When lead source options change  
**Usage:**
```bash
node scripts/maintenance/updateSources.js
```

### Data Verification

#### `verifyStudyDestinations.js`
**Purpose:** Verify data integrity of study destinations  
**When:** After data updates or troubleshooting  
**Usage:**
```bash
node scripts/maintenance/verifyStudyDestinations.js
```

### Data Import

#### `parseInfoFile.js`
**Purpose:** Import data from external info files  
**When:** Importing data from external sources  
**Usage:**
```bash
node scripts/maintenance/parseInfoFile.js
```

---

## 🎯 When to Use

### Regular Maintenance
- Monthly: Verify data integrity
- Quarterly: Update university information
- As needed: Update field options

### After Major Changes
- After adding new universities
- After changing system options
- After data migrations

---

## ⚠️ Important Notes

1. **Backup first** - Always backup database before running
2. **Test in development** - Test scripts in dev environment first
3. **Monitor execution** - Watch for errors during execution
4. **Verify results** - Check data after script completes
5. **Production timing** - Run during low-traffic periods

---

## 🔐 Security

- ✅ No sensitive data in scripts
- ✅ Use environment variables
- ✅ Safe to commit to Git
- ✅ Production-safe code

---

## 📊 Best Practices

```bash
# 1. Backup database
mongodump --uri="your-mongodb-uri"

# 2. Run script
node scripts/maintenance/updateUniversitiesComplete.js

# 3. Verify results
node scripts/maintenance/verifyStudyDestinations.js

# 4. Test application
# Check that everything works correctly
```

---

**Status:** Production Ready (Manual Use) ✅
