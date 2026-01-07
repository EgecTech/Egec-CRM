import Dataloading from "@/components/Dataloading";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SiBloglovin } from "react-icons/si";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";
import LoginLayout from "@/components/LoginLayout";

export default function DraftUniversities() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");

  const { data: allData, loading } = useFetchData(
    "/api/universities/universities"
  );

  // Function to print university names to console
  // const printUniversityNames = (universities) => {
  //   if (universities && universities.length > 0) {
  //     console.log("=== University Names and Countries ===");
  //     universities.forEach((uni, index) => {
  //       console.log(`${uni.country}`);
  //       console.log(`${""}`);
  //     });
  //     console.log("====================================");
  //   }
  // };

  // Call the function when data is loaded
  // useEffect(() => {
  //   if (allData && !loading) {
  //     printUniversityNames(allData);
  //   }
  // }, [allData, loading]);

  const paginate = (pageNumbers) => {
    setCurrentPage(pageNumbers);
  };

  // Get unique countries for the filter dropdown
  const uniqueCountries = [
    ...new Set(allData?.map((uni) => uni.country) || []),
  ];

  const filteredUniversities =
    allData?.filter((university) => {
      const matchesSearch = university.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCountry =
        selectedCountry === "" || university.country === selectedCountry;
      return matchesSearch && matchesCountry;
    }) || [];

  const allUniversity = filteredUniversities.length;
  const totalPages = Math.ceil(allUniversity / perPage);

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

  const indexOfFirstUniversity = (currentPage - 1) * perPage;
  const indexOfLastUniversity = currentPage * perPage;
  const currentUniversities = filteredUniversities.slice(
    indexOfFirstUniversity,
    indexOfLastUniversity
  );

  const publishedUniversities = currentUniversities.filter(
    (ab) => ab.status === "draft"
  );

  return (
    <LoginLayout>
      <div className="relative h-full p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              All Draft <span className="text-indigo-600">Universities</span>
            </h2>
            <h3 className="text-sm text-gray-500">ADMIN PANEL</h3>
          </div>
          <div className="flex items-center gap-1 text-gray-500 text-sm">
            <SiBloglovin />
            <span>/</span>
            <span>DraftUniversities</span>
          </div>
        </div>

        <div className="flex gap-4 mb-4 items-center text-sm">
          <div className="flex gap-2 items-center">
            <label htmlFor="search" className="font-medium">
              Search Universities:
            </label>
            <input
              id="search"
              type="text"
              placeholder="Search by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border border-gray-300 px-3 py-1.5 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500 w-full max-w-md"
            />
          </div>
          <div className="flex gap-2 items-center">
            <label htmlFor="country" className="font-medium">
              Filter by Country:
            </label>
            <select
              id="country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="border border-gray-300 px-3 py-1.5 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-yellow-500"
            >
              <option value="">All Countries</option>
              {uniqueCountries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr className="border-b border-gray-300">
                <th className="px-5 py-3 text-center w-12">#</th>
                <th className="px-5 py-3 text-center">Logo</th>
                <th className="px-5 py-3 text-left">Name</th>
                <th className="px-5 py-3 text-left">Country</th>
                <th className="px-5 py-3 text-left">College Num</th>
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
              ) : publishedUniversities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">
                    No Universities Found
                  </td>
                </tr>
              ) : (
                publishedUniversities.map((university, index) => (
                  <tr
                    key={university._id}
                    className="hover:bg-gray-50 transition duration-200"
                  >
                    <td className="px-5 py-4 text-center font-medium text-gray-700">
                      {indexOfFirstUniversity + index + 1}
                    </td>
                    {/* <td className="px-5 py-4 text-center">
                      <img
                        src={
                          university.images.length
                            ? university.images[0]
                            : "/img/egec.png"
                        }
                        alt={university.name}
                        className="w-16 h-16 object-cover rounded-md mx-auto"
                      />
                    </td> */}
                    <td className="px-5 py-4">
                      <div className="w-16 h-16 mx-auto rounded-md overflow-hidden border border-gray-200">
                        <img
                          src={
                            university.images.length
                              ? university.images[0]
                              : "/img/egec.png"
                          }
                          alt={university.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-semibold">
                      {university.name}
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-semibold">
                      {university.country}
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-semibold">
                      {university.colleges.length}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center space-x-2">
                        <Link href={`/universities/edit/${university._id}`}>
                          <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm shadow-sm flex items-center gap-1">
                            <FaEdit /> Edit
                          </button>
                        </Link>
                        <Link href={`/universities/delete/${university._id}`}>
                          <button className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-sm shadow-sm flex items-center gap-1">
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

        {publishedUniversities.length > 0 && (
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
