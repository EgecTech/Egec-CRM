import ReactMarkdown from "react-markdown";
import MarkdownEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import {
  FaCloudUploadAlt,
  FaPlus,
  FaTrash,
  FaGlobe,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";
import Spinner from "./Spinner";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { ReactSortable } from "react-sortablejs";
import { MdDeleteForever, MdFoundation, MdSchool } from "react-icons/md";

export default function University({
  _id,
  name: existingName,
  country: existingCountry,
  email: existingEmail,
  establishment: existingEstablishment,
  website: existingWebsite,
  phone: existingPhone,
  location: existingLocation,
  universityType: existingUniversityType,
  contract: existingContract,
  images: existingImages,
  status: existingStatus,
  colleges: existingColleges,
  timesRanking: existingTimesRanking,
  cwurRanking: existingCwurRanking,
  shanghaiRanking: existingShanghaiRanking,
  qsRanking: existingQsRanking,
  accreditation: existingAccreditation,
  accreditationCountries: existingAccreditationCountries,
  universityConditions: existingUniversityConditions,
}) {
  // console.log(
  //   "University component - existingUniversityConditions:",
  //   existingUniversityConditions
  // );
  // console.log(
  //   "University component - Type of existingUniversityConditions:",
  //   typeof existingUniversityConditions
  // );

  const [redirect, setRedirect] = useState(false);
  const router = useRouter();

  const [name, setName] = useState(existingName || "");
  const [country, setCountry] = useState(existingCountry || "");
  const [email, setEmail] = useState(existingEmail || "");
  const [establishment, setEstablishment] = useState(
    existingEstablishment || ""
  );
  const [website, setWebsite] = useState(existingWebsite || "");
  const [phone, setPhone] = useState(existingPhone || "");
  const [location, setLocation] = useState(existingLocation || "");
  const [universityType, setUniversityType] = useState(
    existingUniversityType || ""
  );
  const [contract, setContract] = useState(existingContract || "");
  const [images, setImages] = useState(existingImages || []);
  const [status, setStatus] = useState(existingStatus || "");
  const [timesRanking, setTimesRanking] = useState(existingTimesRanking || "");
  const [cwurRanking, setCwurRanking] = useState(existingCwurRanking || "");
  const [shanghaiRanking, setShanghaiRanking] = useState(
    existingShanghaiRanking || ""
  );
  const [qsRanking, setQsRanking] = useState(existingQsRanking || "");
  const [accreditation, setAccreditation] = useState(
    existingAccreditation || ""
  );
  const [accreditationCountries, setAccreditationCountries] = useState(
    existingAccreditationCountries || []
  );
  const [universityConditions, setUniversityConditions] = useState(
    existingUniversityConditions || ""
  );

  // console.log(
  //   "University component - universityConditions state:",
  //   universityConditions
  // );

  const [isUploading, setIsUpLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("basic");
  const [availableColleges, setAvailableColleges] = useState([]);
  const gradeOptions = ["امتياز", "جيد جدًا", "جيد", "مقبول"];

  const normalizeCollege = (college = {}) => ({
    collegeId: college.collegeId || college._id || "",
    collegeName: college.collegeName || college.name || "",
    bachelorRate:
      college.bachelorRate === 0 ||
      typeof college.bachelorRate === "number" ||
      (typeof college.bachelorRate === "string" && college.bachelorRate.length)
        ? String(college.bachelorRate)
        : "",
    masterRate: college.masterRate || "",
    doctorateRate: college.doctorateRate || "",
  });

  const normalizedExistingColleges = (existingColleges || []).map(
    normalizeCollege
  );

  const [selectedColleges, setSelectedColleges] = useState(
    normalizedExistingColleges
  );
  const [isLoadingColleges, setIsLoadingColleges] = useState(false);
  const [collegeSearchQuery, setCollegeSearchQuery] = useState("");
  const countries = [
    // Arab Countries (including the Gulf)
    "Egypt",
    "Saudi Arabia",
    "United Arab Emirates",
    "Kuwait",
    "Qatar",
    "Bahrain",
    "Oman",
    "Yemen",
    "Jordan",
    "Syria",
    "Lebanon",
    "Palestine",
    "Iraq",
    "Libya",
    "Sudan",
    "Morocco",
    "Algeria",
    "Tunisia",
    "Mauritania",
    "Comoros",
    "Somalia",
    "Djibouti",

    // Middle Eastern Countries (non-Arab additions)
    "Turkey",
    "Iran",
    "Cyprus",

    // Top 20 Study Abroad Destinations
    "United States",
    "Canada",
    "United Kingdom",
    "Germany",
    "Australia",
    "France",
    "Malaysia",
    "Netherlands",
    "China",
    "Japan",
    "South Korea",
    "Italy",
    "Sweden",
    "Switzerland",
    "Ireland",
    "Russia",
    "Hungary",
    "New Zealand",
    "India",
    "Spain",
  ];

  const tabs = [
    {
      id: "basic",
      label: "المعلومات الأساسية",
      icon: <FaInfoCircle className="ml-2" />,
    },
    {
      id: "contact",
      label: "معلومات التواصل",
      icon: <FaMapMarkerAlt className="ml-2" />,
    },
    {
      id: "media",
      label: "الصور والتصنيفات",
      icon: <FaCloudUploadAlt className="ml-2" />,
    },
    { id: "colleges", label: "الكليات", icon: <MdSchool className="ml-2" /> },
    {
      id: "conditions",
      label: "شروط الجامعة",
      icon: <FaInfoCircle className="ml-2" />,
    },
  ];

  useEffect(() => {
    fetchColleges();
  }, []);

  const fetchColleges = async () => {
    try {
      setIsLoadingColleges(true);
      const response = await axios.get("/api/colleges");
      setAvailableColleges(response.data);
    } catch (error) {
      toast.error("Failed to fetch colleges");
    } finally {
      setIsLoadingColleges(false);
    }
  };

  const handleCollegeSelection = (college) => {
    setSelectedColleges((prev) => {
      const exists = prev.some((c) => c.collegeId === college._id);
      if (exists) {
        return prev.filter((c) => c.collegeId !== college._id);
      }
      return [...prev, normalizeCollege(college)];
    });
  };

  const handleSelectedCollegeChange = (collegeId, field, value) => {
    setSelectedColleges((prev) =>
      prev.map((college) =>
        college.collegeId === collegeId
          ? { ...college, [field]: value }
          : college
      )
    );
  };

  async function createUnversity(ev) {
    ev.preventDefault();

    if (!name.trim() || !status.trim()) {
      toast.error("يرجى ملء جميع الحقول المطلوبة!");
      return;
    }

    const data = {
      name,
      country,
      email,
      establishment,
      website,
      phone,
      location,
      universityType,
      contract,
      images,
      status,
      colleges: selectedColleges.map((college) => ({
        collegeId: college.collegeId,
        collegeName: college.collegeName,
        bachelorRate:
          college.bachelorRate === "" || college.bachelorRate === null
            ? undefined
            : Number(college.bachelorRate),
        masterRate: college.masterRate || undefined,
        doctorateRate: college.doctorateRate || undefined,
      })),
      timesRanking,
      cwurRanking,
      shanghaiRanking,
      qsRanking,
      accreditation,
      accreditationCountries:
        accreditation === "معتمدة" ? accreditationCountries : [],
      universityConditions,
    };

    // console.log("createUnversity - Sending data:", data);
    // console.log(
    //   "createUnversity - universityConditions being sent:",
    //   universityConditions
    // );

    try {
      if (_id) {
        await axios.put("/api/universities/universities", { ...data, _id });
        toast.success("تم تحديث الجامعة بنجاح");
      } else {
        await axios.post("/api/universities/universities", data);
        toast.success("تم إنشاء الجامعة بنجاح");
      }
      setRedirect(true);
    } catch (error) {
      toast.error("حدث خطأ أثناء حفظ الجامعة");
    }
  }

  async function uploadImages(ev) {
    const files = ev.target?.files;
    if (!files?.length) return;

    setIsUpLoading(true);
    try {
      const uploads = Array.from(files).map((file) => {
        const data = new FormData();
        data.append("file", file);
        return axios.post("/api/upload", data);
      });

      const results = await Promise.all(uploads);
      const newImages = results.flatMap((res) => res.data.links);
      setImages((prev) => [...prev, ...newImages]);
      toast.success(`تم رفع ${files.length} صورة بنجاح`);
    } catch (error) {
      toast.error("فشل رفع الصور");
    } finally {
      setIsUpLoading(false);
    }
  }

  function updateImagesOrder(newImages) {
    setImages(newImages);
  }

  function handleDeleteImage(index) {
    if (window.confirm("هل تريد حذف هذه الصورة؟")) {
      setImages(images.filter((_, i) => i !== index));
      toast.success("تم حذف الصورة بنجاح");
    }
  }

  // Filter colleges based on search query
  const filteredAvailableColleges = availableColleges.filter((college) => {
    const matchesName = college.name
      .toLowerCase()
      .includes(collegeSearchQuery.toLowerCase());
    const matchesSector = college.sector
      ?.toLowerCase()
      .includes(collegeSearchQuery.toLowerCase());
    return matchesName || matchesSector;
  });

  if (redirect) {
    router.push("/universities/draftuniversities");
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <form
        onSubmit={createUnversity}
        className="bg-white shadow-xl rounded-xl overflow-hidden"
      >
        {/* Form Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h1 className="text-2xl font-bold">
            {_id ? "تعديل الجامعة" : "إنشاء جامعة جديدة"}
          </h1>
          <p className="text-indigo-100">
            {_id ? "تحديث بيانات الجامعة" : "إدخال معلومات الجامعة"}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
                {tab.icon}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information Tab */}
          {activeTab === "basic" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  اسم الجامعة <span className="text-red-500">*</span>
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <MdSchool className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="name"
                    placeholder="أدخل اسم الجامعة"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    value={name}
                    onChange={(ev) => setName(ev.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  الدولة
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaGlobe className="text-gray-400" />
                  </div>
                  <select
                    id="country"
                    value={country}
                    onChange={(ev) => setCountry(ev.target.value)}
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                  >
                    <option value="">🌍Select Country</option>

                    <option value="Egypt">Egypt</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="United Arab Emirates">
                      United Arab Emirates
                    </option>
                    <option value="Qatar">Qatar</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Oman">Oman</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Lebanon">Lebanon</option>
                    <option value="Iraq">Iraq</option>
                    <option value="Palestine">Palestine</option>
                    <option value="Syria">Syria</option>
                    <option value="Yemen">Yemen</option>
                    <option value="Sudan">Sudan</option>
                    <option value="Libya">Libya</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Mauritania">Mauritania</option>
                    <option value="Comoros">Comoros</option>
                    <option value="Somalia">Somalia</option>
                    <option value="Djibouti">Djibouti</option>

                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Canada">Canada</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                    <option value="France">France</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Japan">Japan</option>
                    <option value="South Korea">South Korea</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Cyprus">Cyprus</option>
                    <option value="Hungary">Hungary</option>
                  </select>
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="universityType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  نوع الجامعة
                </label>
                <select
                  id="universityType"
                  value={universityType}
                  onChange={(ev) => setUniversityType(ev.target.value)}
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                >
                  <option value="">اختر النوع</option>
                  <option value="حكومية">حكومية</option>
                  <option value="خاصة">خاصة</option>
                  <option value="أهلية">أهلية</option>
                  <option value="دولية">دولية</option>
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="contract"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  حالة التعاقد
                </label>
                <select
                  id="contract"
                  value={contract}
                  onChange={(ev) => setContract(ev.target.value)}
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                >
                  <option value="">اختر حالة التعاقد</option>
                  <option value="متعاقد">متعاقد</option>
                  <option value="غير متعاقد">غير متعاقد</option>
                </select>
              </div>

              <div className="relative">
                <label
                  htmlFor="establishment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  تأسيس الجامعة
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <MdFoundation className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="establishment"
                    placeholder="أدخل تاريخ تأسيس الجامعة"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    value={establishment}
                    onChange={(ev) => setEstablishment(ev.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="accreditation"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  الاعتماد
                </label>
                <select
                  id="accreditation"
                  value={accreditation}
                  onChange={(ev) => setAccreditation(ev.target.value)}
                  className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                >
                  <option value="">اختر حالة الاعتماد</option>
                  <option value="معتمدة">معتمدة</option>
                  <option value="غير معتمدة">غير معتمدة</option>
                </select>
              </div>

              {accreditation === "معتمدة" && (
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    الدول المعتمدة بها
                  </label>
                  <select
                    multiple
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-h-[200px] text-right"
                    value={accreditationCountries}
                    onChange={(e) =>
                      setAccreditationCountries(
                        Array.from(e.target.selectedOptions, (o) => o.value)
                      )
                    }
                  >
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500">
                    اضغط على Ctrl/Cmd لتحديد أكثر من دولة
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Contact Details Tab */}
          {activeTab === "contact" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="relative">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaEnvelope className="text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    placeholder="بريد الجامعة الإلكتروني"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    value={email}
                    onChange={(ev) => setEmail(ev.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="website"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  الموقع الإلكتروني
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaGlobe className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="website"
                    placeholder="رابط الموقع الإلكتروني"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    value={website}
                    onChange={(ev) => setWebsite(ev.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  رقم الهاتف
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaPhone className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="phone"
                    placeholder="رقم هاتف الجامعة"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    value={phone}
                    onChange={(ev) => setPhone(ev.target.value)}
                  />
                </div>
              </div>

              <div className="relative">
                <label
                  htmlFor="location"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  الموقع الجغرافي
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <FaMapMarkerAlt className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="location"
                    placeholder="عنوان الجامعة"
                    className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                    value={location}
                    onChange={(ev) => setLocation(ev.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Media & Rankings Tab */}
          {activeTab === "media" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  شعار الجامعة والصور
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:border-indigo-500 transition cursor-pointer relative bg-gray-50">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    accept="image/*"
                    multiple
                    onChange={uploadImages}
                  />
                  <FaCloudUploadAlt className="mx-auto text-4xl text-indigo-500 " />
                  <p className="text-gray-600">
                    {/* اسحب وأسقط الصور هنا، أو انقر للتصفح */}
                    Click or drag files to upload
                  </p>
                  <p className="text-xs text-gray-400 my-1">
                    {/* يفضل: شعار مربع، بحد أقصى 2MB لكل صورة (JPEG, PNG, WEBP) */}
                    Supports: JPG, PNG, GIF
                  </p>
                </div>
                {isUploading && (
                  <div className="flex items-center justify-center p-4">
                    <Spinner />
                    <span className="ml-2 text-gray-500">جاري الرفع...</span>
                  </div>
                )}
              </div>

              {images.length > 0 && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    الصور المرفوعة (اسحب لإعادة الترتيب)
                  </label>
                  <ReactSortable
                    list={images}
                    setList={updateImagesOrder}
                    className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {images.map((img, index) => (
                      <div
                        key={img}
                        className="relative group transition-transform hover:scale-105"
                      >
                        <img
                          src={img}
                          alt="University"
                          className="w-24 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                          aria-label={`حذف الصورة ${index + 1}`}
                        >
                          <FaTrash size={12} />
                        </button>
                      </div>
                    ))}
                  </ReactSortable>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4">
                <div className="space-y-1">
                  <label
                    htmlFor="timesRanking"
                    className="block text-xs font-medium text-gray-500"
                  >
                    تصنيف التايمز
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="timesRanking"
                      placeholder="التصنيف"
                      className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-left"
                      value={timesRanking}
                      onChange={(ev) => setTimesRanking(ev.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-xs">#</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="cwurRanking"
                    className="block text-xs font-medium text-gray-500"
                  >
                    تصنيف CWUR
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="cwurRanking"
                      placeholder="التصنيف"
                      className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-left"
                      value={cwurRanking}
                      onChange={(ev) => setCwurRanking(ev.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-xs">#</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="shanghaiRanking"
                    className="block text-xs font-medium text-gray-500"
                  >
                    تصنيف شنغهاي
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="shanghaiRanking"
                      placeholder="التصنيف"
                      className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-left"
                      value={shanghaiRanking}
                      onChange={(ev) => setShanghaiRanking(ev.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-xs">#</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="qsRanking"
                    className="block text-xs font-medium text-gray-500"
                  >
                    تصنيف QS
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <input
                      type="number"
                      id="qsRanking"
                      placeholder="التصنيف"
                      className="block w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-left"
                      value={qsRanking}
                      onChange={(ev) => setQsRanking(ev.target.value)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <span className="text-gray-500 text-xs">#</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Colleges Tab */}
          {activeTab === "colleges" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  كليات الجامعة
                </h3>
              </div>

              {/* Search Bar for Colleges */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن كلية..."
                  value={collegeSearchQuery}
                  onChange={(e) => setCollegeSearchQuery(e.target.value)}
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

              {isLoadingColleges ? (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : filteredAvailableColleges.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <MdSchool className="mx-auto text-4xl text-gray-400 mb-3" />
                  <p className="text-gray-500">
                    {collegeSearchQuery
                      ? "لا توجد نتائج للبحث"
                      : "لا توجد كليات متاحة"}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
                  {filteredAvailableColleges.map((college) => {
                    const isSelected = selectedColleges.some(
                      (c) => c.collegeId === college._id
                    );
                    return (
                      <div
                        key={college._id}
                        className={`p-2 border rounded-lg transition-all cursor-pointer ${
                          isSelected
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                        }`}
                        onClick={() => handleCollegeSelection(college)}
                      >
                        <div className="flex items-start gap-1">
                          <div className="flex-shrink-0 mt-1">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCollegeSelection(college)}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm text-gray-900">
                              {college.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {college.sector}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedColleges.length > 0 && (
                <div className="mt-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">
                      الكليات المحددة ({selectedColleges.length})
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      حدد نسبة قبول البكالوريوس (0 - 100) واختر تقييمات
                      الماجستير والدكتوراه لكل كلية.
                    </p>
                  </div>
                  <div className="space-y-4">
                    {selectedColleges.map((college) => (
                      <div
                        key={college.collegeId}
                        className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                          <div>
                            <h5 className="text-sm font-semibold text-gray-900">
                              {college.collegeName}
                            </h5>
                            {/* <p className="text-xs text-gray-500">
                              معرف الكلية: {college.collegeId}
                            </p> */}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleCollegeSelection({
                                _id: college.collegeId,
                                name: college.collegeName,
                              })
                            }
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                          >
                            إزالة
                            <FaTimes className="ml-1 h-3 w-3" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              نسبة البكالوريوس (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="مثال: 85"
                              value={college.bachelorRate}
                              onChange={(e) =>
                                handleSelectedCollegeChange(
                                  college.collegeId,
                                  "bachelorRate",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              تقييم الماجستير
                            </label>
                            <select
                              value={college.masterRate}
                              onChange={(e) =>
                                handleSelectedCollegeChange(
                                  college.collegeId,
                                  "masterRate",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                            >
                              <option value="">اختر التقييم</option>
                              {gradeOptions.map((grade) => (
                                <option key={grade} value={grade}>
                                  {grade}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">
                              تقييم الدكتوراه
                            </label>
                            <select
                              value={college.doctorateRate}
                              onChange={(e) =>
                                handleSelectedCollegeChange(
                                  college.collegeId,
                                  "doctorateRate",
                                  e.target.value
                                )
                              }
                              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
                            >
                              <option value="">اختر التقييم</option>
                              {gradeOptions.map((grade) => (
                                <option key={grade} value={grade}>
                                  {grade}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* University Conditions Tab */}
          {activeTab === "conditions" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">
                  شروط الجامعة
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    شروط القبول والمتطلبات
                  </label>
                  <textarea
                    rows={8}
                    placeholder="اكتب شروط الجامعة ومتطلبات القبول..."
                    value={universityConditions}
                    onChange={(ev) => setUniversityConditions(ev.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right resize-vertical"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    يمكنك كتابة شروط القبول، المتطلبات، الرسوم الدراسية، وغيرها
                    من المعلومات المهمة
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="relative">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                الحالة <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                value={status}
                onChange={(ev) => setStatus(ev.target.value)}
                className="block w-40 pl-3 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-right"
                required
              >
                <option value="">اختر الحالة</option>
                <option value="draft">مسودة</option>
                <option value="publish">نشر</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => router.push("/universities")}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                حفظ الجامعة
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
