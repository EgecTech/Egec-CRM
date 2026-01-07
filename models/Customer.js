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

    // ========== MARKETING DATA (بيانات التسويق) ==========
    marketingData: {
      requiredScientificInterface: String,
      studyDestination: { type: String, default: 'مصر' }, // الوجهة الدراسية
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
      certificateName: String,
      certificateTrack: String,
      grade: String,
      overallRating: String,
      graduationYear: Number,
      studySystem: String,
      equivalencyRequirements: String,
      availableColleges: [String],
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
      counselorNotes: String,
    },

    // ========== DESIRED DEGREE (بيانات الدرجة العلمية المطلوبة) ==========
    desiredProgram: {
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
