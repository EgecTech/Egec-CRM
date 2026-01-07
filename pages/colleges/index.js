// pages/colleges/index.js
import { SiBloglovin } from "react-icons/si";
import {
  FaPlus,
  FaSave,
  FaEdit,
  FaTrash,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Link from "next/link";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import LoginLayout from "@/components/LoginLayout";

export default function CollegesPage() {
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    sector: "",
    description: "",
    details: [],
  });
  const [universities, setUniversities] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePosition, setDeletePosition] = useState({ x: 0, y: 0 });

  // const printCollegesToConsole = () => {
  //   console.log("=== College Names ===");
  //   colleges.forEach((college, index) => {
  //     console.log(`${college.name} `);
  //   });
  //   console.log("===================");
  // };

  const sectors = [
    "القطاع الطبي",
    "القطاع الهندسي",
    "قطاع الحاسبات والمعلومات",
    "قطاع القانون",
    "القطاع التجاري",
    "القطاع التربوي",
    "قطاع العلوم",
    "قطاع العلوم السياسية",
    "قطاع الآداب",
    "قطاع الدراسات الإسلامية",
    "قطاع الإعلام",
    "قطاع السياحة والفنادق",
    "قطاع الزراعة",
    "قطاع التمريض",
    "قطاع الفنون الجميلة",
    "قطاع التربية الرياضية",
    "قطاع الخدمة الاجتماعية",
    "قطاع الآثار",
    "قطاع التعليم الصناعي",
    "قطاع الاقتصاد المنزلي",
    "قطاع حيواني و تغذية",
    "القطاع الزراعي والبيطري",
    "قطاع مختلط",
  ];

  useEffect(() => {
    fetchColleges();
    fetchUniversities();
  }, []);

  // Handle clicking outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".university-dropdown")) {
        setFormData((prev) => ({
          ...prev,
          details: prev.details.map((detail) => ({
            ...detail,
            showDropdown: false,
          })),
        }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fetchColleges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get("/api/colleges");
      // console.log("Fetched colleges:", response.data);
      setColleges(response.data);
    } catch (error) {
      console.error("Error fetching colleges:", error);
      setError(error.response?.data?.error || "Failed to fetch colleges");
      toast.error(error.response?.data?.error || "Failed to fetch colleges");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUniversities = async () => {
    try {
      const response = await axios.get("/api/universities/universities");
      setUniversities(response.data || []);
    } catch (error) {
      console.error("Error fetching universities:", error);
      // no toast to avoid noise on main page load
    }
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();

    if (!formData.name.trim() || !formData.sector) {
      toast.error("يرجى ملء جميع الحقول المطلوبة!");
      return;
    }

    setIsSubmitting(true);
    try {
      // sanitize details before submit
      const processedDetails = (formData.details || [])
        .filter(
          (d) =>
            d &&
            d.universityId &&
            d.universityName &&
            d.acceptanceRate !== "" &&
            d.acceptanceRate !== null &&
            !Number.isNaN(Number(d.acceptanceRate))
        )
        .map((d) => ({
          universityId: d.universityId,
          universityName: d.universityName,
          acceptanceRate: Number(d.acceptanceRate),
          requirements: (d.requirements || "").trim(),
        }));

      const payload = {
        ...formData,
        name: formData.name.trim(),
        sector: formData.sector,
        description: (formData.description || "").trim(),
        details: processedDetails,
      };

      if (editingId) {
        await axios.put(`/api/colleges/${editingId}`, payload);
        toast.success("تم تحديث الكلية بنجاح");
        setEditingId(null);
      } else {
        await axios.post("/api/colleges", payload);
        toast.success("تم إنشاء الكلية بنجاح");
      }
      setIsFormOpen(false);
      setFormData({ name: "", sector: "", description: "", details: [] });
      fetchColleges();
    } catch (error) {
      console.error("Error saving college:", error);
      toast.error("حدث خطأ أثناء حفظ الكلية");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (college) => {
    // console.log("Editing college:", college);
    // console.log("College details:", college.details);
    setEditingId(college._id);
    const mappedDetails = (college.details || []).map((detail) => ({
      ...detail,
      universitySearch: detail.universityName || "",
      showDropdown: false,
    }));
    // console.log("Mapped details:", mappedDetails);
    setFormData({
      name: college.name,
      sector: college.sector,
      description: college.description || "",
      details: mappedDetails,
    });
    setIsFormOpen(true);
  };

  const addDetail = () => {
    setFormData((prev) => ({
      ...prev,
      details: [
        ...prev.details,
        {
          universityId: "",
          universityName: "",
          acceptanceRate: "",
          requirements: "",
          universitySearch: "",
          showDropdown: false,
        },
      ],
    }));
  };

  const updateDetail = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.details];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, details: updated };
    });
  };

  const updateDetailFields = (index, updates) => {
    setFormData((prev) => {
      const updated = [...prev.details];
      updated[index] = { ...updated[index], ...updates };
      return { ...prev, details: updated };
    });
  };

  const removeDetail = (index) => {
    setFormData((prev) => {
      const updated = [...prev.details];
      updated.splice(index, 1);
      return { ...prev, details: updated };
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await axios.delete(`/api/colleges/${deleteId}`);
      toast.success("تم حذف الكلية بنجاح");
      setDeleteId(null);
      fetchColleges();
    } catch (error) {
      console.error("Error deleting college:", error);
      toast.error("حدث خطأ أثناء حذف الكلية");
    }
  };

  const handleDeleteClick = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setDeletePosition({ x: rect.left, y: rect.top });
    setDeleteId(id);
  };

  // Filter colleges based on search query
  const filteredColleges = colleges.filter((college) => {
    const matchesName = college.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSector = college.sector
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesName || matchesSector;
  });

  return (
    <LoginLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">الكليات</h1>
            <button
              onClick={() => {
                setEditingId(null);
                setFormData({
                  name: "",
                  sector: "",
                  description: "",
                  details: [],
                });
                setIsFormOpen(!isFormOpen);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="ml-2" />
              {isFormOpen ? "إغلاق النموذج" : "إضافة كلية"}
            </button>
            {/* <button
              onClick={printCollegesToConsole}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaCheck className="ml-2" />
              طباعة الكليات
            </button> */}
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <SiBloglovin /> <span>/ الكليات</span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="ابحث عن كلية أو قطاع..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Add/Edit College Form */}
        {isFormOpen && (
          <div className="mb-6 bg-white shadow-xl rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
              <h2 className="text-xl font-bold">
                {editingId ? "تعديل الكلية" : "إنشاء كلية جديدة"}
              </h2>
              <p className="text-indigo-100">
                {editingId ? "تحديث بيانات الكلية" : "إدخال معلومات الكلية"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* College Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  اسم الكلية <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="أدخل اسم الكلية"
                  value={formData.name}
                  onChange={(ev) =>
                    setFormData({ ...formData, name: ev.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  required
                />
              </div>

              {/* College Sector */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  القطاع <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.sector}
                  onChange={(ev) =>
                    setFormData({ ...formData, sector: ev.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  required
                >
                  <option value="">اختر القطاع</option>
                  {sectors.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {/* College Description */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  الوصف
                </label>
                <textarea
                  placeholder="أدخل وصف الكلية"
                  value={formData.description}
                  onChange={(ev) =>
                    setFormData({ ...formData, description: ev.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right min-h-[100px]"
                />
              </div>

              {/* Dynamic Details */}
              {/* <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700">
                    تفاصيل القبول حسب الجامعة
                  </label>
                  <button
                    type="button"
                    onClick={addDetail}
                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <FaPlus className="ml-1" /> إضافة تفاصيل
                  </button>
                </div>

                {formData.details && formData.details.length > 0 && (
                  <div className="space-y-4">
                    {formData.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start p-3 border rounded-md"
                      >
                        <div className="md:col-span-4">
                          <label className="block text-xs text-gray-600 mb-1">
                            الجامعة
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="ابحث واختر الجامعة"
                              value={detail.universitySearch || ""}
                              onChange={(e) => {
                                const searchValue = e.target.value;
                                updateDetail(
                                  idx,
                                  "universitySearch",
                                  searchValue
                                );
                                // Clear selection if search doesn't match current selection
                                if (detail.universityId) {
                                  const selectedUni = universities.find(
                                    (u) => u._id === detail.universityId
                                  );
                                  if (
                                    !selectedUni ||
                                    !selectedUni.name
                                      .toLowerCase()
                                      .includes(searchValue.toLowerCase())
                                  ) {
                                    updateDetailFields(idx, {
                                      universityId: "",
                                      universityName: "",
                                    });
                                  }
                                }
                              }}
                              onFocus={() =>
                                updateDetail(idx, "showDropdown", true)
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                            />
                            {detail.showDropdown && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto university-dropdown">
                                {(universities || [])
                                  .filter((u) => {
                                    const q = (
                                      detail.universitySearch || ""
                                    ).toLowerCase();
                                    return (
                                      !q ||
                                      (u.name || "").toLowerCase().includes(q)
                                    );
                                  })
                                  .slice(0, 10) // Limit to first 10 results
                                  .map((u) => (
                                    <div
                                      key={u._id}
                                      onClick={() => {
                                        updateDetailFields(idx, {
                                          universityId: u._id,
                                          universityName: u.name,
                                          universitySearch: u.name,
                                          showDropdown: false,
                                        });
                                      }}
                                      className="p-2 hover:bg-gray-100 cursor-pointer text-right border-b border-gray-100 last:border-b-0"
                                    >
                                      {u.name}
                                    </div>
                                  ))}
                                {(universities || []).filter((u) => {
                                  const q = (
                                    detail.universitySearch || ""
                                  ).toLowerCase();
                                  return (
                                    !q ||
                                    (u.name || "").toLowerCase().includes(q)
                                  );
                                }).length === 0 && (
                                  <div className="p-2 text-gray-500 text-center text-sm">
                                    لا توجد نتائج
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          {detail.universityId && (
                            <div className="mt-1 text-xs text-green-600">
                              تم اختيار: {detail.universityName}
                            </div>
                          )}
                        </div>

                        <div className="md:col-span-3">
                          <label className="block text-xs text-gray-600 mb-1">
                            نسبة القبول (%)
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            max="100"
                            required
                            placeholder="مثال: 75"
                            value={detail.acceptanceRate}
                            onChange={(e) =>
                              updateDetail(
                                idx,
                                "acceptanceRate",
                                e.target.value
                              )
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                          />
                        </div>

                        <div className="md:col-span-4">
                          <label className="block text-xs text-gray-600 mb-1">
                            المتطلبات
                          </label>
                          <textarea
                            rows={2}
                            placeholder="اكتب المتطلبات"
                            value={detail.requirements || ""}
                            onChange={(e) =>
                              updateDetail(idx, "requirements", e.target.value)
                            }
                            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                          />
                        </div>

                        <div className="md:col-span-1 flex md:justify-center">
                          <button
                            type="button"
                            onClick={() => removeDetail(idx)}
                            className="px-3 py-2 mt-6 md:mt-0 text-xs rounded-md bg-red-100 text-red-700 hover:bg-red-200"
                          >
                            حذف
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {(!formData.details || formData.details.length === 0) &&
                  editingId && (
                    <div className="text-center py-4 text-gray-500 text-sm">
                      لا توجد تفاصيل مضافة لهذه الكلية. يمكنك إضافة تفاصيل
                      جديدة.
                    </div>
                  )}
              </div> */}

              {/* Form Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingId(null);
                    setFormData({
                      name: "",
                      sector: "",
                      description: "",
                      details: [],
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <FaSave className="ml-2" />
                      {editingId ? "تحديث الكلية" : "حفظ الكلية"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="mr-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={fetchColleges}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredColleges.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              لا توجد كليات
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? "لا توجد نتائج للبحث" : "ابدأ بإضافة كليات جديدة"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaPlus className="ml-2" />
                إضافة كلية
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredColleges.map((college) => (
              <div
                key={college._id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-sm font-semibold text-gray-900">
                      {college.name}
                    </h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(college)}
                        className="p-2 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-full transition-colors"
                        title="تعديل"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, college._id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full transition-colors"
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <p className=" text-sm text-gray-500 mb-4">
                    {college.sector}
                  </p>
                  {college.description && (
                    <p className="text-xs text-gray-600 line-clamp-1">
                      {college.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteId && (
          <div className="absolute top-0 left-0 right-0 bg-red-600 text-white z-50 shadow-lg">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <FaTrash className="h-5 w-5 ml-2" />
                  <span className="font-medium">
                    هل أنت متأكد من حذف هذه الكلية؟ لا يمكن التراجع عن هذا
                    الإجراء.
                  </span>
                </div>
                <div className="flex items-center space-x-3 space-x-reverse gap-2">
                  <button
                    onClick={() => setDeleteId(null)}
                    className="px-3 py-1.5 bg-white text-red-600 rounded-md hover:bg-red-50 transition-colors"
                  >
                    <FaTimes className="ml-1.5 h-4 w-4 inline mx-1" />
                    إلغاء
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1.5 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors"
                  >
                    <FaTrash className="ml-1.5 h-4 w-4 inline mx-1" />
                    حذف
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add margin to main content when delete modal is shown */}
        <div className={deleteId ? "mt-14" : ""}>
          {/* Description Modal */}
          {showDeleteModal && deleteId && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full transform transition-all">
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    وصف الكلية
                  </h3>
                  <p className="text-gray-600 text-right mb-6 whitespace-pre-wrap">
                    {colleges.find((c) => c._id === deleteId)?.description}
                  </p>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteId(null);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </LoginLayout>
  );
}
