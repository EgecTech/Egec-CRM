// pages/degrees/index.js
import Dataloading from "@/components/Dataloading";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import { useState } from "react";
import { SiBloglovin } from "react-icons/si";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import LoginLayout from "@/components/LoginLayout";

export default function DegreesPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(9);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allData, loading } = useFetchData("/api/degrees");

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const filteredDegrees =
    allData?.filter((degree) =>
      degree.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  const publishedDegrees = filteredDegrees.filter(
    (d) => d.status === "publish"
  );
  const total = publishedDegrees.length;

  const indexOfFirst = (currentPage - 1) * perPage;
  const indexOfLast = currentPage * perPage;
  const currentDegrees = publishedDegrees.slice(indexOfFirst, indexOfLast);

  const pageNumbers = Array.from(
    { length: Math.ceil(total / perPage) },
    (_, i) => i + 1
  );

  return (
    <LoginLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              All <span className="text-indigo-600">Degrees</span>
            </h1>
            <p className="text-sm text-gray-500">ADMIN PANEL</p>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <SiBloglovin /> <span>/ Degrees</span>
          </div>
        </div>

        {/* <div className="mb-4">
          <input
            type="text"
            placeholder="Search degrees by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-md p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:outline-none"
          />
        </div> */}

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="py-3 px-4 text-left">#</th>
                <th className="py-3 px-4 text-left">Name</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={3} className="text-center py-6">
                    <Dataloading />
                  </td>
                </tr>
              ) : currentDegrees.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    No Degrees Found
                  </td>
                </tr>
              ) : (
                currentDegrees.map((degree, index) => (
                  <tr key={degree._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-600">
                      {indexOfFirst + index + 1}
                    </td>
                    <td className="py-3 px-4 text-gray-800 font-semibold">
                      {degree.name}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Link href={`/degrees/edit/${degree._id}`}>
                          <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded shadow-sm">
                            <FaEdit /> Edit
                          </button>
                        </Link>

                        <Link href={`/degrees/delete/${degree._id}`}>
                          <button className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded shadow-sm">
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

        {pageNumbers.length > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Previous
            </button>
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`px-3 py-1 rounded ${
                  currentPage === number
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
              >
                {number}
              </button>
            ))}
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={indexOfLast >= total}
              className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </LoginLayout>
  );
}
