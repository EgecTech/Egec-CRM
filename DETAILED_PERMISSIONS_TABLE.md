# 🔐 Detailed Permissions Table - Egec CRM System

**Last Updated:** January 8, 2026  
**Version:** 2.0

---

## 📋 Complete Permissions Matrix

### Legend:
- ✅ **Full Access** - Complete access with all permissions
- 👁️ **View Only** - Can view but not edit
- 🔒 **Restricted** - Limited to own/assigned items only
- ❌ **No Access** - Cannot access at all

---

## 1️⃣ USER MANAGEMENT

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Access Users Page** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View All Users**    | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Create Superadmin** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Create Admin**      | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Create Super Agent**| ✅ | ✅ | ❌ | ❌ | ❌ |
| **Create Agent**      | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Create Data Entry** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Superadmin**   | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Edit Admin**        | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Super Agent**  | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Agent**        | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Data Entry**   | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Delete Users**      | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Activate/Deactivate Users** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Change User Password**| ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 2️⃣ CUSTOMER MANAGEMENT

### A. Customer List Page Access

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Access Customer List Page** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View All Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Assigned Customers** | ✅ | ✅ | ✅ | 🔒 Only assigned | ❌ |
| **View Own Created Customers** | ✅ | ✅ | ✅ | ✅ | 🔒 Only own |
| **See Degree Type Tabs** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **See All Customers Count** | ✅ All | ✅ All | ✅ All | 🔒 Assigned only | 🔒 Own only |
| **See Bachelor Count** | ✅ All | ✅ All | ✅ All | 🔒 Assigned only | 🔒 Own only |
| **See Master Count** | ✅ All | ✅ All | ✅ All | 🔒 Assigned only | 🔒 Own only |
| **See PhD Count** | ✅ All | ✅ All | ✅ All | 🔒 Assigned only | 🔒 Own only |
| **See Agent Column in Table** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Search Customers** | ✅ All | ✅ All | ✅ All | 🔒 Assigned only | 🔒 Own only |
| **Filter by Counselor Status** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Filter by Assigned Agent** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Filter by Date Range** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Export Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Import Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |

### B. Create Customer

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Access Create Page** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **See Marketing Data Step** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Fill Study Destination** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Fill Source** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Fill Company** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Assign Counselor** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Fill Basic Data** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Choose Degree Type** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Fill Current Qualification** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Fill Desired Program** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Fill Evaluation & Status** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Assign Agent on Creation** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Create Customer** | ✅ | ✅ | ✅ | ✅ | ✅ |

### C. View Customer Profile

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **View All Customer Profiles** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Assigned Customer Profiles** | ✅ | ✅ | ✅ | 🔒 Only assigned | ❌ |
| **View Own Created Customer Profiles** | ✅ | ✅ | ✅ | ✅ | 🔒 Only own |
| **See Basic Info Tab** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **See Marketing Data Tab** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **See Qualification Tab** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **See Desired Program Tab** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **See Evaluation Tab** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **See Follow-ups Tab** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **See Activity Timeline Tab** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **See Edit Button** | ✅ All | ✅ All | ✅ All | 🔒 Assigned only | 🔒 Own only (15 min) |

### D. Edit Customer

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Edit All Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Edit Assigned Customers** | ✅ | ✅ | ✅ | 🔒 Only assigned | ❌ |
| **Edit Own Created Customers** | ✅ | ✅ | ✅ | ✅ | 🔒 Within 15 min |
| **Change Degree Type** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit Marketing Data Section** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Study Destination** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Source** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Company** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Reassign Agent** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Edit Basic Data** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit Current Qualification** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit Desired Program** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Edit Evaluation & Status** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Save Changes** | ✅ | ✅ | ✅ | ✅ | 🔒 Within 15 min |

### E. Customer Assignment

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Assign Customer to Agent** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Reassign Customer** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Unassign Customer** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Assignment History** | ✅ | ✅ | ✅ | 👁️ | ❌ |

---

## 3️⃣ FOLLOW-UPS MANAGEMENT

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Access Follow-ups Page** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **View All Follow-ups** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Assigned Follow-ups** | ✅ | ✅ | ✅ | 🔒 Only assigned | ❌ |
| **Create Follow-up** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Edit All Follow-ups** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Edit Assigned Follow-ups** | ✅ | ✅ | ✅ | 🔒 Only assigned | ❌ |
| **Delete Follow-up** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Mark Complete** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Filter by Overdue** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Filter by Today** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Filter by This Week** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Filter by Status** | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 4️⃣ MARKETING DATA

| Field/Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------------|------------|-------|-------------|-------|------------|
| **View Marketing Data Tab** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Marketing Data Tab** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Study Destination** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Study Destination** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Source** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Source** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Company** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Company** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Counselor** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Counselor** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Inquiry Date** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Inquiry Date** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Inquiry Reference** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Inquiry Reference** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Article Inquiry** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Article Inquiry** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Sub Guides** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Edit Sub Guides** | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 5️⃣ CUSTOMER DATA FIELDS

