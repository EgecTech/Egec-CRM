import Dataloading from "@/components/Dataloading";
import useFetchData from "@/hooks/useFetchData";
import Link from "next/link";
import { useState } from "react";
import { SiBloglovin } from "react-icons/si";
import { FaEdit } from "react-icons/fa";
import { RiDeleteBin6Fill } from "react-icons/ri";

export default function draftprojects() {
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allData, loading } = useFetchData("/api/projects");

  // تصفية البيانات بناءً على البحث
  const filteredBlogs =
    searchQuery.trim() === ""
      ? allData
      : allData.filter((blog) =>
          blog.title.toLowerCase().includes(searchQuery.toLowerCase())
        );

  // حساب عدد المدونات بعد التصفية
  const allBlog = filteredBlogs.length;

  // تحديد المدونات لعرضها في الصفحة الحالية
  const indexOfFirstBlog = (currentPage - 1) * perPage;
  const indexOfLastBlog = currentPage * perPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstBlog, indexOfLastBlog);

  // تصفية المدونات المنشورة فقط
  const publishedBlogs = currentBlogs.filter((ab) => ab.status === "draft");

  // إنشاء أرقام الصفحات
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(allBlog / perPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <>
      <div className="relative h-full p-8">
        <div className="titledashboard flex flex-sb">
          <div>
            <h2>
              All Published <span>Projects</span>
            </h2>
            <h3>ADMIN PANEL</h3>
          </div>
          <div className="breadcrumb">
            <SiBloglovin /> <span>/</span>
            <span>Addblog</span>
          </div>
        </div>
        <div className="blogstable">
          <div className="flex gap-2 mb-1">
            <h2>Search Projects:</h2>
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
                <th className="px-5 py-3 text-center">Image</th>
                <th className="px-5 py-3">Title</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-300">
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-6">
                    <Dataloading />
                  </td>
                </tr>
              ) : publishedBlogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-6 text-gray-500">
                    No Projects Found
                  </td>
                </tr>
              ) : (
                publishedBlogs.map((blog, index) => (
                  <tr
                    key={blog._id}
                    className="hover:bg-gray-100 transition duration-200"
                  >
                    <td className="px-5 py-4 text-center font-medium text-gray-700">
                      {indexOfFirstBlog + index + 1}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <img
                        src={blog.images[0]}
                        alt={blog.title}
                        className="w-16 h-16 object-cover rounded-md shadow-sm"
                      />
                    </td>
                    <td className="px-5 py-4 text-gray-800 font-semibold">
                      {blog.title}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <div className="flex justify-center space-x-3">
                        <Link href={`/projects/edit/${blog._id}`}>
                          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm shadow-sm flex items-center">
                            <FaEdit className="mr-1" /> Edit
                          </button>
                        </Link>
                        <Link href={`/projects/delete/${blog._id}`}>
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
        </div>
      </div>
    </>
  );
}
