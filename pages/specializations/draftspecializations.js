// pages/specialization/draftspecialization.js
import Dataloading from "@/components/Dataloading";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import { useState } from "react";
import { SiBloglovin } from "react-icons/si";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import LoginLayout from "@/components/LoginLayout";

export default function DraftSpecializations() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allData, loading } = useFetchData("/api/specializations");

  const draftSpecializations = allData.filter((ab) => ab.status === "draft");

  const filteredSpecializations =
    searchQuery.trim() === ""
      ? draftSpecializations
      : draftSpecializations.filter((specialization) =>
          specialization.name.toLowerCase().includes(searchQuery.toLowerCase())
        );

  const totalDrafts = filteredSpecializations.length;
  const totalPages = Math.ceil(totalDrafts / perPage);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = totalPages - 3; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      pageNumbers.push(1);
      pageNumbers.push("...");
      for (let i = currentPage - 1; i <= currentPage + 1; i++) {
        pageNumbers.push(i);
      }
      pageNumbers.push("...");
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const indexOfFirst = (currentPage - 1) * perPage;
  const indexOfLast = currentPage * perPage;
  const currentSpecializations = filteredSpecializations.slice(
    indexOfFirst,
    indexOfLast
  );

  const paginate = (page) => setCurrentPage(page);

  return (
    <LoginLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              All <span className="text-indigo-600">Draft Specializations</span>
            </h1>
            <p className="text-sm text-gray-500">ADMIN PANEL</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SiBloglovin />
            <span>/ Draft Specializations</span>
          </div>
        </div>

        <div className="flex gap-2 mb-4 items-center text-sm">
          <label htmlFor="search" className="font-medium">
            Search Specializations:
          </label>
          <input
            id="search"
            type="text"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 px-3 py-1.5 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 w-full max-w-md"
          />
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr className="border-b border-gray-300">
                <th className="px-5 py-3 text-center w-12">#</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Places Num</th>
                <th className="px-5 py-3 text-left">Specialization Type</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6">
                    <Dataloading />
                  </td>
                </tr>
              ) : currentSpecializations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No Draft Specializations Found
                  </td>
                </tr>
              ) : (
                currentSpecializations.map((specialization, index) => (
                  <tr key={specialization._id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 text-center font-medium text-gray-700">
                      {indexOfFirst + index + 1}
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
                      <div className="flex justify-center gap-2">
                        <Link
                          href={`/specializations/edit/${specialization._id}`}
                        >
                          <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded shadow-sm text-sm">
                            <FaEdit /> Edit
                          </button>
                        </Link>
                        <Link
                          href={`/specializations/delete/${specialization._id}`}
                        >
                          <button className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded shadow-sm text-sm">
                            <RiDeleteBin6Fill /> Delete
                          </button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filteredSpecializations.length > perPage && (
          <div className="flex justify-center mt-6 space-x-1 text-sm">
            {currentPage > 1 && (
              <button
                onClick={() => paginate(currentPage - 1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                &larr; Prev
              </button>
            )}

            {getPageNumbers().map((num, index) =>
              num === "..." ? (
                <span key={`ellipsis-${index}`} className="px-3 py-1">
                  ...
                </span>
              ) : (
                <button
                  key={num}
                  onClick={() => paginate(num)}
                  className={`px-3 py-1 rounded ${
                    currentPage === num
                      ? "bg-yellow-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {num}
                </button>
              )
            )}

            {currentPage < totalPages && (
              <button
                onClick={() => paginate(currentPage + 1)}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Next &rarr;
              </button>
            )}
          </div>
        )}
      </div>
    </LoginLayout>
  );
}