### A. Basic Data (All Roles Can View/Edit Based on Customer Access)

| Field | Superadmin | Admin | Super Agent | Agent | Data Entry |
|-------|------------|-------|-------------|-------|------------|
| **Customer Name** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Customer Phone** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Email** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Gender** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Nationality** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Country** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **City/Region** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Another Contact Number** | ✅ | ✅ | ✅ | ✅ | ✅ |

### B. Current Qualification (Varies by Degree Type)

#### Bachelor's Degree Fields

| Field | Superadmin | Admin | Super Agent | Agent | Data Entry |
|-------|------------|-------|-------------|-------|------------|
| **Certificate Name** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Grade/GPA** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Overall Rating** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Graduation Year** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Study System** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Study Duration** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Certificate Track** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Available Colleges** | ✅ | ✅ | ✅ | ✅ | ✅ |

#### Master's Degree Fields

| Field | Superadmin | Admin | Super Agent | Agent | Data Entry |
|-------|------------|-------|-------------|-------|------------|
| **Bachelor's Specialization** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bachelor's College** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bachelor's University** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bachelor's Country** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bachelor's Graduation Year** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bachelor's GPA** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bachelor's Credit Hours** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bachelor's Study Duration** | ✅ | ✅ | ✅ | ✅ | ✅ |

#### PhD Degree Fields

| Field | Superadmin | Admin | Super Agent | Agent | Data Entry |
|-------|------------|-------|-------------|-------|------------|
| **All Bachelor's Fields** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master's Specialization** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master's Sector** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master's Degree Type** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master's College** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master's University** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master's Country** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master's Graduation Year** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master's GPA** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master's Credit Hours** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Master's Study Duration** | ✅ | ✅ | ✅ | ✅ | ✅ |

### C. Desired Program (All Roles Can View/Edit Based on Customer Access)

| Field | Superadmin | Admin | Super Agent | Agent | Data Entry |
|-------|------------|-------|-------------|-------|------------|
| **Desired Specialization** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Desired University** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Desired College** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Study Type** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Program Duration** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Preferred Start Date** | ✅ | ✅ | ✅ | ✅ | ✅ |

### D. Evaluation & Status (All Roles Can View/Edit Based on Customer Access)

| Field | Superadmin | Admin | Super Agent | Agent | Data Entry |
|-------|------------|-------|------------|-------|------------|
| **Counselor Status** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Interest Rate** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Interview Date** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Expected Admission Date** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Next Follow-up Date** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Notes** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 6️⃣ REPORTS & ANALYTICS

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Access Reports Page** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Dashboard Statistics** | ✅ All | ✅ All | ✅ All | 🔒 Assigned only | 🔒 Own only |
| **View Total Customers** | ✅ All | ✅ All | ✅ All | 🔒 Assigned only | 🔒 Own only |
| **View by Status** | ✅ All | ✅ All | ✅ All | 🔒 Assigned only | 🔒 Own only |
| **View by Degree Type** | ✅ All | ✅ All | ✅ All | 🔒 Assigned only | 🔒 Own only |
| **View Sales Pipeline** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Team Performance** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Agent Statistics** | ✅ | ✅ | ✅ | 👁️ Own only | ❌ |
| **Export Reports** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Generate Custom Reports** | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 7️⃣ SYSTEM SETTINGS

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Access Settings Page** | ✅ | ✅ | 👁️ Read-only | ❌ | ❌ |
| **View Sources** | ✅ | ✅ | 👁️ | ❌ | ❌ |
| **Edit Sources** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Add/Remove Sources** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Companies** | ✅ | ✅ | 👁️ | ❌ | ❌ |
| **Edit Companies** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Add/Remove Companies** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Counselor Statuses** | ✅ | ✅ | 👁️ | ❌ | ❌ |
| **Edit Counselor Statuses** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Add/Remove Statuses** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View Interest Rates** | ✅ | ✅ | 👁️ | ❌ | ❌ |
| **Edit Interest Rates** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Add/Remove Interest Rates** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **Configure System** | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 8️⃣ AUDIT LOGS

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Access Audit Logs Page** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View All Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Filter Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Search Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Export Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View User Actions** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Track Changes** | ✅ | ❌ | ❌ | ❌ | ❌ |

---

