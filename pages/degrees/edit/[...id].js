// pages/degrees/edit/[...id]
import Head from "next/head";
import axios from "axios";
import { useState, useEffect } from "react";
import { BsPostcard } from "react-icons/bs";
import { router, useRouter } from "next/router";
import LoginLayout from "@/components/LoginLayout";
import { SiBloglovin } from "react-icons/si";
import Degree from "@/components/Degree";

export default function EditDegree() {
  const router = useRouter();

  const { id } = router.query;
  const [degreeInfo, setDegreeInfo] = useState(null);
  // console.log(degreeInfo);

  useEffect(() => {
    if (!id) {
      return;
    } else {
      axios.get("/api/degrees?id=" + id).then((response) => {
        setDegreeInfo(response.data);
      });
    }
  }, [id]);

  return (
    <>
      <LoginLayout>
        <Head>
          <title>Update Degree</title>
        </Head>
        <div className="relative h-full p-8">
          <div className="titledashboard flex flex-sb">
            <div>
              <h2>
                Edit <span>{degreeInfo?.name}</span>
              </h2>
              <h3>ADMIN PANEL</h3>
            </div>
            <div className="breadcrumb">
              <SiBloglovin /> <span>/</span> <span>Edit Degree</span>
            </div>
          </div>
          <div className="mt-3">
            {degreeInfo && <Degree {...degreeInfo} />}{" "}
          </div>
        </div>
      </LoginLayout>
    </>
  );
}
