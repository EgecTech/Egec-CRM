import Head from "next/head";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SiBloglovin } from "react-icons/si";
import LoginLayout from "@/components/LoginLayout";
import University from "@/components/University";

export default function EditUniversity() {
  const router = useRouter();
  const { id } = router.query;
  const [universityInfo, setUniversityInfo] = useState(null);

  useEffect(() => {
    if (!id) return;
    axios.get(`/api/universities/universities?id=${id}`).then((res) => {
      setUniversityInfo(res.data);
    });
  }, [id]);

  return (
    <LoginLayout>
      <Head>
        <title>Edit University</title>
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Edit{" "}
              <span className="text-indigo-600">{universityInfo?.name}</span>
            </h1>
            <p className="text-sm text-gray-500">ADMIN PANEL</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <SiBloglovin className="text-lg" />
            <span>/ Edit University</span>
          </div>
        </div>

        <div className="">
          {universityInfo && <University {...universityInfo} />}
        </div>
      </div>
    </LoginLayout>
  );
}
