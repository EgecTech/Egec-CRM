// pages/crm/customers/create.js
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import LoginLayout from "@/components/LoginLayout";
import Loading from "@/components/Loading";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheck,
  FaExclamationTriangle,
} from "react-icons/fa";

const STEPS = [
  {
    id: 1,
    title: "Marketing Data",
    subtitle: "Lead source and counselor info",
    required: false,
  },
  {
    id: 2,
    title: "Basic Data",
    subtitle: "Customer contact information",
    required: true,
  },
  {
    id: 3,
    title: "Current Qualification",
    subtitle: "Educational background",
    required: false,
  },
  {
    id: 4,
    title: "Desired Program",
    subtitle: "Target university and specialization",
    required: false,
  },
  {
    id: 5,
    title: "Evaluation & Status",
    subtitle: "Assessment and follow-up",
    required: false,
  },
];

export default function CustomerCreate() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [duplicate, setDuplicate] = useState(null);
  const [systemSettings, setSystemSettings] = useState({});
  const [agents, setAgents] = useState([]);

  const [formData, setFormData] = useState({
    degreeType: "bachelor", // Default to bachelor
    marketingData: {
      requiredScientificInterface: "",
      studyDestination: "مصر", // Default to Egypt
      source: "",
      company: "EGEC", // Default to EGEC
      inquiryDate: new Date().toISOString().slice(0, 16), // Auto-set to current date and time
      inquiryReference: "",
      articleInquiry: "",
      counselorId: "",
      subGuide1Id: "",
      subGuide2Id: "",
      subGuide3Id: "",
    },
    basicData: {
      customerName: "",
      customerPhone: "",
      anotherContactNumber: "",
      nationality: "",
      country: "",
      cityRegion: "",
      gender: "",
      email: "",
    },
    currentQualification: {
      certificateName: "",
      grade: "",
      overallRating: "",
      graduationYear: "",
      studySystem: "",
      studyDuration: "",
      equivalencyRequirements: "",
      counselorNotes: "",
      bachelor: {
        certificateTrack: "",
        availableColleges: [],
      },
      masterSeeker: {
        bachelorSpecialization: "",
        bachelorCollege: "",
        bachelorUniversity: "",
        bachelorCountry: "",
        bachelorGraduationYear: "",
        bachelorStudySystem: "",
        bachelorRating: "",
        bachelorGPA: "",
        creditHours: "",
        studyDuration: "",
      },
      phdSeeker: {
        masterSpecialization: "",
        masterCollege: "",
        masterUniversity: "",
        masterCountry: "",
        masterGraduationYear: "",
        masterStudySystem: "",
        masterRating: "",
        masterGPA: "",
        masterThesisTitle: "",
        studyDuration: "",
      },
    },
    desiredProgram: {
      desiredSpecialization: "",
      desiredCollege: "",
      desiredUniversity: "",
      desiredStudySystem: "",
      desiredUniversityType: "",
      desiredStudyTime: "",
      desiredSector: "",
      master: {
        specificSpecialization: "",
        studyMethod: "",
        masterType: "",
      },
      phd: {
        specificSpecialization: "",
        studyMethod: "",
        researchField: "",
      },
    },
    evaluation: {
      agentEvaluation: "",
      technicalOpinion: "",
      interestRate: "",
      interestPercentage: "",
      counselorStatus: "",
      customerStatus: "",
      salesStatus: "prospect",
      bestTimeToContact: "",
      nextFollowupDate: "",
      additionalNotes: "",
    },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchSystemSettings();
      fetchAgents();
      loadDraft();
    }
  }, [status, router]);

  // Auto-save draft to localStorage
  useEffect(() => {
    if (status === "authenticated") {
      localStorage.setItem("customerDraft", JSON.stringify(formData));
    }
  }, [formData, status]);

  const fetchSystemSettings = async () => {
    try {
      console.log("🔄 Fetching system settings...");
      const response = await fetch("/api/crm/system-settings");
      console.log("Response status:", response.status);

      const data = await response.json();
      console.log("System settings response:", data);
      console.log("Number of settings:", data.data?.length);

      if (data.success && data.data) {
        const settings = {};
        data.data.forEach((setting) => {
          settings[setting.settingKey] = setting.settingValue;
          console.log(
            `Setting: ${setting.settingKey} = ${
              setting.settingValue?.length || 0
            } items`
          );
        });
        console.log("✅ Parsed settings:", settings);
        console.log(
          "✅ Study destinations count:",
          settings.study_destinations?.length
        );
        setSystemSettings(settings);
      } else {
        console.error("❌ Failed to load settings:", data);
      }
    } catch (err) {
      console.error("❌ Error fetching settings:", err);
    }
  };

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();

      console.log("Fetched users:", data);

      // Handle different response formats
      let usersList = [];
      if (Array.isArray(data)) {
        usersList = data;
      } else if (data.users && Array.isArray(data.users)) {
        usersList = data.users;
      } else if (data.data && Array.isArray(data.data)) {
        usersList = data.data;
      }

      // Filter only agent users
      const agentUsers = usersList.filter(
        (user) =>
          ["agent", "egecagent", "studyagent", "edugateagent"].includes(
            user.role
          ) && user.isActive
      );

      console.log("Filtered agents:", agentUsers);
      setAgents(agentUsers);
    } catch (err) {
      console.error("Error fetching agents:", err);
      setAgents([]);
    }
  };

  const loadDraft = () => {
    const draft = localStorage.getItem("customerDraft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // If draft doesn't have inquiry date, set it to current date/time
        if (!parsed.marketingData.inquiryDate) {
          parsed.marketingData.inquiryDate = new Date().toISOString().slice(0, 16);
        }
        setFormData(parsed);
      } catch (err) {
        console.error("Error loading draft:", err);
      }
    }
  };

  const checkDuplicate = async () => {
    const { customerPhone, email } = formData.basicData;
    if (!customerPhone) return;

    try {
      const response = await fetch("/api/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.status === 409) {
        setDuplicate(data.duplicate);
      } else {
        setDuplicate(null);
      }
    } catch (err) {
      console.error("Error checking duplicate:", err);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const validateStep = (step) => {
    if (step === 2) {
      // Basic data validation
      if (!formData.basicData.customerName) {
        setError("Customer name is required");
        return false;
      }
      if (!formData.basicData.customerPhone) {
        setError("Customer phone is required");
        return false;
      }
    }

    // Final validation before submit
    if (step === 5) {
      if (!formData.basicData.customerName) {
        setError("Customer name is required (Step 2)");
        setCurrentStep(2);
        return false;
      }
      if (!formData.basicData.customerPhone) {
        setError("Customer phone is required (Step 2)");
        setCurrentStep(2);
        return false;
      }
    }

    setError(null);
    return true;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 2) {
        checkDuplicate();
      }
      setCurrentStep((prev) => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    try {
      setLoading(true);
      setError(null);

      // Clean empty strings from ObjectId fields
      const cleanData = JSON.parse(JSON.stringify(formData));

      // Remove empty ObjectId fields
      if (cleanData.marketingData) {
        if (!cleanData.marketingData.counselorId)
          delete cleanData.marketingData.counselorId;
        if (!cleanData.marketingData.subGuide1Id)
          delete cleanData.marketingData.subGuide1Id;
        if (!cleanData.marketingData.subGuide2Id)
          delete cleanData.marketingData.subGuide2Id;
        if (!cleanData.marketingData.subGuide3Id)
          delete cleanData.marketingData.subGuide3Id;
      }

      if (cleanData.desiredProgram) {
        if (!cleanData.desiredProgram.desiredSpecializationId)
          delete cleanData.desiredProgram.desiredSpecializationId;
        if (!cleanData.desiredProgram.desiredCollegeId)
          delete cleanData.desiredProgram.desiredCollegeId;
        if (!cleanData.desiredProgram.desiredUniversityId)
          delete cleanData.desiredProgram.desiredUniversityId;
      }

      console.log("Submitting customer data:", cleanData);

      const response = await fetch("/api/crm/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Clear draft
        localStorage.removeItem("customerDraft");

        // Redirect to customer profile
        router.push(`/crm/customers/${data.data._id}`);
      } else {
        // Show detailed error
        if (data.errors && Array.isArray(data.errors)) {
          setError(data.errors.join(", "));
        } else {
          setError(data.error || data.message || "Failed to create customer");
        }

        if (data.duplicate) {
          setDuplicate(data.duplicate);
        }

        // Log for debugging
        console.error("Customer creation error:", data);
      }
    } catch (err) {
      console.error("Error creating customer:", err);
      setError("Failed to create customer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <LoginLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loading />
        </div>
      </LoginLayout>
    );
  }

  return (
    <LoginLayout>
      <Head>
        <title>Create Customer - EduGate CRM</title>
      </Head>

      <div className="min-h-screen bg-slate-50 py-8">
        <div className="max-w-4xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span className="text-sm font-semibold">Back</span>
            </button>
            <h1 className="text-3xl font-bold text-slate-900">
              Create New Customer
            </h1>
            <p className="text-slate-600 mt-2">
              Fill in customer information step by step
            </p>
          </div>

          {/* Progress Steps */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              {STEPS.map((step, idx) => (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        currentStep > step.id
                          ? "bg-emerald-500 text-white"
                          : currentStep === step.id
                          ? "bg-blue-500 text-white"
                          : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {currentStep > step.id ? <FaCheck /> : step.id}
                    </div>
                    <p
                      className={`text-xs font-semibold mt-2 text-center ${
                        currentStep === step.id
                          ? "text-blue-600"
                          : "text-slate-500"
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-2 ${
                        currentStep > step.id
                          ? "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Error/Warning Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <FaExclamationTriangle />
                <p className="font-semibold">{error}</p>
              </div>
            </div>
          )}

          {duplicate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-amber-800 mb-2">
                <FaExclamationTriangle />
                <p className="font-semibold">Potential Duplicate Found</p>
              </div>
              <p className="text-sm text-amber-700">
                Customer: {duplicate.name} ({duplicate.customerNumber})
                <br />
                Phone: {duplicate.phone}
                {duplicate.email && ` | Email: ${duplicate.email}`}
                {duplicate.assignedAgent &&
                  ` | Agent: ${duplicate.assignedAgent}`}
              </p>
              <div className="mt-3 flex gap-2">
                <Link href={`/crm/customers/${duplicate.id}`}>
                  <button className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold hover:bg-amber-700">
                    View Existing
                  </button>
                </Link>
                <button
                  onClick={() => setDuplicate(null)}
                  className="px-4 py-2 bg-white text-amber-700 border border-amber-300 rounded-lg text-sm font-semibold hover:bg-amber-50"
                >
                  Continue Anyway
                </button>
              </div>
            </div>
          )}

          {/* Form Content */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            {/* Step 1: Marketing Data */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Marketing Data (بيانات التسويق)
                </h2>

                {/* Degree Type Selector - Prominent */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                  <label className="block text-lg font-bold text-slate-900 mb-3">
                    🎓 نوع الدرجة العلمية المطلوبة (Degree Type) <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-slate-600 mb-4">
                    اختر نوع الدرجة التي يرغب العميل في دراستها
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { value: 'bachelor', label: 'بكالوريوس', icon: '🎓', color: 'blue' },
                      { value: 'master', label: 'ماجستير', icon: '📚', color: 'purple' },
                      { value: 'phd', label: 'دكتوراه', icon: '🔬', color: 'green' },
                      { value: 'diploma', label: 'دبلوم', icon: '📜', color: 'orange' }
                    ].map(degree => (
                      <button
                        key={degree.value}
                        type="button"
                        onClick={() => setFormData({...formData, degreeType: degree.value})}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          formData.degreeType === degree.value
                            ? `border-${degree.color}-500 bg-${degree.color}-50 shadow-lg`
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <div className="text-3xl mb-2">{degree.icon}</div>
                        <div className={`font-bold ${
                          formData.degreeType === degree.value ? `text-${degree.color}-700` : 'text-slate-700'
                        }`}>
                          {degree.label}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      الوجهة الدراسية (Study Destination)
                    </label>
                    <select
                      value={formData.marketingData.studyDestination}
                      onChange={(e) =>
                        handleInputChange(
                          "marketingData",
                          "studyDestination",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {(
                        systemSettings.study_destinations || [
                          "مصر",
                          "السعودية",
                          "الإمارات",
                          "تركيا",
                          "امريكا",
                          "بريطانيا",
                          "كندا",
                          "المانيا",
                        ]
                      ).map((dest) => (
                        <option key={dest} value={dest}>
                          {dest}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Source (المصدر)
                    </label>
                    <select
                      value={formData.marketingData.source}
                      onChange={(e) =>
                        handleInputChange(
                          "marketingData",
                          "source",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select source</option>
                      {(systemSettings.sources || []).map((source) => (
                        <option key={source} value={source}>
                          {source}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Company (الشركة)
                    </label>
                    <input
                      type="text"
                      value={formData.marketingData.company}
                      onChange={(e) =>
                        handleInputChange(
                          "marketingData",
                          "company",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Inquiry Date (تاريخ الاستفسار)
                    </label>
                    <input
                      type="datetime-local"
                      value={formData.marketingData.inquiryDate}
                      onChange={(e) =>
                        handleInputChange(
                          "marketingData",
                          "inquiryDate",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Reference Number (رقم المرجع)
                    </label>
                    <input
                      type="text"
                      value={formData.marketingData.inquiryReference}
                      onChange={(e) =>
                        handleInputChange(
                          "marketingData",
                          "inquiryReference",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter reference number"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Article/Inquiry (المقال/الاستفسار)
                  </label>
                  <textarea
                    value={formData.marketingData.articleInquiry}
                    onChange={(e) =>
                      handleInputChange(
                        "marketingData",
                        "articleInquiry",
                        e.target.value
                      )
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter inquiry details"
                  />
                </div>

                {/* Assign Agent - Admin/Superadmin only */}
                {(session?.user?.role === "admin" ||
                  session?.user?.role === "superadmin") && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      تعيين للمرشد (Assign to Agent)
                    </label>
                    <select
                      value={formData.marketingData.counselorId}
                      onChange={(e) => {
                        const selectedAgent = agents.find(
                          (a) => a._id === e.target.value
                        );
                        handleInputChange(
                          "marketingData",
                          "counselorId",
                          e.target.value
                        );
                        if (selectedAgent) {
                          handleInputChange(
                            "marketingData",
                            "counselorName",
                            selectedAgent.name
                          );
                        }
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">اختر المرشد / Select Agent</option>
                      {agents.length === 0 ? (
                        <option value="" disabled>
                          No agents available - Create agents in User Management
                          first
                        </option>
                      ) : (
                        agents.map((agent) => (
                          <option key={agent._id} value={agent._id}>
                            {agent.name} - {agent.email}
                          </option>
                        ))
                      )}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">
                      {agents.length === 0
                        ? "⚠️ No agents found. Create agent users in User Management first."
                        : `${agents.length} agent(s) available. This customer will be assigned to the selected agent.`}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Basic Data */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Basic Data (بيانات أساسية)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Customer Name (اسم العميل){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.basicData.customerName}
                      onChange={(e) =>
                        handleInputChange(
                          "basicData",
                          "customerName",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter customer full name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Customer Phone (رقم العميل){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.basicData.customerPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "basicData",
                          "customerPhone",
                          e.target.value
                        )
                      }
                      onBlur={checkDuplicate}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+966501234567"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Another Contact (رقم آخر)
                    </label>
                    <input
                      type="tel"
                      value={formData.basicData.anotherContactNumber}
                      onChange={(e) =>
                        handleInputChange(
                          "basicData",
                          "anotherContactNumber",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+966551234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.basicData.email}
                      onChange={(e) =>
                        handleInputChange("basicData", "email", e.target.value)
                      }
                      onBlur={checkDuplicate}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="customer@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Gender (الجنس)
                    </label>
                    <select
                      value={formData.basicData.gender}
                      onChange={(e) =>
                        handleInputChange("basicData", "gender", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      جنسية العميل
                    </label>
                    <select
                      value={formData.basicData.nationality}
                      onChange={(e) =>
                        handleInputChange(
                          "basicData",
                          "nationality",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">اختر الجنسية</option>
                      {(
                        systemSettings.nationalities || [
                          "سعودي",
                          "سوداني",
                          "غير معروف",
                          "سوري",
                          "مصري",
                          "يمني",
                          "فلسطيني",
                          "اردني",
                          "عراقي",
                          "ليبي",
                          "عماني",
                          "كويتي",
                          "اماراتي",
                          "جزائري",
                          "مغربي",
                          "بحريني",
                        ]
                      ).map((nat) => (
                        <option key={nat} value={nat}>
                          {nat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      دولة العميل
                    </label>
                    <select
                      value={formData.basicData.country}
                      onChange={(e) =>
                        handleInputChange(
                          "basicData",
                          "country",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">اختر الدولة</option>
                      {(
                        systemSettings.countries || [
                          "السعودية",
                          "مصر",
                          "الاردن",
                          "لبنان",
                          "سوريا",
                          "العراق",
                          "اليمن",
                          "الكويت",
                          "الإمارات",
                          "قطر",
                          "البحرين",
                          "عمان",
                          "فلسطين",
                          "السودان",
                        ]
                      ).map((country) => (
                        <option key={country} value={country}>
                          {country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      City/Region (المدينة)
                    </label>
                    <input
                      type="text"
                      value={formData.basicData.cityRegion}
                      onChange={(e) =>
                        handleInputChange(
                          "basicData",
                          "cityRegion",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter city or region"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Current Qualification */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Current Qualification (المؤهل الحالي)
                </h2>

                {/* Degree Type Indicator */}
                <div className="bg-slate-100 border border-slate-200 rounded-lg p-4 mb-4">
                  <p className="text-sm font-semibold text-slate-700">
                    Selected Degree Type: {' '}
                    <span className="text-blue-600">
                      {formData.degreeType === 'bachelor' && '🎓 بكالوريوس (Bachelor)'}
                      {formData.degreeType === 'master' && '📚 ماجستير (Master)'}
                      {formData.degreeType === 'phd' && '🔬 دكتوراه (PhD)'}
                      {formData.degreeType === 'diploma' && '📜 دبلوم (Diploma)'}
                    </span>
                  </p>
                </div>

                {/* Common Fields for All Degree Types */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Grade/GPA (المعدل)
                    </label>
                    <select
                      value={formData.currentQualification.grade}
                      onChange={(e) =>
                        handleInputChange(
                          "currentQualification",
                          "grade",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select grade</option>
                      {(
                        systemSettings.grades || [
                          "2.5",
                          "%10",
                          "%20",
                          "%30",
                          "%40",
                          "%50",
                          "%60",
                          "%70",
                          "%80",
                          "%90",
                          "%100",
                        ]
                      ).map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Overall Rating (التقدير)
                    </label>
                    <select
                      value={formData.currentQualification.overallRating}
                      onChange={(e) =>
                        handleInputChange(
                          "currentQualification",
                          "overallRating",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select rating</option>
                      {(systemSettings.certificate_ratings || []).map(
                        (rating) => (
                          <option key={rating} value={rating}>
                            {rating}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Study System (نظام الدراسة)
                    </label>
                    <select
                      value={formData.currentQualification.studySystem}
                      onChange={(e) =>
                        handleInputChange(
                          "currentQualification",
                          "studySystem",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select system</option>
                      {(systemSettings.study_systems || ['سنوي', 'فصلي', 'ساعات معتمدة']).map(
                        (system) => (
                          <option key={system} value={system}>
                            {system}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Graduation Year (سنة التخرج)
                    </label>
                    <input
                      type="number"
                      value={formData.currentQualification.graduationYear}
                      onChange={(e) =>
                        handleInputChange(
                          "currentQualification",
                          "graduationYear",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="2024"
                      min="1950"
                      max={new Date().getFullYear()}
                    />
                  </div>

                  {/* CONDITIONAL FIELDS BASED ON DEGREE TYPE */}
                  
                  {/* Bachelor-specific fields */}
                  {formData.degreeType === 'bachelor' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Certificate Track (المسار)
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.bachelor?.certificateTrack || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                bachelor: {
                                  ...formData.currentQualification.bachelor,
                                  certificateTrack: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., علمي، أدبي"
                        />
                      </div>
                    </>
                  )}

                  {/* Master-seeker fields (they hold Bachelor degree) */}
                  {formData.degreeType === 'master' && (
                    <>
                      <div className="col-span-2 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
                        <p className="text-sm font-semibold text-blue-900">
                          📚 معلومات شهادة البكالوريوس (الحاصل عليها الطالب)
                        </p>
                        <p className="text-xs text-blue-700 mt-1">
                          Bachelor's Degree Information (that the student already holds)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          تخصص البكالوريوس <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.masterSeeker?.bachelorSpecialization || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                masterSeeker: {
                                  ...formData.currentQualification.masterSeeker,
                                  bachelorSpecialization: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          كلية البكالوريوس
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.masterSeeker?.bachelorCollege || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                masterSeeker: {
                                  ...formData.currentQualification.masterSeeker,
                                  bachelorCollege: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., College of Engineering"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          جامعة البكالوريوس
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.masterSeeker?.bachelorUniversity || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                masterSeeker: {
                                  ...formData.currentQualification.masterSeeker,
                                  bachelorUniversity: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Cairo University"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          دولة شهادة البكالوريوس
                        </label>
                        <select
                          value={formData.currentQualification.masterSeeker?.bachelorCountry || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                masterSeeker: {
                                  ...formData.currentQualification.masterSeeker,
                                  bachelorCountry: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">اختر الدولة</option>
                          {(systemSettings.countries || []).map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          سنة الحصول على البكالوريوس
                        </label>
                        <input
                          type="number"
                          value={formData.currentQualification.masterSeeker?.bachelorGraduationYear || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                masterSeeker: {
                                  ...formData.currentQualification.masterSeeker,
                                  bachelorGraduationYear: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="2020"
                          min="1950"
                          max={new Date().getFullYear()}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          المعدل (GPA)
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.masterSeeker?.bachelorGPA || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                masterSeeker: {
                                  ...formData.currentQualification.masterSeeker,
                                  bachelorGPA: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 3.5/4.0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          عدد الساعات المعتمدة
                        </label>
                        <input
                          type="number"
                          value={formData.currentQualification.masterSeeker?.creditHours || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                masterSeeker: {
                                  ...formData.currentQualification.masterSeeker,
                                  creditHours: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 120"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          مدة الدراسة
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.masterSeeker?.studyDuration || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                masterSeeker: {
                                  ...formData.currentQualification.masterSeeker,
                                  studyDuration: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 4 years"
                        />
                      </div>
                    </>
                  )}

                  {/* PhD-seeker fields (they hold Master degree) */}
                  {formData.degreeType === 'phd' && (
                    <>
                      <div className="col-span-2 bg-green-50 border border-green-200 rounded-lg p-4 mb-2">
                        <p className="text-sm font-semibold text-green-900">
                          🔬 معلومات شهادة الماجستير (الحاصل عليها الطالب)
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Master's Degree Information (that the student already holds)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          تخصص الماجستير <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.phdSeeker?.masterSpecialization || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                phdSeeker: {
                                  ...formData.currentQualification.phdSeeker,
                                  masterSpecialization: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Computer Science"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          كلية الماجستير
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.phdSeeker?.masterCollege || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                phdSeeker: {
                                  ...formData.currentQualification.phdSeeker,
                                  masterCollege: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., College of Engineering"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          جامعة الماجستير
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.phdSeeker?.masterUniversity || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                phdSeeker: {
                                  ...formData.currentQualification.phdSeeker,
                                  masterUniversity: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., Cairo University"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          دولة شهادة الماجستير
                        </label>
                        <select
                          value={formData.currentQualification.phdSeeker?.masterCountry || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                phdSeeker: {
                                  ...formData.currentQualification.phdSeeker,
                                  masterCountry: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">اختر الدولة</option>
                          {(systemSettings.countries || []).map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          سنة الحصول على الماجستير
                        </label>
                        <input
                          type="number"
                          value={formData.currentQualification.phdSeeker?.masterGraduationYear || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                phdSeeker: {
                                  ...formData.currentQualification.phdSeeker,
                                  masterGraduationYear: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="2022"
                          min="1950"
                          max={new Date().getFullYear()}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          المعدل (GPA)
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.phdSeeker?.masterGPA || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                phdSeeker: {
                                  ...formData.currentQualification.phdSeeker,
                                  masterGPA: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 3.8/4.0"
                        />
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          عنوان رسالة الماجستير
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.phdSeeker?.masterThesisTitle || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                phdSeeker: {
                                  ...formData.currentQualification.phdSeeker,
                                  masterThesisTitle: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Master's thesis title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          مدة الدراسة
                        </label>
                        <input
                          type="text"
                          value={formData.currentQualification.phdSeeker?.studyDuration || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              currentQualification: {
                                ...formData.currentQualification,
                                phdSeeker: {
                                  ...formData.currentQualification.phdSeeker,
                                  studyDuration: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 2 years"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Counselor Notes - Common for all */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Counselor Notes (ملاحظات المرشد)
                  </label>
                  <textarea
                    value={formData.currentQualification.counselorNotes}
                    onChange={(e) =>
                      handleInputChange(
                        "currentQualification",
                        "counselorNotes",
                        e.target.value
                      )
                    }
                    rows={4}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any notes about the qualification"
                  />
                </div>
              </div>
            )}

            {/* Step 4: Desired Program */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Desired Program (البرنامج المطلوب)
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Desired University (الجامعة المطلوبة)
                    </label>
                    <input
                      type="text"
                      value={formData.desiredProgram.desiredUniversity}
                      onChange={(e) =>
                        handleInputChange(
                          "desiredProgram",
                          "desiredUniversity",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter university name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Desired College (الكلية المطلوبة)
                    </label>
                    <input
                      type="text"
                      value={formData.desiredProgram.desiredCollege}
                      onChange={(e) =>
                        handleInputChange(
                          "desiredProgram",
                          "desiredCollege",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter college name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Desired Specialization (التخصص المطلوب)
                    </label>
                    <input
                      type="text"
                      value={formData.desiredProgram.desiredSpecialization}
                      onChange={(e) =>
                        handleInputChange(
                          "desiredProgram",
                          "desiredSpecialization",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter specialization"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      نوع الجامعة
                    </label>
                    <select
                      value={formData.desiredProgram.desiredUniversityType}
                      onChange={(e) =>
                        handleInputChange(
                          "desiredProgram",
                          "desiredUniversityType",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">اختر النوع</option>
                      {(
                        systemSettings.university_types || [
                          "حكومية",
                          "أهلية",
                          "خاصة",
                        ]
                      ).map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Study Time (وقت الدراسة)
                    </label>
                    <select
                      value={formData.desiredProgram.desiredStudyTime}
                      onChange={(e) =>
                        handleInputChange(
                          "desiredProgram",
                          "desiredStudyTime",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select time</option>
                      {(systemSettings.study_times || []).map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CONDITIONAL FIELDS FOR MASTER */}
                  {formData.degreeType === 'master' && (
                    <>
                      <div className="col-span-2 bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4 mb-2">
                        <p className="text-sm font-semibold text-purple-900">
                          📚 معلومات إضافية للماجستير
                        </p>
                        <p className="text-xs text-purple-700 mt-1">
                          Additional Master's Program Information
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          التخصص الدقيق المطلوب
                        </label>
                        <input
                          type="text"
                          value={formData.desiredProgram.master?.specificSpecialization || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              desiredProgram: {
                                ...formData.desiredProgram,
                                master: {
                                  ...formData.desiredProgram.master,
                                  specificSpecialization: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Specific specialization"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          طريقة الدراسة المطلوب
                        </label>
                        <select
                          value={formData.desiredProgram.master?.studyMethod || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              desiredProgram: {
                                ...formData.desiredProgram,
                                master: {
                                  ...formData.desiredProgram.master,
                                  studyMethod: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">اختر طريقة الدراسة</option>
                          {(systemSettings.study_methods || ['حضوري', 'عن بعد', 'مختلط', 'تنفيذي']).map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          نوع الماجستير المطلوب
                        </label>
                        <select
                          value={formData.desiredProgram.master?.masterType || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              desiredProgram: {
                                ...formData.desiredProgram,
                                master: {
                                  ...formData.desiredProgram.master,
                                  masterType: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">اختر نوع الماجستير</option>
                          {(systemSettings.master_types || ['ماجستير بحثي', 'ماجستير مهني', 'ماجستير مختلط']).map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  {/* CONDITIONAL FIELDS FOR PHD */}
                  {formData.degreeType === 'phd' && (
                    <>
                      <div className="col-span-2 bg-green-50 border border-green-200 rounded-lg p-4 mt-4 mb-2">
                        <p className="text-sm font-semibold text-green-900">
                          🔬 معلومات إضافية للدكتوراه
                        </p>
                        <p className="text-xs text-green-700 mt-1">
                          Additional PhD Program Information
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          التخصص الدقيق المطلوب
                        </label>
                        <input
                          type="text"
                          value={formData.desiredProgram.phd?.specificSpecialization || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              desiredProgram: {
                                ...formData.desiredProgram,
                                phd: {
                                  ...formData.desiredProgram.phd,
                                  specificSpecialization: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Specific specialization"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          طريقة الدراسة المطلوب
                        </label>
                        <select
                          value={formData.desiredProgram.phd?.studyMethod || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              desiredProgram: {
                                ...formData.desiredProgram,
                                phd: {
                                  ...formData.desiredProgram.phd,
                                  studyMethod: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">اختر طريقة الدراسة</option>
                          {(systemSettings.study_methods || ['حضوري', 'عن بعد', 'مختلط']).map(method => (
                            <option key={method} value={method}>{method}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          مجال البحث المطلوب
                        </label>
                        <select
                          value={formData.desiredProgram.phd?.researchField || ''}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              desiredProgram: {
                                ...formData.desiredProgram,
                                phd: {
                                  ...formData.desiredProgram.phd,
                                  researchField: e.target.value
                                }
                              }
                            });
                          }}
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">اختر مجال البحث</option>
                          {(systemSettings.research_fields || ['علوم إنسانية', 'علوم طبيعية', 'هندسة', 'طب']).map(field => (
                            <option key={field} value={field}>{field}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Evaluation & Status */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 mb-6">
                  Evaluation & Status (التقييم والحالة)
                </h2>

                {session?.user?.role === "dataentry" ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                    <div className="text-5xl mb-4">✅</div>
                    <p className="text-xl font-bold text-blue-900 mb-2">
                      Customer Data Complete!
                    </p>
                    <p className="text-blue-700">
                      Status and evaluation fields will be managed by
                      Admin/Agent.
                      <br />
                      Click "Create Customer" below to finish.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          مستوى الاهتمام <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={formData.evaluation.interestRate}
                          onChange={(e) =>
                            handleInputChange(
                              "evaluation",
                              "interestRate",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">اختر المستوى</option>
                          <option value="interest">interest</option>
                          <option value="badtim">badtim</option>
                          <option value="Un Qualified">Un Qualified</option>
                          <option value="INprogres">INprogres</option>
                          <option value="Open Deal">Open Deal</option>
                          <option value="lost">lost</option>
                          <option value="Done Deal">Done Deal</option>
                          <option value="BadTiming">BadTiming</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Interest Percentage (نسبة الاهتمام)
                        </label>
                        <select
                          value={formData.evaluation.interestPercentage}
                          onChange={(e) =>
                            handleInputChange(
                              "evaluation",
                              "interestPercentage",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select percentage</option>
                          {(
                            systemSettings.interest_percentages || [
                              "%10",
                              "%20",
                              "%30",
                              "%40",
                              "%50",
                              "%60",
                              "%70",
                              "%80",
                              "%90",
                              "%100",
                            ]
                          ).map((pct) => (
                            <option key={pct} value={pct}>
                              {pct}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          حالة المبيعات
                        </label>
                        <select
                          value={formData.evaluation.salesStatus}
                          onChange={(e) =>
                            handleInputChange(
                              "evaluation",
                              "salesStatus",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {(
                            systemSettings.sales_statuses || [
                              "prospect",
                              "suspect",
                              "lost",
                              "forcast",
                              "potential",
                              "NOD",
                            ]
                          ).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          حالة المرشد
                        </label>
                        <select
                          value={formData.evaluation.counselorStatus}
                          onChange={(e) =>
                            handleInputChange(
                              "evaluation",
                              "counselorStatus",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">اختر الحالة</option>
                          {(
                            systemSettings.counselor_statuses || [
                              "متجاوب",
                              "استفسار",
                              "غ مهتم",
                              "غ مطابق",
                              "بعت ورق",
                              "ج مكتب",
                              "بيجهز الاوراق",
                              "تحويل",
                              "مهتم جدا",
                              "ب واتساب",
                              "س ببلد اخري",
                              "س ببلده",
                              "س بنفسه",
                              "رقم خطأ",
                              "س بالغلط",
                              "لاحق",
                              "جامعه غاليه",
                              "تم اولي",
                              "رسوم غاليه",
                              "عام قادم",
                              "لم يتخرج",
                              "منحة",
                              "غير رايه",
                              "كنسل نهائى",
                              "بلوك",
                              "NO Reach",
                              "س من قبل",
                            ]
                          ).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Next Follow-up Date (تاريخ المتابعة)
                        </label>
                        <input
                          type="date"
                          value={formData.evaluation.nextFollowupDate}
                          onChange={(e) =>
                            handleInputChange(
                              "evaluation",
                              "nextFollowupDate",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Customer Status (حالة العميل)
                        </label>
                        <select
                          value={formData.evaluation.customerStatus}
                          onChange={(e) =>
                            handleInputChange(
                              "evaluation",
                              "customerStatus",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select status</option>
                          {(
                            systemSettings.customer_statuses || [
                              "interest",
                              "Un Qualified",
                              "INprogres",
                              "Open Deal",
                              "Done Deal",
                              "lost",
                              "BadTiming",
                            ]
                          ).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">
                          Best Time to Contact (أفضل وقت للتواصل)
                        </label>
                        <input
                          type="text"
                          value={formData.evaluation.bestTimeToContact}
                          onChange={(e) =>
                            handleInputChange(
                              "evaluation",
                              "bestTimeToContact",
                              e.target.value
                            )
                          }
                          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 10 AM - 2 PM"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Additional Notes (ملاحظات إضافية)
                      </label>
                      <textarea
                        value={formData.evaluation.additionalNotes}
                        onChange={(e) =>
                          handleInputChange(
                            "evaluation",
                            "additionalNotes",
                            e.target.value
                          )
                        }
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Add any additional notes"
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-700 border border-slate-300 rounded-lg font-semibold hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaArrowLeft className="w-4 h-4" />
                Previous
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600"
                >
                  Next
                  <FaArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-green-600 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loading />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FaCheck className="w-4 h-4" />
                      Create Customer
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </LoginLayout>
  );
}
