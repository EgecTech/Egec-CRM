import Dataloading from "@/components/Dataloading";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import { useState } from "react";
import { SiBloglovin } from "react-icons/si";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import { FaEye } from "react-icons/fa6";

export default function contacts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allData, loading } = useFetchData("/api/contacts");

  const paginate = (pageNumbers) => {
    setCurrentPage(pageNumbers);
  };
  // تصفية البيانات بناءً على البحث
  const filteredProjects =
    searchQuery.trim() === ""
      ? allData
      : allData.filter((project) =>
          project.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

  // حساب عدد المدونات بعد التصفية
  const allProject = filteredProjects.length;

  // تحديد المدونات لعرضها في الصفحة الحالية
  const indexOfFirstProject = (currentPage - 1) * perPage;
  const indexOfLastProject = currentPage * perPage;
  const currentProjects = filteredProjects.slice(
    indexOfFirstProject,
    indexOfLastProject
  );

  // تصفية المدونات المنشورة فقط
  const publishedProjexts = currentProjects;

  // إنشاء أرقام الصفحات
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(allProject / perPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <div className="relative h-full p-8">
        <div className="titledashboard flex flex-sb">
          <div>
            <h2>
              All Published <span>Contacts</span>
            </h2>
            <h3>ADMIN PANEL</h3>
          </div>
          <div className="breadcrumb">
            <SiBloglovin /> <span>/</span>
            <span>Add Contact</span>
          </div>
        </div>
        <div className="blogstable">
          <div className="flex gap-2 mb-1">
            <h2>Search Contacts:</h2>
            <input
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <table className="w-full border border-gray-300 rounded-lg shadow-md overflow-hidden">
            <thead className="bg-gray-200 text-gray-700 text-left">
              <tr className="border-b border-gray-300">
                <th className="px-5 py-3 text-center w-12">#</th>
                <th className="px-5 py-3 text-center">First Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Phone No</th>
                <th className="px-5 py-3 ">Project</th>
                <th className="px-5 py-3 ">Open Contact</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-6">
                    <Dataloading />
                  </td>
                </tr>
              ) : publishedProjexts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-500">
                    No Contacts Found
                  </td>
                </tr>
              ) : (
                publishedProjexts.map((project, index) => (
                  <tr
                    key={project._id}
                    className="hover:bg-gray-100 transition duration-200"
                  >
                    <td className="px-5 py-4 text-center font-medium text-gray-700">
                      {indexOfFirstProject + index + 1}
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-semibold text-center">
                      <h3>{project.name}</h3>
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-semibold text-center">
                      <h3>{project.email}</h3>
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-semibold text-center">
                      <h3>{project.phone}</h3>
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-semibold text-center">
                      <h3>{project.project[0]}</h3>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center space-x-3">
                        <Link href={`/contacts/view/${project._id}`}>
                          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm shadow-sm flex items-center">
                            <FaEye className="mr-1" /> View
                          </button>
                        </Link>
                        {/* <Link href={`/projects/delete/${project._id}`}>
                          <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm shadow-sm flex items-center">
                            <RiDeleteBin6Fill className="mr-1" /> Delete
                          </button>
                        </Link> */}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {publishedProjexts.length === 0 ? (
            ""
          ) : (
            <div className="blogpagination">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              {pageNumbers
                .slice(
                  Math.max(currentPage - 3, 0),
                  Math.min(currentPage + 2, pageNumbers.length)
                )
                .map((number) => (
                  <button
                    key={number}
                    onClick={() => paginate(number)}
                    className={`${currentPage === number ? "active" : ""}`}
                  >
                    {number}
                  </button>
                ))}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentProjects.length < perPage}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
