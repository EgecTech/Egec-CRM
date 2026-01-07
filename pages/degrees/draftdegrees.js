import Dataloading from "@/components/Dataloading";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import { useState } from "react";
import { SiBloglovin } from "react-icons/si";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import LoginLayout from "@/components/LoginLayout";

export default function draftdegrees() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allData, loading } = useFetchData("/api/specializations");

  const paginate = (pageNumbers) => {
    setCurrentPage(pageNumbers);
  };
  const filteredSpecializations =
    searchQuery.trim() === ""
      ? allData
      : allData.filter((specialization) =>
          specialization.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  const allSpecialization = filteredSpecializations.length;

  const indexOfFirstSpecialization = (currentPage - 1) * perPage;
  const indexOfLastSpecialization = currentPage * perPage;
  const currentSpecializations = filteredSpecializations.slice(
    indexOfFirstSpecialization,
    indexOfLastSpecialization
  );

  const publishedSpecializations = currentSpecializations.filter(
    (ab) => ab.status === "draft"
  );

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(allSpecialization / perPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <LoginLayout>
        <div className="relative h-full p-8">
          <div className="titledashboard flex flex-sb items-center">
            <div>
              <h2>
                All Published <span>Specializations</span>
              </h2>
              <h3>ADMIN PANEL</h3>
            </div>
            <div className="breadcrumb">
              <SiBloglovin /> <span>/</span>
              <span>AddSpecializations</span>
            </div>
          </div>
          <div className="blogstable">
            <div className="flex gap-2 mb-1 items-center">
              <h2>Search Specializations:</h2>
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
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">places Num</th>
                  <th className="px-5 py-3">Specialization Type</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-300">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6">
                      <Dataloading />
                    </td>
                  </tr>
                ) : publishedSpecializations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-gray-500">
                      No Specializations Found
                    </td>
                  </tr>
                ) : (
                  publishedSpecializations.map((specialization, index) => (
                    <tr
                      key={specialization._id}
                      className="hover:bg-gray-100 transition duration-200"
                    >
                      <td className="px-5 py-4 text-center font-medium text-gray-700">
                        {indexOfFirstSpecialization + index + 1}
                      </td>

                      <td className="px-5 py-4 text-gray-800 font-semibold">
                        {specialization.name}
                      </td>
                      <td className="px-5 py-4 text-gray-800 font-semibold">
                        {specialization.places.length}
                      </td>
                      <td className="px-5 py-4 text-gray-800 font-semibold">
                        {specialization.specializationType}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <div className="flex justify-center space-x-3 items-center">
                          <Link
                            href={`/specializations/edit/${specialization._id}`}
                          >
                            <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm shadow-sm flex items-center">
                              <FaEdit className="mr-1" /> Edit
                            </button>
                          </Link>
                          <Link
                            href={`/specializations/delete/${specialization._id}`}
                          >
                            <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md text-sm shadow-sm flex items-center">
                              <RiDeleteBin6Fill className="mr-1" /> Delete
                            </button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {publishedSpecializations.length === 0 ? (
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
                  disabled={currentSpecializations.length < perPage}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </LoginLayout>
    </>
  );
}
