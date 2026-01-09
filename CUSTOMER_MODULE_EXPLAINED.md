# 🎓 Customer Module - Complete Architecture Explanation

## 📚 Table of Contents
1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Database Layer (Models)](#database-layer)
4. [API Layer (Backend)](#api-layer)
5. [Frontend Layer (Pages)](#frontend-layer)
6. [Data Flow Example](#data-flow-example)
7. [File Structure](#file-structure)
8. [How Each Part Works](#how-each-part-works)

---

## 🎯 Overview

The Customer module is the **heart of your CRM**. It manages all student/customer data from creation to graduation. Think of it as a 3-layer cake:

```
┌─────────────────────────────────────┐
│  FRONTEND (What users see)          │  ← Pages in /pages/crm/customers
├─────────────────────────────────────┤
│  API (Business Logic)                │  ← APIs in /pages/api/crm/customers
├─────────────────────────────────────┤
│  DATABASE (Data Storage)             │  ← Model in /models/Customer.js
└─────────────────────────────────────┘
```

---

## 🏗️ Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │ List Page  │  │Create Page │  │ Edit Page  │  │ View Page  ││
│  │ (index.js) │  │(create.js) │  │([id]/edit) │  │  ([id].js) ││
│  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘  └──────┬─────┘│
│         │                │                │                │      │
└─────────┼────────────────┼────────────────┼────────────────┼──────┘
          │                │                │                │
          │ HTTP Requests (GET, POST, PUT, DELETE)         │
          ▼                ▼                ▼                ▼
┌──────────────────────────────────────────────────────────────────┐
│                        API LAYER (Backend)                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │            /api/crm/customers/index.js                      ││
│  │  • GET    → List all customers (with filters)               ││
│  │  • POST   → Create new customer                             ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │            /api/crm/customers/[id].js                       ││
│  │  • GET    → Get single customer                             ││
│  │  • PUT    → Update customer                                 ││
│  │  • DELETE → Delete customer (soft delete)                   ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │            /api/crm/customers/stats.js                      ││
│  │  • GET    → Get customer statistics                         ││
│  └─────────────────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────────────────┐│
│  │            /api/crm/customers/[id]/assign.js                ││
│  │  • POST   → Assign agent to customer                        ││
│  └─────────────────────────────────────────────────────────────┘│
└────────────────────────────┬──────────────────────────────────────┘
                             │
                             │ Mongoose ODM
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                   DATABASE (MongoDB)                              │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                 customers Collection                         ││
│  │  {                                                           ││
│  │    _id: ObjectId,                                            ││
│  │    customerNumber: "CUS-2026-0001",                          ││
│  │    degreeType: "bachelor",                                   ││
│  │    basicData: {                                              ││
│  │      customerName: "Ahmed Ali",                              ││
│  │      customerPhone: "123456789",                             ││
│  │      email: "ahmed@example.com"                              ││
│  │    },                                                        ││
│  │    currentQualification: {...},                              ││
│  │    desiredProgram: {...},                                    ││
│  │    assignment: {...},                                        ││
│  │    evaluation: {...},                                        ││
│  │    ...more fields                                            ││
│  │  }                                                           ││
│  └─────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Layer (Models)

### Location: `/models/Customer.js`

This is the **blueprint** for customer data. Think of it as a form template that defines:
- What fields exist
- What type of data each field holds
- What's required vs optional
- Validation rules

### Customer Schema Structure:

```javascript
const customerSchema = new mongoose.Schema({
  
  // 1️⃣ UNIQUE IDENTIFIER
  customerNumber: {
    type: String,
    unique: true,           // No duplicates allowed
    required: true,         // Must have value
    example: "CUS-2026-0001"
  },
  
  // 2️⃣ DEGREE TYPE (What they want to study)
  degreeType: {
    type: String,
    enum: ["bachelor", "master", "phd"],  // Only these 3 options
    default: "bachelor"
  },
  
  // 3️⃣ MARKETING DATA (Where did they come from?)
  marketingData: {
    source: String,              // Facebook, Instagram, etc.
    company: String,             // Which company referred them
    inquiryDate: Date,          // When did they first contact us
    counselorId: ObjectId,      // Who's their counselor
    ...more fields
  },
  
  // 4️⃣ BASIC DATA (Personal information)
  basicData: {
    customerName: String,        // Full name
    customerPhone: String,       // Phone number
    email: String,              // Email address
    nationality: String,        // Country of citizenship
    gender: String,             // Male/Female
    ...more fields
  },
  
  // 5️⃣ CURRENT QUALIFICATION (What they studied before)
  currentQualification: {
    certificateName: String,    // High school, Bachelor, etc.
    graduationYear: Number,     // Year they graduated
    grade: String,              // Their score/grade
    ...degree-specific fields
  },
  
  // 6️⃣ DESIRED PROGRAM (What they want to study)
  desiredProgram: {
    desiredUniversity: String,   // Which university
    desiredCollege: String,      // Which college
    desiredSpecialization: String, // Which major
    studyDestination: String,    // Which country
    ...more fields
  },
  
  // 7️⃣ ASSIGNMENT (Who's handling this customer)
  assignment: {
    assignedAgentId: ObjectId,   // Which agent
    assignedAgentName: String,
    assignedAt: Date,           // When assigned
    assignedBy: String          // Who assigned them
  },
  
  // 8️⃣ EVALUATION (Customer status)
  evaluation: {
    counselorStatus: String,    // New, In Progress, etc.
    salesStatus: String,        // Lead, Qualified, etc.
    interestRate: String,       // High, Medium, Low
    nextFollowupDate: Date,    // When to contact next
    ...more fields
  },
  
  // 9️⃣ DOCUMENTS (Files uploaded)
  documents: [
    {
      documentType: String,     // Passport, Certificate, etc.
      fileUrl: String,         // Cloudinary URL
      uploadedAt: Date,
      uploadedBy: String
    }
  ],
  
  // 🔟 SYSTEM FIELDS
  isDeleted: Boolean,           // Soft delete flag
  createdBy: String,           // Who created this record
  createdAt: Date,             // Auto-generated
  updatedAt: Date              // Auto-generated
});
```

### Why This Structure?

1. **Organized Data**: Different sections for different purposes
2. **Flexible**: Works for Bachelor, Master, and PhD students
3. **Trackable**: Knows who created/modified/assigned
4. **Searchable**: Indexed fields for fast searching
5. **Historical**: Keeps all data, never truly deletes (soft delete)

---

## 🔌 API Layer (Backend)

### Location: `/pages/api/crm/customers/`

The API layer is the **middleman** between the frontend and database. It:
- Receives requests from the browser
- Checks permissions (who can do what)
- Validates data (is it correct?)
- Talks to MongoDB
- Sends responses back

### Main API Files:

#### 1. **`index.js`** - List & Create Customers

```javascript
// GET /api/crm/customers → List all customers
GET Request Flow:
┌─────────────────┐
│ 1. Get session  │ → Check if user is logged in
├─────────────────┤
│ 2. Check role   │ → What can this user see?
│                 │   • Superadmin: All customers
│                 │   • Admin: All customers
│                 │   • Agent: Only assigned customers
├─────────────────┤
│ 3. Build query  │ → Create MongoDB filter
│                 │   • Role-based filter
│                 │   • Search filter (name, phone, email)
│                 │   • Degree type filter
│                 │   • Status filters
│                 │   • Date range filters
├─────────────────┤
│ 4. Pagination   │ → Get page 1, 2, 3, etc.
│                 │   • limit = 20 customers per page
│                 │   • skip = (page - 1) * limit
├─────────────────┤
│ 5. Database     │ → Customer.find(query)
│    query        │     .skip(skip)
│                 │     .limit(limit)
│                 │     .sort('-createdAt')
├─────────────────┤
│ 6. Return data  │ → Send JSON response:
│                 │   {
│                 │     success: true,
│                 │     data: [customers array],
│                 │     pagination: {page, total, pages}
│                 │   }
└─────────────────┘

// POST /api/crm/customers → Create new customer
POST Request Flow:
┌─────────────────┐
│ 1. Get session  │ → Check if user is logged in
├─────────────────┤
│ 2. Check perm   │ → Can user create customers?
├─────────────────┤
│ 3. Validate     │ → Is data valid?
│    data         │   • Required fields present?
│                 │   • Phone number format correct?
│                 │   • Email format correct?
├─────────────────┤
│ 4. Check        │ → Does customer already exist?
│    duplicate    │   • Same phone number?
│                 │   • Same email?
├─────────────────┤
│ 5. Generate     │ → Create customer number
│    number       │   "CUS-2026-0001"
├─────────────────┤
│ 6. Save to DB   │ → Customer.create({...data})
├─────────────────┤
│ 7. Log audit    │ → Record who created it
├─────────────────┤
│ 8. Return       │ → Send new customer data
└─────────────────┘
```

#### 2. **`[id].js`** - Get, Update, Delete Single Customer

```javascript
// GET /api/crm/customers/[id] → Get one customer
// PUT /api/crm/customers/[id] → Update customer
// DELETE /api/crm/customers/[id] → Soft delete

Dynamic Route: [id] = Customer's MongoDB _id
Example: /api/crm/customers/507f1f77bcf86cd799439011
```

#### 3. **`stats.js`** - Customer Statistics

```javascript
// GET /api/crm/customers/stats
Returns:
{
  all: 100,        // Total customers
  bachelor: 50,   // Bachelor students
  master: 30,     // Master students
  phd: 20         // PhD students
}
```

#### 4. **`[id]/assign.js`** - Assign Agent

```javascript
// POST /api/crm/customers/[id]/assign
Body: { agentId: "507f..." }
→ Assigns an agent to handle this customer
```

### Security in APIs:

Every API has these protections:

```javascript
async function handler(req, res) {
  // 1️⃣ Block direct browser access
  if (checkDirectAccess(req, res)) return;
  
  // 2️⃣ Check authentication
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ error: 'Unauthorized' });
  
  // 3️⃣ Check permissions
  if (!checkPermission(role, 'customers', 'read')) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  
  // 4️⃣ Rate limiting (prevent spam)
  // Applied via withRateLimit wrapper
  
  // 5️⃣ Input validation
  const validation = validateCustomerData(req.body);
  if (!validation.valid) {
    return res.status(400).json({ errors: validation.errors });
  }
  
  // 6️⃣ Audit logging
  await logAudit({
    userId,
    action: 'customer:create',
    details: { customerId }
  });
  
  // Now do the actual work...
}
```

---

## 🎨 Frontend Layer (Pages)

### Location: `/pages/crm/customers/`

This is what **users actually see and interact with**.

### Page Files:

#### 1. **`index.js`** - Customer List Page

```
┌──────────────────────────────────────────────────────────────┐
│  🎯 All Customers                        [+ New Customer]     │
├──────────────────────────────────────────────────────────────┤
│  Tabs: [All: 100] [Bachelor: 50] [Master: 30] [PhD: 20]      │
├──────────────────────────────────────────────────────────────┤
│  🔍 [Search by name, phone, email...]  [🔽 Filters] [Export] │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐│
│  │ CUSTOMER # │ NAME    │ PHONE     │ STATUS  │ ACTIONS   ││
│  ├──────────────────────────────────────────────────────────┤│
│  │ CUS-001    │ Ahmed   │ 123456789 │ Active  │ 👁 ✏️ 🗑   ││
│  │ CUS-002    │ Sara    │ 987654321 │ Pending │ 👁 ✏️ 🗑   ││
│  │ CUS-003    │ Mohamed │ 555555555 │ Active  │ 👁 ✏️ 🗑   ││
│  └──────────────────────────────────────────────────────────┘│
├──────────────────────────────────────────────────────────────┤
│  Showing 1-20 of 100      [← 1 2 3 4 5 →]                    │
└──────────────────────────────────────────────────────────────┘
```

**What it does:**
1. Fetches customers from API
2. Shows them in a table
3. Allows searching & filtering
4. Pagination (20 customers per page)
5. Actions: View, Edit, Delete (superadmin only)

**Key Functions:**
```javascript
// Fetch customers from API
const fetchCustomers = async () => {
  const response = await fetch('/api/crm/customers?page=1&limit=20');
  const data = await response.json();
  setCustomers(data.data);
};

// Search customers
const handleSearch = (searchTerm) => {
  setSearchQuery(searchTerm);
  // API automatically searches in name, phone, email
};

// Filter by degree type
const handleDegreeTabClick = (degreeType) => {
  setActiveDegreeTab(degreeType);
  // Re-fetch with filter
};
```

#### 2. **`create.js`** - Create New Customer Page

```
┌──────────────────────────────────────────────────────────────┐
│  📝 Create New Customer                                       │
├──────────────────────────────────────────────────────────────┤
│  Step 1: Choose Degree Type                                   │
│  ○ Bachelor (بكالوريوس)                                      │
│  ○ Master (ماجستير)                                          │
│  ○ PhD (دكتوراه)                                             │
├──────────────────────────────────────────────────────────────┤
│  Step 2: Basic Information                                    │
│  Name: [_________________]                                    │
│  Phone: [_________________]                                   │
│  Email: [_________________]                                   │
│  Nationality: [Select ▼]                                      │
├──────────────────────────────────────────────────────────────┤
│  Step 3: Current Qualification                                │
│  Certificate: [_________________]                             │
│  Graduation Year: [____]                                      │
│  Grade: [_________________]                                   │
├──────────────────────────────────────────────────────────────┤
│  Step 4: Desired Program                                      │
│  University: [Select ▼]                                       │
│  College: [Select ▼]                                          │
│  Specialization: [_________________]                          │
├──────────────────────────────────────────────────────────────┤
│  [Cancel]                              [Save Customer]        │
└──────────────────────────────────────────────────────────────┘
```

**What it does:**
1. Multi-step form
2. Different fields based on degree type
3. Cascading dropdowns (University → College)
4. Validation before submission
5. Sends data to POST /api/crm/customers

**Key Functions:**
```javascript
const handleSubmit = async () => {
  // 1. Validate form
  if (!formData.basicData.customerName) {
    alert('Name is required');
    return;
  }
  
  // 2. Send to API
  const response = await fetch('/api/crm/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  // 3. Handle response
  if (response.ok) {
    alert('Customer created successfully!');
    router.push('/crm/customers');
  } else {
    const error = await response.json();
    alert(error.message);
  }
};
```

#### 3. **`[id].js`** - View Customer Details Page

```
┌──────────────────────────────────────────────────────────────┐
│  👤 Customer Profile: Ahmed Ali                [Edit] [Back]  │
├──────────────────────────────────────────────────────────────┤
│  Customer Number: CUS-2026-0001                               │
│  Degree Type: Bachelor                                        │
│  Status: Active                                               │
│  Assigned Agent: John Doe                                     │
├──────────────────────────────────────────────────────────────┤
│  📋 Basic Information                                         │
│  Name: Ahmed Ali                                              │
│  Phone: +20 123 456 7890                                      │
│  Email: ahmed@example.com                                     │
│  Nationality: Egyptian                                        │
├──────────────────────────────────────────────────────────────┤
│  🎓 Current Qualification                                     │
│  Certificate: High School                                     │
│  Graduation Year: 2023                                        │
│  Grade: Excellent                                             │
├──────────────────────────────────────────────────────────────┤
│  🎯 Desired Program                                           │
│  University: Cairo University                                 │
│  College: Engineering                                         │
│  Specialization: Computer Science                             │
├──────────────────────────────────────────────────────────────┤
│  📁 Documents (3)                                             │
│  • Passport Copy (PDF) - 2024-01-15                           │
│  • Certificate (PDF) - 2024-01-16                             │
│  • ID Card (Image) - 2024-01-16                               │
├──────────────────────────────────────────────────────────────┤
│  📞 Follow-up History                                         │
│  • 2024-01-15: Initial contact - High interest                │
│  • 2024-01-20: Sent documents - Qualified lead                │
│  • 2024-01-25: Next follow-up scheduled                       │
└──────────────────────────────────────────────────────────────┘
```

**What it does:**
1. Fetches single customer by ID
2. Shows all customer information
3. Shows documents list
4. Shows follow-up history
5. Edit button to go to edit page

#### 4. **`[id]/edit.js`** - Edit Customer Page

Similar to create page, but:
- Pre-fills existing data
- Uses PUT method instead of POST
- Can change status, agent, etc.

---

## 🔄 Data Flow Example

### Let's Follow a Complete Journey: Creating a New Customer

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER CREATES CUSTOMER                         │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 1: User fills form on /crm/customers/create               │
│  ────────────────────────────────────────────────────────────   │
│  • Selects degree type: Bachelor                                 │
│  • Enters name: "Ahmed Ali"                                      │
│  • Enters phone: "123456789"                                     │
│  • Enters email: "ahmed@example.com"                             │
│  • Fills other fields...                                         │
│  • Clicks "Save Customer" button                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 2: Frontend validates & sends HTTP POST request           │
│  ────────────────────────────────────────────────────────────   │
│  const response = await fetch('/api/crm/customers', {           │
│    method: 'POST',                                               │
│    headers: { 'Content-Type': 'application/json' },             │
│    body: JSON.stringify({                                        │
│      degreeType: 'bachelor',                                     │
│      basicData: {                                                │
│        customerName: 'Ahmed Ali',                                │
│        customerPhone: '123456789',                               │
│        email: 'ahmed@example.com'                                │
│      },                                                          │
│      ...more data                                                │
│    })                                                            │
│  });                                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 3: API receives request (/api/crm/customers/index.js)     │
│  ────────────────────────────────────────────────────────────   │
│  ✓ Check if user is authenticated                                │
│  ✓ Check if user has permission to create                        │
│  ✓ Validate request body                                         │
│  ✓ Check for duplicate phone/email                               │
│  ✓ Generate customer number: "CUS-2026-0001"                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 4: API saves to MongoDB (models/Customer.js)               │
│  ────────────────────────────────────────────────────────────   │
│  const newCustomer = await Customer.create({                     │
│    customerNumber: 'CUS-2026-0001',                              │
│    degreeType: 'bachelor',                                       │
│    basicData: {                                                  │
│      customerName: 'Ahmed Ali',                                  │
│      customerPhone: '123456789',                                 │
│      email: 'ahmed@example.com'                                  │
│    },                                                            │
│    createdBy: 'admin@example.com',                               │
│    createdAt: new Date()                                         │
│  });                                                             │
│                                                                  │
│  MongoDB assigns _id: "507f1f77bcf86cd799439011"                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 5: API logs audit trail                                    │
│  ────────────────────────────────────────────────────────────   │
│  await logAudit({                                                │
│    userId: session.user.id,                                      │
│    action: 'customer:create',                                    │
│    resource: 'Customer',                                         │
│    resourceId: newCustomer._id,                                  │
│    details: {                                                    │
│      customerNumber: 'CUS-2026-0001',                            │
│      customerName: 'Ahmed Ali'                                   │
│    },                                                            │
│    ipAddress: req.headers['x-forwarded-for'],                    │
│    userAgent: req.headers['user-agent']                          │
│  });                                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 6: API sends response back to frontend                     │
│  ────────────────────────────────────────────────────────────   │
│  res.status(201).json({                                          │
│    success: true,                                                │
│    message: 'Customer created successfully',                     │
│    data: {                                                       │
│      _id: '507f1f77bcf86cd799439011',                            │
│      customerNumber: 'CUS-2026-0001',                            │
│      basicData: {                                                │
│        customerName: 'Ahmed Ali',                                │
│        customerPhone: '123456789',                               │
│        email: 'ahmed@example.com'                                │
│      }                                                           │
│    }                                                             │
│  });                                                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 7: Frontend receives response & redirects                  │
│  ────────────────────────────────────────────────────────────   │
│  if (response.ok) {                                              │
│    alert('Customer created successfully!');                      │
│    router.push('/crm/customers'); // Go to customer list         │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  STEP 8: User sees new customer in list                          │
│  ────────────────────────────────────────────────────────────   │
│  Customer list page automatically fetches updated data:          │
│  • Total customers: 101 (was 100)                                │
│  • New customer "Ahmed Ali" appears in the table                 │
│  • Can now view, edit, or delete the customer                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
Egec-CRM/
│
├── models/
│   └── Customer.js          ← DATABASE SCHEMA (What data looks like)
│
├── pages/
│   ├── crm/
│   │   └── customers/
│   │       ├── index.js     ← LIST PAGE (Show all customers)
│   │       ├── create.js    ← CREATE PAGE (Add new customer)
│   │       ├── [id].js      ← VIEW PAGE (Show one customer)
│   │       └── [id]/
│   │           └── edit.js  ← EDIT PAGE (Modify customer)
│   │
│   └── api/
│       └── crm/
│           └── customers/
│               ├── index.js       ← GET (list), POST (create)
│               ├── [id].js        ← GET (one), PUT (update), DELETE
│               ├── stats.js       ← GET (statistics)
│               └── [id]/
│                   └── assign.js  ← POST (assign agent)
│
├── lib/
│   ├── customerUtils.js     ← Helper functions:
│   │                           • generateCustomerNumber()
│   │                           • checkDuplicateCustomer()
│   │                           • validateCustomerData()
│   │
│   ├── permissions.js       ← Permission checks:
│   │                           • checkPermission()
│   │                           • buildCustomerQuery()
│   │
│   └── auditLogger.js       ← Audit trail:
│                               • logAudit()
│
└── components/
    └── (Various UI components used in pages)
```

---

## 🔧 How Each Part Works

### 1. **Creating a Customer**

```
User Action → Frontend Form → API Validation → Database Save → Response
```

**Detailed Steps:**

1. **User fills form** (create.js)
2. **Frontend validates** basic input
3. **Sends POST** to `/api/crm/customers`
4. **API validates** thoroughly:
   - Required fields present?
   - Email format correct?
   - Phone unique?
5. **Generates customer number** (CUS-YYYY-####)
6. **Saves to MongoDB**
7. **Logs audit trail**
8. **Returns success**
9. **Frontend redirects** to customer list

### 2. **Listing Customers**

```
Page Load → API Call → Database Query → Filter by Role → Return Results
```

**Detailed Steps:**

1. **Page loads** (index.js)
2. **Calls GET** `/api/crm/customers?page=1`
3. **API checks role**:
   - Superadmin: See all
   - Admin: See all
   - Agent: See only assigned
4. **Builds query** with filters
5. **MongoDB finds** matching customers
6. **Paginates** results (20 per page)
7. **Returns JSON** array
8. **Frontend displays** in table

### 3. **Searching Customers**

```
User Types → Debounce → API Call → Regex Search → Return Matches
```

**Detailed Steps:**

1. **User types** in search box
2. **Debounce** waits 300ms (avoid too many requests)
3. **Sends GET** with `?search=Ahmed`
4. **API creates regex**: `/Ahmed/i` (case-insensitive)
5. **Searches in**:
   - Customer name
   - Phone number
   - Email
   - Customer number
6. **Returns matches**
7. **Frontend updates** table

### 4. **Filtering by Status**

```
User Clicks Filter → API Call → Add Filter to Query → Return Filtered
```

**Detailed Steps:**

1. **User selects** "Active" status
2. **Frontend adds** `?counselorStatus=active`
3. **API adds to query**: `{ 'evaluation.counselorStatus': 'active' }`
4. **MongoDB filters** results
5. **Returns** only active customers

### 5. **Viewing a Customer**

```
User Clicks View → Navigate to [id] → API Fetches → Display Data
```

**Detailed Steps:**

1. **User clicks** 👁️ icon
2. **Router navigates** to `/crm/customers/507f1f77bcf86cd799439011`
3. **Page calls GET** `/api/crm/customers/507f1f77bcf86cd799439011`
4. **API finds** customer by ID
5. **Returns full** customer object
6. **Frontend displays** all sections

### 6. **Editing a Customer**

```
Load Edit Page → Prefill Form → User Changes → Validate → Save → Update
```

**Detailed Steps:**

1. **Navigate to** edit page
2. **Fetch current** data
3. **Prefill form** with existing values
4. **User modifies** fields
5. **Click save**
6. **Frontend validates**
7. **Sends PUT** to `/api/crm/customers/[id]`
8. **API updates** database
9. **Returns updated** data
10. **Redirect** to view page

### 7. **Deleting a Customer** (Soft Delete)

```
User Clicks Delete → Confirm → API Sets isDeleted=true → Hide from List
```

**Detailed Steps:**

1. **Superadmin clicks** 🗑️ icon
2. **Confirm dialog**: "Are you sure?"
3. **User confirms**
4. **Sends DELETE** to `/api/crm/customers/[id]`
5. **API sets**: `isDeleted: true, deletedAt: new Date(), deletedBy: userId`
6. **Customer hidden** from lists
7. **Data preserved** in database
8. **Can be restored** by superadmin

---

## 🔐 Security Features

### 1. **Authentication** (Who are you?)
```javascript
const session = await getServerSession(req, res, authOptions);
if (!session) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### 2. **Authorization** (What can you do?)
```javascript
if (!checkPermission(role, 'customers', 'create')) {
  return res.status(403).json({ error: 'Forbidden' });
}
```

### 3. **Input Validation** (Is the data safe?)
```javascript
const validation = validateCustomerData(req.body);
if (!validation.valid) {
  return res.status(400).json({ errors: validation.errors });
}
```

### 4. **Rate Limiting** (Prevent spam)
```javascript
export default withRateLimit(handler, {
  maxRequests: 100,
  windowMs: 60000 // 100 requests per minute
});
```

### 5. **Audit Logging** (Who did what?)
```javascript
await logAudit({
  userId,
  action: 'customer:create',
  resourceId: newCustomer._id
});
```

### 6. **Direct Access Protection**
```javascript
if (checkDirectAccess(req, res)) return;
// Blocks direct browser navigation to API URLs
```

---

## 📊 Role-Based Access

| Action | Superadmin | Admin | Agent | Data Entry |
|--------|-----------|-------|-------|------------|
| **View All** | ✅ | ✅ | ❌ (Only assigned) | ❌ (Only assigned) |
| **Create** | ✅ | ✅ | ✅ | ✅ |
| **Edit Any** | ✅ | ✅ | ❌ (Only assigned) | ❌ (15 min window) |
| **Delete** | ✅ | ❌ | ❌ | ❌ |
| **Assign Agent** | ✅ | ✅ | ❌ | ❌ |
| **Export** | ✅ | ✅ | ✅ | ❌ |

---

## 🎯 Summary

The Customer Module is like a **well-oiled machine**:

1. **Database (Model)** = Storage tank (holds all data)
2. **API (Backend)** = Processing unit (validates, protects, processes)
3. **Frontend (Pages)** = User interface (what people interact with)

### Data Flow:
```
User → Frontend → API → Database
                ↓
         Validation, Security, Logging
                ↓
Database → API → Frontend → User
```

### Key Concepts:
- **CRUD**: Create, Read, Update, Delete
- **REST API**: Standardized HTTP methods (GET, POST, PUT, DELETE)
- **Pagination**: Show data in chunks (pages)
- **Filtering**: Show specific subset of data
- **Soft Delete**: Mark as deleted, don't actually remove
- **Audit Trail**: Track all changes
- **RBAC**: Role-Based Access Control

### File Connections:
```
Frontend (create.js) 
    → API (index.js POST) 
    → Model (Customer.js) 
    → MongoDB

Frontend (index.js) 
    → API (index.js GET) 
    → Model (Customer.js) 
    → MongoDB 
    → API → Frontend (displays list)
```

---

**Need more clarification on any specific part?** I can dive deeper into:
- How cascading dropdowns work
- Document upload system
- Follow-up system integration
- Assignment system
- Export functionality
- Or any other specific feature!
