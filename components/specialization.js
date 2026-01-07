import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FaPlus,
  FaTrash,
  FaUniversity,
  FaGraduationCap,
  FaLanguage,
  FaMoneyBillWave,
  FaSave,
  FaInfoCircle,
  FaArrowUp,
  FaCalendarAlt,
  FaCommentAlt,
  FaQuestionCircle,
} from "react-icons/fa";
import { MdSchool } from "react-icons/md";
import Spinner from "./Spinner";
import { useSession } from "next-auth/react";

export default function Specialization({
  _id,
  name: existingName,
  places: existingPlaces,
  status: existingStatus,
  specializationType: existingSpecializationType,
  specializationDepartment: existingSpecializationDepartment,
  sectorType: existingSectorType,
}) {
  const [redirect, setRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const router = useRouter();
  const formRef = useRef(null);
  const addPlaceBtnRef = useRef(null);

  const [name, setName] = useState(existingName || "");
  const [places, setPlaces] = useState([]);
  const [status, setStatus] = useState(existingStatus || "draft");
  const [specializationType, setSpecializationType] = useState(
    existingSpecializationType || ""
  );
  const [specializationDepartment, setSpecializationDepartment] = useState(
    existingSpecializationDepartment || ""
  );
  const [sectorType, setSectorType] = useState(existingSectorType || "");

  const [universities, setUniversities] = useState([]);
  const [degrees, setDegrees] = useState([]);
  const [collegesByUniversity, setCollegesByUniversity] = useState({});
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredUniversities, setFilteredUniversities] = useState([]);

  const { data: session } = useSession();

  // Add search filter effect
  useEffect(() => {
    if (universities.length > 0) {
      const filtered = universities.filter((uni) =>
        uni.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUniversities(filtered);
    }
  }, [searchTerm, universities]);

  // تحميل البيانات الأولية
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [universitiesRes, degreesRes] = await Promise.all([
          axios.get("/api/universities/universities"),
          axios.get("/api/degrees"),
        ]);

        setUniversities(universitiesRes.data);
        setDegrees(degreesRes.data);

        // إذا كان هناك أماكن موجودة مسبقاً، نقوم بتهيئتها
        if (existingPlaces?.length > 0) {
          const initializedPlaces = await Promise.all(
            existingPlaces.map(async (place) => {
              const universityId =
                place.universityId?._id || place.universityId;
              let colleges = [];

              if (universityId) {
                try {
                  const res = await axios.get(
                    `/api/universities/${universityId}/colleges`
                  );
                  colleges = res.data;
                  setCollegesByUniversity((prev) => ({
                    ...prev,
                    [universityId]: colleges,
                  }));
                } catch (error) {
                  console.error("Error loading colleges:", error);
                  toast.error("Failed to load colleges data");
                }
              }

              return {
                ...place,
                universityId: universityId || "",
                universityName:
                  place.universityName || place.universityId?.name || "",
                collegeName: place.collegeName || "",
                degreeFounded:
                  place.degreeFounded?.map((degree) => ({
                    ...degree,
                    degreeId: degree.degreeId?._id || degree.degreeId || "",
                    degreeName:
                      degree.degreeName || degree.degreeId?.name || "",
                    specializationDegreeRequirements:
                      degree.specializationDegreeRequirements || "",
                    studySystems:
                      degree.studySystems?.map((system) => ({
                        ...system,
                        StudySystemName: system.StudySystemName || "",
                        cost: system.cost || 0,
                        explanationCost: system.explanationCost || "",
                        studyPeriod: system.studyPeriod || 0,
                        explanationStudyPeriod:
                          system.explanationStudyPeriod || "",
                        language: system.language || "",
                      })) || [],
                  })) || [],
              };
            })
          );

          setPlaces(initializedPlaces);
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
        toast.error("Failed to load initial data");
      } finally {
        setIsInitializing(false);
        setIsInitialized(true);
      }
    };

    fetchInitialData();
  }, [_id, existingPlaces]);

  const handleUniversityChange = useCallback(
    async (universityId, placeIndex) => {
      if (!universityId) return;

      try {
        const res = await axios.get(
          `/api/universities/${universityId}/colleges`
        );
        const selectedUni = universities.find(
          (uni) => uni._id === universityId
        );

        setCollegesByUniversity((prev) => ({
          ...prev,
          [universityId]: res.data,
        }));

        setPlaces((prev) => {
          const updated = [...prev];
          updated[placeIndex] = {
            ...updated[placeIndex],
            universityId,
            universityName: selectedUni?.name || "",
            collegeName: res.data[0]?.name || "", // تعيين أول كلية كقيمة افتراضية
          };
          return updated;
        });
      } catch (error) {
        console.error("Error loading colleges:", error);
        toast.error("Failed to load colleges");
      }
    },
    [universities]
  );

  const handleDegreeChange = useCallback(
    (placeIndex, degreeIndex, degreeName) => {
      const selectedDegree = degrees.find((deg) => deg.name === degreeName);
      if (selectedDegree) {
        setPlaces((prev) => {
          const updated = [...prev];
          updated[placeIndex].degreeFounded[degreeIndex] = {
            ...updated[placeIndex].degreeFounded[degreeIndex],
            degreeId: selectedDegree._id,
            degreeName: selectedDegree.name,
          };
          return updated;
        });
      }
    },
    [degrees]
  );

  const addPlace = useCallback(() => {
    setPlaces((prev) => [
      ...prev,
      {
        universityId: undefined,
        universityName: "",
        collegeId: undefined,
        collegeName: "",
        degreeFounded: [
          {
            degreeId: undefined,
            degreeName: "",
            specializationDegreeRequirements: "",
            studySystems: [
              {
                StudySystemName: "",
                cost: 0,
                explanationCost: "",
                studyPeriod: 0,
                explanationStudyPeriod: "",
                language: "",
              },
            ],
          },
        ],
      },
    ]);

    setTimeout(() => {
      addPlaceBtnRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const updatePlace = useCallback((index, field, value) => {
    setPlaces((prev) => {
      const updated = [...prev];
      updated[index][field] = value;
      return updated;
    });
  }, []);

  const removePlace = useCallback((index) => {
    setPlaces((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addDegreeProgram = useCallback((placeIndex) => {
    setPlaces((prev) => {
      const updated = [...prev];
      updated[placeIndex].degreeFounded.push({
        degreeId: undefined,
        degreeName: "",
        specializationDegreeRequirements: "",
        studySystems: [
          {
            StudySystemName: "",
            cost: 0,
            explanationCost: "",
            studyPeriod: 0,
            explanationStudyPeriod: "",
            language: "",
          },
        ],
      });
      return updated;
    });
  }, []);

  const updateDegreeProgram = useCallback(
    (placeIndex, degreeIndex, field, value) => {
      setPlaces((prev) => {
        const updated = [...prev];
        updated[placeIndex].degreeFounded[degreeIndex][field] = value;
        return updated;
      });
    },
    []
  );

  const removeDegreeProgram = useCallback((placeIndex, degreeIndex) => {
    setPlaces((prev) => {
      const updated = [...prev];
      updated[placeIndex].degreeFounded = updated[
        placeIndex
      ].degreeFounded.filter((_, i) => i !== degreeIndex);
      return updated;
    });
  }, []);

  const addStudySystem = useCallback((placeIndex, degreeIndex) => {
    setPlaces((prev) => {
      const updated = [...prev];
      updated[placeIndex].degreeFounded[degreeIndex].studySystems.push({
        StudySystemName: "",
        cost: 0,
        explanationCost: "",
        studyPeriod: 0,
        explanationStudyPeriod: "",
        language: "",
      });
      return updated;
    });
  }, []);

  const updateStudySystem = useCallback(
    (placeIndex, degreeIndex, systemIndex, field, value) => {
      setPlaces((prev) => {
        const updated = [...prev];
        updated[placeIndex].degreeFounded[degreeIndex].studySystems[
          systemIndex
        ][field] = value;
        return updated;
      });
    },
    []
  );

  const removeStudySystem = useCallback(
    (placeIndex, degreeIndex, systemIndex) => {
      setPlaces((prev) => {
        const updated = [...prev];
        updated[placeIndex].degreeFounded[degreeIndex].studySystems = updated[
          placeIndex
        ].degreeFounded[degreeIndex].studySystems.filter(
          (_, i) => i !== systemIndex
        );
        return updated;
      });
    },
    []
  );

  const validateData = useCallback(() => {
    if (!name.trim()) {
      toast.error("يرجى إدخال اسم التخصص!");
      return false;
    }

    if (places.length === 0) {
      toast.error("يرجى إضافة مكان واحد على الأقل!");
      return false;
    }

    for (const place of places) {
      if (!place.universityName.trim()) {
        toast.error("يرجى إدخال اسم الجامعة!");
        return false;
      }

      if (!place.collegeName.trim()) {
        toast.error("يرجى إدخال اسم الكلية!");
        return false;
      }

      if (place.degreeFounded.length === 0) {
        toast.error("يجب أن يحتوي كل مكان على برنامج درجة واحدة على الأقل!");
        return false;
      }

      for (const degree of place.degreeFounded) {
        if (!degree.degreeName.trim()) {
          toast.error("يرجى إدخال اسم الدرجة العلمية!");
          return false;
        }

        if (degree.studySystems.length === 0) {
          toast.error("يجب إضافة نظام دراسة واحد على الأقل لكل برنامج درجة!");
          return false;
        }

        for (const system of degree.studySystems) {
          if (!system.StudySystemName.trim()) {
            toast.error("يرجى إدخال اسم نظام الدراسة!");
            return false;
          }
          if (system.cost <= 0) {
            toast.error("يرجى إدخال تكلفة صحيحة!");
            return false;
          }
          if (system.studyPeriod <= 0) {
            toast.error("يرجى إدخال مدة دراسة صحيحة!");
            return false;
          }
        }
      }
    }
    return true;
  }, [name, places]);

  const saveSpecialization = useCallback(
    async (ev) => {
      ev.preventDefault();

      if (!validateData()) return;

      setIsLoading(true);

      const data = {
        ...(_id && { _id }),
        name: name.trim(),
        specializationType: specializationType || undefined,
        specializationDepartment: specializationDepartment?.trim() || undefined,
        sectorType: sectorType?.trim() || undefined,
        status: status || "draft",
        places: places.map((place) => ({
          universityId: place.universityId || undefined,
          universityName: place.universityName.trim(),
          collegeId: place.collegeId || undefined,
          collegeName: place.collegeName.trim(),
          degreeFounded: place.degreeFounded.map((degree) => ({
            degreeId: degree.degreeId || undefined,
            degreeName: degree.degreeName.trim(),
            specializationDegreeRequirements:
              degree.specializationDegreeRequirements?.trim() || undefined,
            studySystems: degree.studySystems.map((system) => ({
              StudySystemName: system.StudySystemName.trim(),
              cost: Number(system.cost) || 0,
              explanationCost: system.explanationCost?.trim() || undefined,
              studyPeriod: Number(system.studyPeriod) || 0,
              explanationStudyPeriod:
                system.explanationStudyPeriod?.trim() || undefined,
              language: system.language?.trim() || undefined,
            })),
          })),
        })),
      };

      try {
        const response = await axios({
          method: _id ? "PUT" : "POST",
          url: _id ? `/api/specializations?id=${_id}` : "/api/specializations",
          data,
          headers: {
            "Content-Type": "application/json",
          },
        });

        toast.success(_id ? "تم تحديث التخصص بنجاح" : "تم إنشاء التخصص بنجاح");
        setRedirect(true);
      } catch (error) {
        console.error("Error saving specialization:", error);
        const errorMsg =
          error.response?.data?.error ||
          error.response?.data?.message ||
          "حدث خطأ أثناء الحفظ";
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [
      _id,
      name,
      places,
      status,
      specializationType,
      specializationDepartment,
      sectorType,
    ]
  );

  const scrollToTop = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (redirect) {
    router.push("/specializations");
    return null;
  }

  if (isInitializing) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="large" />
        <span className="ml-3 text-gray-600">جاري تحميل بيانات التخصص...</span>
      </div>
    );
  }

  return (
    <div className="relative max-w-4xl mx-auto p-4" ref={formRef}>
      <form
        onSubmit={saveSpecialization}
        className="bg-white shadow-lg rounded-xl overflow-hidden mb-20"
      >
        {/* Form Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {_id ? "تعديل التخصص" : "إنشاء تخصص جديد"}
          </h1>
          <p className="text-blue-100 opacity-90">
            {_id ? "قم بتحديث بيانات التخصص" : "أدخل معلومات التخصص الأساسية"}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Specialization Name */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم التخصص <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <MdSchool className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="أدخل اسم التخصص"
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={name}
                  onChange={(ev) => setName(ev.target.value)}
                  required
                />
              </div>
            </div>

            {/* Specialization Type */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                نوع التخصص <span className="text-red-500">*</span>
              </label>
              <select
                onChange={(ev) => setSpecializationType(ev.target.value)}
                value={specializationType}
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                required
              >
                <option value="">اختر نوع التخصص</option>
                <option value="عام">عام</option>
                <option value="دقيق">دقيق</option>
              </select>
              <div className="absolute left-3 top-9 text-gray-400">
                <FaInfoCircle />
              </div>
            </div>

            {/* Specialization Department */}
            {specializationType === "دقيق" ? (
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  القسم التابع له
                </label>
                <input
                  type="text"
                  placeholder="أدخل القسم التابع له"
                  className="block w-full pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                  value={specializationDepartment}
                  onChange={(ev) =>
                    setSpecializationDepartment(ev.target.value)
                  }
                />
              </div>
            ) : (
              ""
            )}

            {/* Sector Type */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                القطاع التابع له التخصص<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="أدخل القطاع التابع له التخصص"
                className="block w-full pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                value={sectorType}
                onChange={(ev) => setSectorType(ev.target.value)}
              />
            </div>

            {/* Status */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                الحالة <span className="text-red-500">*</span>
              </label>
              <select
                onChange={(ev) => setStatus(ev.target.value)}
                value={status}
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-right"
                required
              >
                <option value="">اختر الحالة</option>
                <option value="draft">مسودة</option>
                <option value="publish">نشر</option>
              </select>
            </div>
          </div>

          {/* Places Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                الأماكن المتاحة
              </h3>
              <button
                type="button"
                onClick={addPlace}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <FaPlus className="mr-2" />
                إضافة مكان
              </button>
            </div>

            {places.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-500">لم يتم إضافة أي أماكن بعد</p>
              </div>
            ) : (
              places.map((place, placeIndex) => (
                <div
                  key={placeIndex}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* University Selection */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الجامعة <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaUniversity className="text-gray-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="ابحث عن جامعة..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                        />
                        <select
                          onChange={(e) =>
                            handleUniversityChange(e.target.value, placeIndex)
                          }
                          value={place.universityId || ""}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">اختر الجامعة</option>
                          {filteredUniversities.map((uni) => (
                            <option key={uni._id} value={uni._id}>
                              {uni.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* College Selection */}
                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الكلية <span className="text-red-500">*</span>
                      </label>
                      <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <MdSchool className="text-gray-400" />
                        </div>
                        {collegesByUniversity[place.universityId] ? (
                          <select
                            onChange={(e) => {
                              const selectedCollege = collegesByUniversity[
                                place.universityId
                              ].find(
                                (college) =>
                                  college.collegeName === e.target.value
                              );
                              updatePlace(
                                placeIndex,
                                "collegeName",
                                e.target.value
                              );
                              updatePlace(
                                placeIndex,
                                "collegeId",
                                selectedCollege?.collegeId || undefined
                              );
                            }}
                            value={place.collegeName || ""}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                            disabled={!place.universityId}
                          >
                            {!place.collegeName && (
                              <option value="">اختر الكلية</option>
                            )}
                            {collegesByUniversity[place.universityId].map(
                              (college) => (
                                <option
                                  key={college._id || college.name}
                                  value={college.collegeName}
                                >
                                  {college.collegeName}
                                </option>
                              )
                            )}
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={place.collegeName || ""}
                            readOnly
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                            placeholder={
                              place.universityId
                                ? "جاري تحميل الكليات..."
                                : "اختر الجامعة أولاً"
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Degree Programs */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-md font-medium text-gray-700">
                        البرامج الدراسية
                      </h4>
                      <button
                        type="button"
                        onClick={() => addDegreeProgram(placeIndex)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-blue-500 hover:bg-blue-600"
                      >
                        <FaPlus className="mr-1" />
                        إضافة درجة علمية
                      </button>
                    </div>

                    {place.degreeFounded.map((degree, degreeIndex) => (
                      <div
                        key={degreeIndex}
                        className="border border-gray-200 rounded-md p-3 bg-white"
                      >
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            الدرجة العلمية{" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <FaGraduationCap className="text-gray-400" />
                            </div>
                            <select
                              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              required
                              value={degree.degreeName}
                              onChange={(e) => {
                                handleDegreeChange(
                                  placeIndex,
                                  degreeIndex,
                                  e.target.value
                                );
                                updateDegreeProgram(
                                  placeIndex,
                                  degreeIndex,
                                  "degreeName",
                                  e.target.value
                                );
                              }}
                            >
                              <option value="">اختر الدرجة العلمية</option>
                              {degrees.map((degreeItem) => (
                                <option
                                  key={degreeItem._id}
                                  value={degreeItem.name}
                                >
                                  {degreeItem.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Degree Requirements */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            متطلبات التخصص للدرجة
                          </label>
                          <textarea
                            placeholder="أدخل متطلبات التخصص لهذه الدرجة"
                            value={degree.specializationDegreeRequirements}
                            onChange={(e) =>
                              updateDegreeProgram(
                                placeIndex,
                                degreeIndex,
                                "specializationDegreeRequirements",
                                e.target.value
                              )
                            }
                            className="block w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="6"
                          />
                        </div>

                        {/* Study Systems */}
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700">
                              أنظمة الدراسة
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                addStudySystem(placeIndex, degreeIndex)
                              }
                              className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-500 hover:bg-green-600"
                            >
                              <FaPlus className="mr-1" />
                              إضافة نظام
                            </button>
                          </div>

                          {degree.studySystems.map((system, systemIndex) => (
                            <div
                              key={systemIndex}
                              className="space-y-3 bg-gray-50 p-3 rounded-md mb-3"
                            >
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Study System Name */}
                                <div className="relative">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    نظام الدراسة{" "}
                                    <span className="text-red-500">*</span>
                                  </label>
                                  <select
                                    className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    value={system.StudySystemName}
                                    onChange={(e) =>
                                      updateStudySystem(
                                        placeIndex,
                                        degreeIndex,
                                        systemIndex,
                                        "StudySystemName",
                                        e.target.value
                                      )
                                    }
                                  >
                                    <option value="">اختر النظام</option>
                                    <option value="نظام الانتظام">
                                      نظام الانتظام
                                    </option>
                                    <option value="نظام الانتساب">
                                      نظام الانتساب
                                    </option>
                                    <option value="نظام الساعات المعتمدة">
                                      نظام الساعات المعتمدة
                                    </option>
                                    <option value="نظام النقاط المعتمدة">
                                      نظام النقاط المعتمدة{" "}
                                    </option>
                                    <option value="نظام التعليم عن بعد">
                                      نظام التعليم عن بعد
                                    </option>
                                    <option value="نظام التعليم المدمج">
                                      نظام التعليم المدمج
                                    </option>
                                    <option value="نظام التعليم الإلكتروني">
                                      نظام التعليم الإلكتروني
                                    </option>
                                    <option value="النظام الهجين">
                                      النظام الهجين
                                    </option>
                                    <option value="النظام المكثف">
                                      النظام المكثف
                                    </option>
                                    <option value="نظام العام الواحد">
                                      نظام العام الواحد
                                    </option>
                                    <option value="نظام العامين">
                                      نظام العامين
                                    </option>
                                    <option value="نظام الفصلين الدراسيين">
                                      نظام الفصلين الدراسيين
                                    </option>
                                    <option value="نظام الترم الواحد">
                                      نظام الترم الواحد
                                    </option>
                                    <option value="نظام الساعات المرنة">
                                      نظام الساعات المرنة
                                    </option>
                                    <option value="النظام الدولي">
                                      النظام الدولي
                                    </option>
                                    <option value="النظام الخاص">
                                      النظام الخاص
                                    </option>
                                  </select>
                                </div>

                                {/* Language */}
                                <div className="relative">
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    اللغة
                                  </label>
                                  <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <FaLanguage className="text-gray-400" />
                                    </div>
                                    <select
                                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      value={system.language}
                                      onChange={(e) =>
                                        updateStudySystem(
                                          placeIndex,
                                          degreeIndex,
                                          systemIndex,
                                          "language",
                                          e.target.value
                                        )
                                      }
                                    >
                                      <option value="">اختر اللغة</option>
                                      <option value="Arabic - عربي">
                                        عربي (Arabic)
                                      </option>
                                      <option value="English - إنجليزي">
                                        إنجليزي (English)
                                      </option>
                                      <option value="French - فرنسي">
                                        فرنسي (French)
                                      </option>
                                      <option value="German - ألماني">
                                        ألماني (German)
                                      </option>
                                      <option value="Spanish - إسباني">
                                        إسباني (Spanish)
                                      </option>
                                      <option value="Chinese - صيني">
                                        صيني (Chinese)
                                      </option>
                                      <option value="Russian - روسي">
                                        روسي (Russian)
                                      </option>
                                      <option value="Turkish - تركي">
                                        تركي (Turkish)
                                      </option>
                                      <option value="Italian - إيطالي">
                                        إيطالي (Italian)
                                      </option>
                                      <option value="Japanese - ياباني">
                                        ياباني (Japanese)
                                      </option>

                                      <option value="Arabic/English - عربي/إنجليزي">
                                        عربي / إنجليزي (Arabic / English)
                                      </option>
                                      <option value="French/English - فرنسي/إنجليزي">
                                        فرنسي / إنجليزي (French / English)
                                      </option>
                                      <option value="German/English - ألماني/إنجليزي">
                                        ألماني / إنجليزي (German / English)
                                      </option>
                                      <option value="Turkish/English - تركي/إنجليزي">
                                        تركي / إنجليزي (Turkish / English)
                                      </option>
                                      <option value="Spanish/English - إسباني/إنجليزي">
                                        إسباني / إنجليزي (Spanish / English)
                                      </option>
                                      {/* اللغات الجديدة المطلوبة */}
                                      <option value="Arabic/French - عربي/فرنسي">
                                        عربي / فرنسي (Arabic / French)
                                      </option>
                                      <option value="Arabic/Italian - عربي/إيطالي">
                                        عربي / إيطالي (Arabic / Italian)
                                      </option>
                                      <option value="Arabic/Hebrew - عربي/عبري">
                                        عربي / عبري (Arabic / Hebrew)
                                      </option>
                                      <option value="Arabic/Persian - عربي/فارسي">
                                        عربي / فارسي (Arabic / Persian)
                                      </option>
                                      {/* الأزواج الجديدة المطلوبة */}
                                      <option value="Arabic/German - عربي/ألماني">
                                        عربي / ألماني (Arabic / German)
                                      </option>
                                      <option value="Arabic/Chinese - عربي/صيني">
                                        عربي / صيني (Arabic / Chinese)
                                      </option>
                                      <option value="Arabic/Russian - عربي/روسي">
                                        عربي / روسي (Arabic / Russian)
                                      </option>
                                      <option value="Arabic/Spanish - عربي/إسباني">
                                        عربي / إسباني (Arabic / Spanish)
                                      </option>
                                      <option value="Arabic/Japanese - عربي/ياباني">
                                        عربي / ياباني (Arabic / Japanese)
                                      </option>
                                      <option value="Arabic/French - عربي/فرنسي">
                                        عربي / فرنسي (Arabic / French)
                                      </option>
                                      <option value="Arabic/Turkish - عربي/تركي">
                                        عربي / تركي (Arabic / Turkish)
                                      </option>
                                      <option value="Arabic/Greek - عربي/يوناني">
                                        عربي / يوناني (Arabic / Greek)
                                      </option>
                                      <option value="Greek/Latin - يوناني/لاتيني">
                                        يوناني / لاتيني (Greek / Latin)
                                      </option>
                                      <option value="Arabic/Persian - عربي/فارسي">
                                        عربي / فارسي (Arabic / Persian)
                                      </option>
                                      {/* لغة ثلاثية */}
                                      <option value="English/French/German - إنجليزي/فرنسي/ألماني">
                                        إنجليزي / فرنسي / ألماني (English /
                                        French / German)
                                      </option>
                                    </select>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Cost */}
                                <div className="relative">
                                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    التكلفة{" "}
                                    <span className="text-red-500 mr-1">*</span>
                                    <span
                                      className="text-gray-400 ml-1 cursor-help"
                                      title="التكلفة السنوية للدراسة"
                                    >
                                      <FaQuestionCircle size={14} />
                                    </span>
                                  </label>
                                  <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <FaMoneyBillWave className="text-gray-400" />
                                    </div>
                                    <input
                                      type="number"
                                      placeholder="مبلغ التكلفة"
                                      value={system.cost}
                                      onChange={(e) =>
                                        updateStudySystem(
                                          placeIndex,
                                          degreeIndex,
                                          systemIndex,
                                          "cost",
                                          e.target.value
                                        )
                                      }
                                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                      min="0"
                                      step="any"
                                    />
                                  </div>
                                </div>

                                {/* Cost Explanation */}
                                <div className="relative">
                                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    شرح التكلفة
                                    <span
                                      className="text-gray-400 mr-1 cursor-help"
                                      title="مثال: 5000 جنيه سنوياً أو تقسيط على 4 أقساط"
                                    >
                                      <FaQuestionCircle size={14} />
                                    </span>
                                  </label>
                                  <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                                      <FaCommentAlt className="text-gray-400" />
                                    </div>
                                    <textarea
                                      placeholder="أدخل شرحاً مفصلاً للتكلفة"
                                      value={system.explanationCost}
                                      onChange={(e) =>
                                        updateStudySystem(
                                          placeIndex,
                                          degreeIndex,
                                          systemIndex,
                                          "explanationCost",
                                          e.target.value
                                        )
                                      }
                                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      rows="2"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Study Period */}
                                <div className="relative">
                                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    مدة الدراسة (سنوات){" "}
                                    <span className="text-red-500 mr-1">*</span>
                                    <span
                                      className="text-gray-400 ml-1 cursor-help"
                                      title="عدد السنوات الدراسية المطلوبة"
                                    >
                                      <FaQuestionCircle size={14} />
                                    </span>
                                  </label>
                                  <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <FaCalendarAlt className="text-gray-400" />
                                    </div>
                                    <input
                                      type="number"
                                      placeholder="عدد السنوات"
                                      value={system.studyPeriod}
                                      onChange={(e) =>
                                        updateStudySystem(
                                          placeIndex,
                                          degreeIndex,
                                          systemIndex,
                                          "studyPeriod",
                                          e.target.value
                                        )
                                      }
                                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      required
                                      min="0"
                                      step="any"
                                    />
                                  </div>
                                </div>

                                {/* Study Period Explanation */}
                                <div className="relative">
                                  <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
                                    شرح المدة
                                    <span
                                      className="text-gray-400 mr-1 cursor-help"
                                      title="مثال: 4 سنوات دراسية + سنة امتياز"
                                    >
                                      <FaQuestionCircle size={14} />
                                    </span>
                                  </label>
                                  <div className="relative rounded-md shadow-sm">
                                    <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none">
                                      <FaCommentAlt className="text-gray-400" />
                                    </div>
                                    <textarea
                                      placeholder="أدخل شرحاً مفصلاً للمدة"
                                      value={system.explanationStudyPeriod}
                                      onChange={(e) =>
                                        updateStudySystem(
                                          placeIndex,
                                          degreeIndex,
                                          systemIndex,
                                          "explanationStudyPeriod",
                                          e.target.value
                                        )
                                      }
                                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      rows="2"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <button
                                  type="button"
                                  className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600"
                                  onClick={() =>
                                    removeStudySystem(
                                      placeIndex,
                                      degreeIndex,
                                      systemIndex
                                    )
                                  }
                                >
                                  <FaTrash className="mr-1" />
                                  إزالة النظام
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Remove Degree Button */}
                        <div className="mt-3 flex justify-end">
                          <button
                            type="button"
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-400 hover:bg-red-500"
                            onClick={() =>
                              removeDegreeProgram(placeIndex, degreeIndex)
                            }
                          >
                            <FaTrash className="mr-1" />
                            إزلة الدرجة العلمية
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Remove Place Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => removePlace(placeIndex)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700"
                    >
                      <FaTrash className="mr-1" />
                      إزالة المكان
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner size="small" className="mr-2" />
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  {_id ? "تحديث التخصص" : "حفظ التخصص"}
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-4 left-4 max-w-4xl mx-auto flex justify-between z-10">
        {/* Scroll to Top Button */}
        <button
          type="button"
          onClick={scrollToTop}
          className="p-2 bg-indigo-600 text-white rounded-full shadow-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-110"
          title="التمرير إلى الأعلى"
        >
          <FaArrowUp className="w-5 h-5" />
        </button>

        {/* Add New Place Button */}
        <button
          type="button"
          onClick={addPlace}
          className="flex items-center px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105"
          ref={addPlaceBtnRef}
        >
          <FaPlus className="w-5 h-5 mr-2" />
          <span className="font-medium">إضافة مكان جديد</span>
        </button>
      </div>
    </div>
  );
}
