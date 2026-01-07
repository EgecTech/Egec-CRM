// pages/colleges/edit/[...id]
import Head from "next/head";
import axios from "axios";
import { useState, useEffect } from "react";
import { BsPostcard } from "react-icons/bs";
import { router, useRouter } from "next/router";
import LoginLayout from "@/components/LoginLayout";
import { SiBloglovin } from "react-icons/si";
import Loading from "@/components/Loading";
import { IoArrowBack } from "react-icons/io5";
import { toast } from "react-hot-toast";

export default function EditCollege() {
  const router = useRouter();
  const { id } = router.query;
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "draft",
  });

  useEffect(() => {
    if (id) {
      fetchCollege();
    }
  }, [id]);

  const fetchCollege = async () => {
    try {
      const res = await fetch(`/api/colleges/${id}`);
      if (!res.ok) throw new Error("Failed to fetch college");
      const data = await res.json();
      setFormData(data);
    } catch (err) {
      console.error("Error fetching college:", err);
      toast.error("Failed to fetch college data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/colleges/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to update college");

      toast.success("College updated successfully");
      router.push("/colleges");
    } catch (err) {
      console.error("Error updating college:", err);
      toast.error("Failed to update college");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <LoginLayout>
      <Head>
        <title>Update College</title>
      </Head>
      <div className="relative h-full p-8">
        <div className="titledashboard flex flex-sb">
          <div>
            <h2>
              Edit <span>{formData?.name}</span>
            </h2>
            <h3>ADMIN PANEL</h3>
          </div>
          <div className="breadcrumb">
            <SiBloglovin /> <span>/</span> <span>Edit College</span>
          </div>
        </div>
        <div className="mt-3">
          <form onSubmit={handleSubmit} className="max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                  rows="4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="publish">Publish</option>
                </select>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </LoginLayout>
  );
}
