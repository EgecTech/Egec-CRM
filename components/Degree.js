import ReactMarkdown from "react-markdown";
import MarkdownEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import toast from "react-hot-toast";
import { FaPlus, FaTrash } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";

export default function Degree({
  _id,
  name: existingName,
  studyConditions: existingStudyConditions,
  documentsRequired: existingDocumentsRequired,
  status: existingStatus,
  certificates: existingCertificates,
}) {
  const [redirect, setRedirect] = useState(false);
  const router = useRouter();

  const [name, setName] = useState(existingName || "");
  const [studyConditions, setStudyConditions] = useState(
    existingStudyConditions || ""
  );
  const [documentsRequired, setDocumentsRequired] = useState(
    existingDocumentsRequired || ""
  );
  const [status, setStatus] = useState(existingStatus || "");
  const [certificates, setCertificates] = useState(
    existingCertificates?.map((cert) => ({
      certificatesName: cert.certificatesName || "",
      certificatesCountry: cert.certificatesCountry || "",
      certificatesNationality: cert.certificatesNationality || "",
      certificatesConditions: cert.certificatesConditions || "",
      colleges: cert.colleges || [],
    })) || []
  );
  const [collegesOptions, setCollegesOptions] = useState([]);
  const [collegesLoading, setCollegesLoading] = useState(false);
  const [collegesError, setCollegesError] = useState("");
  const [collegeSearchTerms, setCollegeSearchTerms] = useState(
    (existingCertificates || []).map(() => "")
  );

  const arabCountries = [
    "مصر",
    "السعودية",
    "الإمارات",
    "الكويت",
    "قطر",
    "البحرين",
    "عمان",
    "اليمن",
    "الأردن",
    "سوريا",
    "لبنان",
    "فلسطين",
    "العراق",
    "ليبيا",
    "السودان",
    "المغرب",
    "الجزائر",
    "تونس",
    "موريتانيا",
    "جزر القمر",
    "الصومال",
    "جيبوتي",
    "إثيوبيا",
    "توغو",
    "نيجيريا",
    "غانا",
    "سيراليون",
    "غامبيا",
    "غينيا",
    "السنغال",
    "بوركينا فاسو (فولتا العليا)",
    "كوت ديفوار (ساحل العاج)",
    "مالاوي",
    "بنين",
    "جنوب أفريقيا",
    "كينيا",
    "أوغندا",
    "تنزانيا",
    "الكونغو (برازافيل)",
    "الكونغو (كينشاسا)",
    "تشاد",
    "مدغشقر",
    "مالي",
    "رواندا",
    "الكاميرون",
    "النيجر",
    "الغابون",
    "جنوب السودان",
    "أفغانستان",
    "الملايو",
    "سريلانكا (سيلان)",
    "باكستان",
    "ماليزيا",
    "نيبال",
    "ميانمار (بورما)",
    "إيران",
    "كوريا الجنوبية",
    "الهند",
    "الفلبين",
    "اليابان",
    "بنغلاديش",
    "إندونيسيا",
    "تايلاند",
    "الصين",
    "تركيا",
    "روسيا ودول الكومنولث",
    "بريطانيا",
    "اسكتلندا",
    "إيطاليا",
    "هولندا",
    "السويد",
    "اليونان",
    "الدنمارك",
    "قبرص",
    "يوغوسلافيا (سابقًا)",
    "صربيا",
    "مالطا",
    "بولندا",
    "المجر",
    "رومانيا",
    "بلجيكا ولوكسمبورغ",
    "النمسا",
    "التشيك وسلوفاكيا",
    "ألمانيا",
    "بلغاريا",
    "فنلندا",
    "سويسرا",
    "فرنسا",
    "أيرلندا",
    "إسبانيا",
    "نيوزيلندا",
    "أستراليا",
    "الولايات المتحدة الأمريكية",
    "الإكوادور",
    "بنما",
    "المكسيك",
    "كندا",
    "فنزويلا",
    "كولومبيا",
    "البرازيل",
    "تشيلي",
    "بيرو",
    "السلفادور",
  ];

  const certificateNationalities = [
    "مصرية",
    "سعودية",
    "إماراتية",
    "كويتية",
    "قطرية",
    "بحرينية",
    "عمانية",
    "يمنية",
    "أردنية",
    "سورية",
    "لبنانية",
    "فلسطينية",
    "عراقية",
    "ليبية",
    "سودانية",
    "مغربية",
    "جزائرية",
    "تونسية",
    "موريتانية",
    "قمرية",
    "صومالية",
    "جيبوتية",
    "إثيوبية",
    "توغولية",
    "نيجيرية",
    "غانية",
    "سيراليونية",
    "غامبية",
    "غينية",
    "سنغالية",
    "بوركينية",
    "إيفوارية",
    "مالاوية",
    "بنينية",
    "جنوب أفريقية",
    "كينية",
    "أوغندية",
    "تنزانية",
    "كونغولية (برازافيلية)",
    "كونغولية (كينشاسية)",
    "تشادية",
    "ملغاشية",
    "مالية",
    "رواندية",
    "كاميرونية",
    "نيجرية",
    "غابونية",
    "جنوب سودانية",
    "أفغانية",
    "ملايوية",
    "سريلانكية",
    "باكستانية",
    "ماليزية",
    "نيبالية",
    "ميانمارية",
    "إيرانية",
    "كورية",
    "هندية",
    "فلبينية",
    "يابانية",
    "بنغلاديشية",
    "إندونيسية",
    "تايلاندية",
    "صينية",
    "تركية",
    "روسية",
    "بريطانية",
    "اسكتلندية",
    "إيطالية",
    "هولندية",
    "سويدية",
    "يونانية",
    "دنماركية",
    "قبرصية",
    "يوغوسلافية",
    "صربية",
    "مالطية",
    "بولندية",
    "مجرية",
    "رومانية",
    "بلجيكية",
    "لوكسمبورغية",
    "نمساوية",
    "تشيكية",
    "سلوفاكية",
    "ألمانية",
    "بلغارية",
    "فنلندية",
    "سويسرية",
    "فرنسية",
    "أيرلندية",
    "إسبانية",
    "نيوزيلندية",
    "أسترالية",
    "أمريكية",
    "إكوادورية",
    "بنمية",
    "مكسيكية",
    "كندية",
    "فنزويلية",
    "كولومبية",
    "برازيلية",
    "تشييلية",
    "بيروفية",
    "سلفادورية",
    "أجنبية",
  ];

  useEffect(() => {
    let isMounted = true;

    async function fetchColleges() {
      setCollegesLoading(true);
      setCollegesError("");
      try {
        const response = await axios.get("/api/colleges");
        if (isMounted) {
          setCollegesOptions(response.data || []);
          setCollegesError("");
        }
      } catch (error) {
        console.error(
          "Error fetching colleges:",
          error.response?.data || error.message
        );
        setCollegesError("Failed to load colleges list");
        toast.error("Failed to load colleges list");
      } finally {
        if (isMounted) {
          setCollegesLoading(false);
        }
      }
    }

    fetchColleges();

    return () => {
      isMounted = false;
    };
  }, []);

  async function createDegree(ev) {
    ev.preventDefault();

    if (!name || !status) {
      toast.error("Please fill in all required fields!");
      return;
    }

    const data = {
      name,
      studyConditions,
      documentsRequired,
      status,
      certificates: certificates.map((cert) => ({
        certificatesName: cert.certificatesName,
        certificatesCountry: cert.certificatesCountry,
        certificatesNationality: cert.certificatesNationality,
        certificatesConditions: cert.certificatesConditions,
        colleges:
          cert.colleges?.map((college) => ({
            collegeId: college.collegeId,
            collegeName: college.collegeName,
          })) || [],
      })),
    };

    try {
      if (_id) {
        await axios.put("/api/degrees", { ...data, _id });
        toast.success("Degree Updated Successfully");
      } else {
        await axios.post("/api/degrees", data);
        toast.success("Degree Created Successfully");
      }
      setRedirect(true);
    } catch (error) {
      console.error(
        "Error creating/updating Degree:",
        error.response?.data || error.message
      );
      toast.error("An error occurred while saving the Degree.");
    }
  }

  const addCertificate = () => {
    setCertificates([
      ...certificates,
      {
        certificatesName: "",
        certificatesCountry: "",
        certificatesNationality: "",
        certificatesConditions: "",
        colleges: [],
      },
    ]);
    setCollegeSearchTerms((prev) => [...prev, ""]);
  };

  const removeCertificate = (index) => {
    const newCertificates = [...certificates];
    newCertificates.splice(index, 1);
    setCertificates(newCertificates);
    setCollegeSearchTerms((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  const updateCertificate = (index, field, value) => {
    const newCertificates = [...certificates];
    newCertificates[index][field] = value;
    setCertificates(newCertificates);
  };

  const toggleCertificateCollege = (certificateIndex, college) => {
    setCertificates((prev) => {
      const updated = [...prev];
      const currentCertificate = { ...updated[certificateIndex] };
      const currentColleges = currentCertificate.colleges || [];
      const exists = currentColleges.some((c) => c.collegeId === college._id);

      currentCertificate.colleges = exists
        ? currentColleges.filter((c) => c.collegeId !== college._id)
        : [
            ...currentColleges,
            { collegeId: college._id, collegeName: college.name },
          ];

      updated[certificateIndex] = currentCertificate;
      return updated;
    });
  };

  const handleCollegeSearchChange = (index, value) => {
    setCollegeSearchTerms((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  if (redirect) {
    router.push("/degrees");
    return null;
  }

  const renderMarkdownEditor = (value, setValue, label) => (
    <div className="w-full flex flex-col mb-6">
      <label className="mb-2 font-medium text-gray-800">{label}</label>
      <MarkdownEditor
        value={value}
        onChange={(ev) => setValue(ev.text)}
        style={{ width: "100%", height: "300px" }}
        renderHTML={(text) => (
          <ReactMarkdown
            components={{
              code: ({ inline, children }) =>
                inline ? (
                  <code>{children}</code>
                ) : (
                  <pre className="bg-gray-100 p-4 rounded overflow-auto relative">
                    <code>{children}</code>
                    <button
                      className="absolute top-2 right-2 bg-black text-white text-xs px-2 py-1 rounded"
                      onClick={() =>
                        navigator.clipboard.writeText(children?.[0] || "")
                      }
                    >
                      Copy
                    </button>
                  </pre>
                ),
            }}
          >
            {text}
          </ReactMarkdown>
        )}
      />
    </div>
  );

  return (
    <form
      onSubmit={createDegree}
      className="bg-white shadow-md rounded-2xl p-8 max-w-4xl mx-auto my-6"
    >
      <h2 className="text-2xl font-bold text-indigo-600 mb-6">
        {_id ? "Edit Degree" : "Create Degree"}
      </h2>

      {/* Degree Name */}
      <div className="mb-6">
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Degree Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter degree name"
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
      </div>

      {/* Study Conditions */}
      {renderMarkdownEditor(
        studyConditions,
        setStudyConditions,
        `Study Conditions for ${name || "the degree"}`
      )}

      {/* Documents Required */}
      {renderMarkdownEditor(
        documentsRequired,
        setDocumentsRequired,
        `Required Documents for ${name || "the degree"}`
      )}

      {/* Certificates Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Certificates</h3>
          {/* <button
            type="button"
            onClick={addCertificate}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FaPlus className="mr-2" />
            Add Certificate
          </button> */}
        </div>

        {certificates.length === 0 ? (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No certificates added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {certificates.map((cert, index) => {
              const selectedColleges = cert.colleges || [];
              const searchTerm = collegeSearchTerms[index] || "";
              const normalizedSearch = searchTerm.trim().toLowerCase();
              const filteredColleges =
                normalizedSearch.length === 0
                  ? collegesOptions
                  : collegesOptions.filter((college) =>
                      college.name.toLowerCase().includes(normalizedSearch)
                    );

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Certificate Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Certificate Name
                      </label>
                      <input
                        type="text"
                        value={cert.certificatesName}
                        onChange={(e) =>
                          updateCertificate(
                            index,
                            "certificatesName",
                            e.target.value
                          )
                        }
                        placeholder="Certificate name"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      />
                    </div>

                    {/* Certificate Country */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country
                      </label>
                      <select
                        value={cert.certificatesCountry}
                        onChange={(e) =>
                          updateCertificate(
                            index,
                            "certificatesCountry",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select country</option>
                        {arabCountries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Certificate Nationality */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nationality
                      </label>
                      <select
                        value={cert.certificatesNationality}
                        onChange={(e) =>
                          updateCertificate(
                            index,
                            "certificatesNationality",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        required
                      >
                        <option value="">Select nationality</option>
                        {certificateNationalities.map((nationality) => (
                          <option key={nationality} value={nationality}>
                            {nationality}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Certificate Conditions */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Conditions
                      </label>
                      <textarea
                        value={cert.certificatesConditions}
                        onChange={(e) =>
                          updateCertificate(
                            index,
                            "certificatesConditions",
                            e.target.value
                          )
                        }
                        placeholder="Certificate conditions (1-2 lines)"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        rows="2"
                        required
                      />
                    </div>

                    {/* Colleges Selection */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Eligible Colleges
                      </label>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) =>
                          handleCollegeSearchChange(index, e.target.value)
                        }
                        placeholder="Search colleges..."
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      {collegesLoading ? (
                        <div className="text-sm text-gray-500">
                          Loading colleges...
                        </div>
                      ) : collegesError ? (
                        <div className="text-sm text-red-600">
                          {collegesError}
                        </div>
                      ) : collegesOptions.length === 0 ? (
                        <div className="text-sm text-gray-500">
                          No colleges available. Please add colleges first.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            {selectedColleges.length === 0 ? (
                              <span className="text-sm text-gray-500">
                                No colleges selected yet.
                              </span>
                            ) : (
                              selectedColleges.map((college) => (
                                <span
                                  key={college.collegeId}
                                  className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full"
                                >
                                  {college.collegeName}
                                </span>
                              ))
                            )}
                          </div>
                          {filteredColleges.length === 0 ? (
                            <div className="text-sm text-gray-500">
                              No colleges match “{searchTerm}”.
                            </div>
                          ) : (
                            <div className="border border-gray-200 rounded-lg max-h-56 overflow-y-auto divide-y divide-gray-100">
                              {filteredColleges.map((college) => {
                                const isSelected = selectedColleges.some(
                                  (selected) =>
                                    selected.collegeId === college._id
                                );
                                return (
                                  <label
                                    key={college._id}
                                    className="flex items-center gap-3 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50"
                                  >
                                    <input
                                      type="checkbox"
                                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                      checked={isSelected}
                                      onChange={() =>
                                        toggleCertificateCollege(index, college)
                                      }
                                    />
                                    <span>{college.name}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Remove Certificate Button */}
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => removeCertificate(index)}
                      className="flex items-center px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      <FaTrash className="mr-1" />
                      Remove Certificate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={addCertificate}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            <FaPlus className="mr-2" />
            Add Certificate
          </button>
        </div>
      </div>

      {/* Status */}
      <div className="mb-6">
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        >
          <option value="">Select status</option>
          <option value="publish">Publish</option>
        </select>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition duration-300"
      >
        {_id ? "Update Degree" : "Save Degree"}
      </button>
    </form>
  );
}
