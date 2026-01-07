// pages/specializations/edit/[...id].js
import Head from "next/head";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SiBloglovin } from "react-icons/si";
import LoginLayout from "@/components/LoginLayout";
import Specialization from "@/components/specialization";

export default function EditSpecialization() {
  const router = useRouter();
  const { id } = router.query;
  const [specializationInfo, setSpecializationInfo] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios.get("/api/specializations?id=" + id).then((response) => {
      setSpecializationInfo(response.data);
    });
  }, [id]);

  return (
    <LoginLayout>
      <Head>
        <title>Edit Specialization</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Edit{" "}
              <span className="text-indigo-600">
                {specializationInfo?.name}
              </span>
            </h1>
            <p className="text-sm text-gray-500">ADMIN PANEL</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SiBloglovin className="text-lg" />
            <span>/ Edit Specialization</span>
          </div>
        </div>

        <div className="">
          {specializationInfo && <Specialization {...specializationInfo} />}
        </div>
      </div>
    </LoginLayout>
  );
}