## 9️⃣ DASHBOARD ACCESS

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Access Dashboard** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **View Total Customers** | ✅ All | ✅ All | ✅ All | 🔒 Assigned | 🔒 Own |
| **View New Customers** | ✅ All | ✅ All | ✅ All | 🔒 Assigned | 🔒 Own |
| **View In Progress** | ✅ All | ✅ All | ✅ All | 🔒 Assigned | 🔒 Own |
| **View Converted** | ✅ All | ✅ All | ✅ All | 🔒 Assigned | 🔒 Own |
| **View Unassigned** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Overdue Follow-ups** | ✅ All | ✅ All | ✅ All | 🔒 Assigned | ❌ |
| **View Today's Follow-ups** | ✅ All | ✅ All | ✅ All | 🔒 Assigned | ❌ |
| **View This Week's Follow-ups** | ✅ All | ✅ All | ✅ All | 🔒 Assigned | ❌ |
| **View Sales Pipeline** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Recent Customers** | ✅ All | ✅ All | ✅ All | 🔒 Assigned | 🔒 Own |
| **Quick Actions - New Customer** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quick Actions - View Customers** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Quick Actions - Follow-ups** | ✅ | ✅ | ✅ | ✅ | ❌ |
| **Quick Actions - Reports** | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 🔟 API ACCESS & INTEGRATIONS

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Access Internal APIs** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Create API Tokens** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **View API Tokens** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Revoke API Tokens** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Use Public APIs** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 1️⃣1️⃣ SPECIAL RESTRICTIONS

### Data Entry Role Restrictions

| Restriction | Details |
|------------|---------|
| **Edit Time Limit** | Can only edit own created customers within 15 minutes of creation |
| **After 15 Minutes** | Customer becomes read-only for Data Entry |
| **View Access** | Can only view customers they created |
| **No Follow-ups** | Cannot create or view follow-ups |
| **No Reports** | Cannot access reports page |

### Agent Role Restrictions

| Restriction | Details |
|------------|---------|
| **Customer Access** | Can only view/edit customers assigned to them |
| **Follow-ups** | Can only view/edit follow-ups for assigned customers |
| **Marketing Data** | Cannot see or edit marketing data |
| **User Management** | Cannot access user management |
| **Reports** | Cannot access reports page |
| **Assignment** | Cannot assign/reassign customers |

### Super Agent Role Restrictions

| Restriction | Details |
|------------|---------|
| **User Management** | Cannot access user management (main difference from Admin) |
| **Marketing Data** | Cannot see or edit marketing data |
| **Customer Access** | Can view/edit all customers |
| **Assignment** | Can assign/reassign customers |
| **Reports** | Can access reports |

---

## 1️⃣2️⃣ CASCADING DROPDOWNS & DATA

| Feature | Superadmin | Admin | Super Agent | Agent | Data Entry |
|---------|------------|-------|-------------|-------|------------|
| **Study Destination Dropdown** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Universities by Country** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Colleges by University** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Specializations Dropdown** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Degrees Dropdown** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 📊 SUMMARY BY ROLE

### 👑 Superadmin (5-Star Access)
- **Total Access:** 100%
- **Unique Powers:**
  - Only role with audit log access
  - Can manage other superadmins
  - Full system configuration
  - Can create/revoke API tokens
- **Restrictions:** None

### 🔧 Admin (4.5-Star Access)
- **Total Access:** 95%
- **Unique Powers:**
  - Can manage all users except superadmins
  - Full marketing data access
  - System settings management
  - Can assign/reassign customers
- **Restrictions:**
  - Cannot view audit logs
  - Cannot manage superadmins
  - Cannot create API tokens

### 🌟 Super Agent (4-Star Access)
- **Total Access:** 80%
- **Unique Powers:**
  - Can view/edit all customers
  - Can assign/reassign customers
  - Can access reports
  - Can export data
- **Restrictions:**
  - Cannot manage users (KEY DIFFERENCE from Admin)
  - Cannot view/edit marketing data
  - Cannot access audit logs
  - Cannot edit system settings (read-only)

### 👤 Agent (3-Star Access)
- **Total Access:** 50%
- **Scope:** Only assigned customers
- **Powers:**
  - Can view/edit assigned customers
  - Can create new customers (auto-assigned to self)
  - Can manage follow-ups for assigned customers
  - Can see degree type tabs for own customers
- **Restrictions:**
  - No marketing data access
  - No user management
  - No reports access
  - Cannot assign/reassign customers
  - No access to unassigned customers

### 📝 Data Entry (2-Star Access)
- **Total Access:** 30%
- **Scope:** Only own created customers (15-minute edit window)
- **Powers:**
  - Can create new customers
  - Can view own created customers
  - Can edit own customers within 15 minutes
  - Can see degree type tabs for own customers
- **Restrictions:**
  - 15-minute edit time limit
  - No marketing data access
  - No follow-ups access
  - No reports access
  - No user management
  - Cannot view other users' customers

---

## 🎯 Quick Access Summary

| Can Do | Superadmin | Admin | Super Agent | Agent | Data Entry |
|--------|------------|-------|-------------|-------|------------|
| **Manage Users** | ✅ All | ✅ Except SA | ❌ | ❌ | ❌ |
| **View Marketing Data** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **View All Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Assign Customers** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Access Reports** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Export Data** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **View Audit Logs** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Degree Type Tabs** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **See Agent Column** | ✅ | ✅ | ✅ | ❌ | ❌ |

---

**Document Version:** 2.0  
**Last Updated:** January 8, 2026  
**Total Permissions Tracked:** 200+  
**Roles Covered:** 5  
**Status:** ✅ Complete & Verified
