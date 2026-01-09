// models/Customer.js
import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customerNumber: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },

    // ========== DEGREE TYPE (نوع الدرجة العلمية) ==========
    degreeType: {
      type: String,
      enum: ["bachelor", "master", "phd"],
      default: "bachelor",
      required: true,
      index: true,
    },

    // ========== MARKETING DATA (بيانات التسويق) ==========
    marketingData: {
      requiredScientificInterface: String,
      // studyDestination moved to desiredProgram
      source: String,
      company: String,
      inquiryDate: Date,
      inquiryReference: String,
      articleInquiry: String,
      counselorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        default: null,
      },
      counselorName: String,
      subGuide1Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        default: null,
      },
      subGuide1Name: String,
      subGuide2Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        default: null,
      },
      subGuide2Name: String,
      subGuide3Id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        default: null,
      },
      subGuide3Name: String,
    },

    // ========== BASIC DATA (بيانات أساسية) ==========
    basicData: {
      customerName: { type: String, required: true },
      customerPhone: { type: String, required: true, index: true },
      anotherContactNumber: String,
      nationality: String,
      country: String,
      cityRegion: String,
      gender: { type: String, enum: ["Male", "Female", "Other", ""] },
      email: { type: String, index: true },
    },

    // ========== CURRENT QUALIFICATION (بيانات الشهادة) ==========
    currentQualification: {
      // Common fields for all degree types
      certificateName: String,
      graduationYear: Number,
      grade: String,
      overallRating: String,
      studySystem: String,
      studyDuration: String,
      equivalencyRequirements: String,
      counselorNotes: String,

      // Bachelor-specific fields (for students seeking Bachelor degree)
      bachelor: {
        certificateTrack: String, // المسار (علمي/أدبي)
        availableColleges: [String],
      },

      // Master-seeker fields (students seeking Master - they hold Bachelor)
      masterSeeker: {
        bachelorSpecialization: String, // تخصص البكالوريوس
        bachelorCollege: String, // كلية البكالوريوس
        bachelorUniversity: String, // جامعة البكالوريوس
        bachelorCountry: String, // دولة شهادة البكالوريوس
        bachelorGraduationYear: Number, // سنة الحصول على البكالوريوس
        bachelorStudySystem: String, // نظام الدراسة
        bachelorRating: String, // تقدير
        bachelorGPA: String, // معدل
        creditHours: Number, // عدد الساعات المعتمدة
        studyDuration: String, // مدة الدراسة
      },

      // PhD-seeker fields (students seeking PhD - they hold Bachelor AND Master)
      phdSeeker: {
        // Bachelor degree information (first degree)
        bachelorSpecialization: String, // تخصص البكالوريوس
        bachelorSector: String, // قطاع تخصص البكالوريوس
        bachelorCollege: String, // كلية البكالوريوس
        bachelorUniversity: String, // جامعة البكالوريوس
        bachelorCountry: String, // دولة شهادة البكالوريوس
        bachelorGraduationYear: Number, // سنة الحصول على البكالوريوس
        bachelorStudySystem: String, // نظام الدراسة
        bachelorGPA: String, // معدل
        bachelorRating: String, // تقدير
        bachelorSemesters: String, // فصول دراسية
        
        // Master degree information (second degree)
        masterSpecialization: String, // تخصص الماجستير
        masterSector: String, // قطاع تخصص الماجستير
        masterCollege: String, // كلية الماجستير
        masterUniversity: String, // جامعة الماجستير
        masterCountry: String, // دولة شهادة الماجستير
        masterGraduationYear: Number, // سنة الحصول على الماجستير
        masterStudySystem: String, // نظام الدراسة
        masterDegreeType: String, // نوع الدرجة العلمية (بحثي/مهني)
        masterGPA: String, // معدل
        masterRating: String, // تقدير
        masterThesisTitle: String, // عنوان رسالة الماجستير
        studyDuration: String, // مدة الدراسة
      },

      // Diploma-seeker fields (future support)
      diplomaSeeker: {
        // To be defined based on requirements
      },

      // Documents (common for all types)
      otherDocuments: [
        {
          documentType: String,
          fileName: String,
          fileUrl: String,
          uploadedAt: Date,
          uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            default: null,
          },
        },
      ],
    },

    // ========== DESIRED DEGREE (بيانات الدرجة العلمية المطلوبة) ==========
    desiredProgram: {
      // Study destination - moved from marketingData
      studyDestination: { type: String, default: "Egypt" }, // الوجهة الدراسية
      
      // Common fields for all degree types
      desiredSpecialization: String,
      desiredSpecializationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Specialization",
        default: null,
      },
      desiredCollege: String,
      desiredCollegeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "College",
        default: null,
      },
      desiredUniversity: String,
      desiredUniversityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "University",
        default: null,
      },
      desiredStudySystem: String,
      desiredUniversityType: String,
      desiredStudyTime: String,
      desiredSector: String,

      // Bachelor-specific fields
      bachelor: {
        // Uses common fields only
      },

      // Master-specific fields
      master: {
        specificSpecialization: String, // التخصص الدقيق المطلوب
        studyMethod: String, // طريقة الدراسة المطلوب (حضوري/عن بعد/مختلط)
        masterType: String, // نوع الماجستير المطلوب (بحثي/مهني/مختلط)
      },

      // PhD-specific fields
      phd: {
        specificSpecialization: String, // التخصص الدقيق المطلوب
        studyMethod: String, // طريقة الدراسة المطلوب
        researchField: String, // مجال البحث المطلوب
      },

      // Diploma-specific fields (future support)
      diploma: {
        // To be defined based on requirements
      },
    },

    // ========== EVALUATION & STATUS ==========
    evaluation: {
      agentEvaluation: String,
      technicalOpinion: String,
      interestRate: String, // Removed enum to allow any value from dropdown
      interestPercentage: String, // نسبة الاهتمام
      counselorStatus: String,
      customerStatus: String,
      salesStatus: {
        type: String,
        default: "prospect",
        required: true,
        index: true,
      },
      bestTimeToContact: String,
      nextFollowupDate: { type: Date, index: true },
      additionalNotes: String,
    },

    // ========== LOSS TRACKING ==========
    lossData: {
      lossReason: String,
      lossNotes: String,
      lostAt: Date,
      lostBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        default: null,
      },
      lostByName: String,
    },

    // ========== ASSIGNMENT ==========
    assignment: {
      // PRIMARY AGENT (for backwards compatibility)
      assignedAgentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        index: true,
        default: null,
      },
      assignedAgentName: String,
      assignedAt: Date,
      assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Profile",
        default: null,
      },
      assignedByName: String,
      
      // MULTI-AGENT SUPPORT: Array of all agents who can access this customer
      assignedAgents: [
        {
          agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
            required: true,
          },
          agentName: {
            type: String,
            required: true,
          },
          assignedAt: {
            type: Date,
            default: Date.now,
          },
          assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
          },
          assignedByName: String,
          // Each agent has their own counselor status
          counselorStatus: {
            type: String,
            default: "",
          },
          isActive: {
            type: Boolean,
            default: true, // Can be set to false to remove access without deleting history
          },
        },
      ],
      
      // Assignment history (when agents are added/removed)
      assignmentHistory: [
        {
          action: {
            type: String,
            enum: ["assigned", "removed", "status_updated"],
          },
          agentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
          },
          agentName: String,
          performedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Profile",
          },
          performedByName: String,
          performedAt: {
            type: Date,
            default: Date.now,
          },
          reason: String,
          previousCounselorStatus: String, // For status_updated actions
          newCounselorStatus: String, // For status_updated actions
        },
      ],
    },

    // ========== METADATA ==========
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: Date,
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
    },
    deletedByName: String,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
    },
    createdByName: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      default: null,
    },
    updatedByName: String,

    // ========== STATS ==========
    stats: {
      totalFollowups: { type: Number, default: 0 },
      completedFollowups: { type: Number, default: 0 },
      lastFollowupDate: Date,
      daysSinceLastContact: Number,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for duplicate detection
customerSchema.index(
  { "basicData.customerPhone": 1, "basicData.email": 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { isDeleted: false },
  }
);

// Text search index
customerSchema.index({
  "basicData.customerName": "text",
  "basicData.email": "text",
  "basicData.customerPhone": "text",
  customerNumber: "text",
});

// Performance indexes for queries
customerSchema.index({ "assignment.assignedAgentId": 1 }); // For agent queries
customerSchema.index({ createdBy: 1 }); // For data entry queries
customerSchema.index({ createdAt: -1 }); // For date sorting
customerSchema.index({ degreeType: 1 }); // For degree filtering
customerSchema.index({ "evaluation.counselorStatus": 1 }); // For status filtering
customerSchema.index({ isDeleted: 1 }); // For soft delete queries

// Compound indexes for common query patterns
customerSchema.index({ "assignment.assignedAgentId": 1, degreeType: 1 }); // Agent + degree
customerSchema.index({ isDeleted: 1, createdAt: -1 }); // Active customers sorted by date

// Pre-save validation and cleanup
customerSchema.pre("save", function (next) {
  // Clean empty ObjectId strings (convert '' to null)
  const cleanObjectId = (obj, field) => {
    if (obj && obj[field] === "") {
      obj[field] = null;
    }
  };

  // Clean marketing data ObjectIds
  if (this.marketingData) {
    cleanObjectId(this.marketingData, "counselorId");
    cleanObjectId(this.marketingData, "subGuide1Id");
    cleanObjectId(this.marketingData, "subGuide2Id");
    cleanObjectId(this.marketingData, "subGuide3Id");
  }

  // Clean desired program ObjectIds
  if (this.desiredProgram) {
    cleanObjectId(this.desiredProgram, "desiredSpecializationId");
    cleanObjectId(this.desiredProgram, "desiredCollegeId");
    cleanObjectId(this.desiredProgram, "desiredUniversityId");
  }

  // Clean assignment ObjectIds
  if (this.assignment) {
    cleanObjectId(this.assignment, "assignedAgentId");
    cleanObjectId(this.assignment, "assignedBy");
  }

  // Validate degree type
  if (!this.degreeType) {
    this.degreeType = "bachelor"; // Default to bachelor if not set
  }

  // Validate loss reason when status is Lost
  if (
    this.evaluation &&
    this.evaluation.salesStatus === "Lost" &&
    !this.lossData?.lossReason
  ) {
    return next(new Error("Loss reason is required when sales status is Lost"));
  }

  // Calculate days since last contact
  if (this.stats && this.stats.lastFollowupDate) {
    const now = new Date();
    const lastContact = new Date(this.stats.lastFollowupDate);
    this.stats.daysSinceLastContact = Math.floor(
      (now - lastContact) / (1000 * 60 * 60 * 24)
    );
  }

  next();
});

// Virtual for full customer info
customerSchema.virtual("fullInfo").get(function () {
  return {
    id: this._id,
    number: this.customerNumber,
    name: this.basicData?.customerName,
    phone: this.basicData?.customerPhone,
    email: this.basicData?.email,
    status: this.evaluation?.salesStatus,
    interest: this.evaluation?.interestRate,
    assignedAgent: this.assignment?.assignedAgentName,
  };
});

// Ensure virtuals are included in JSON
customerSchema.set("toJSON", { virtuals: true });
customerSchema.set("toObject", { virtuals: true });

const Customer =
  mongoose.models?.Customer || mongoose.model("Customer", customerSchema);

export default Customer;
